# Campus Network Anomaly Detection

Full-stack implementation of the ingest → dual-engine scoring → alert pipeline described
in the design doc: a FastAPI backend (`ps17-backend`) running on the exact three-table
SQLite schema (`raw_telemetry`, `entity_baselines`, `alerts`), paired with a Vite-based
dashboard frontend (`ps17-frontend`).

## Project structure

```
SIH_/
  ps17-backend/     # FastAPI service, scoring engine, SQLite DB
    app/
    venv/
    campus_ids.db
    seed_data.py
    requirements.txt
  ps17-frontend/     # Vite dashboard
    node_modules/
    src/
    index.html
    package.json
    package-lock.json
    vite.config.js
```

## Backend setup (`ps17-backend`)

```bash
cd ps17-backend
py -m venv venv
.\venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
```

For macOS/Linux, use `python3 -m venv venv`, `source venv/bin/activate`, and
`python -m pip install -r requirements.txt` from the `ps17-backend` directory.

### Run the API

```bash
uvicorn app.main:app --reload --port 8000
```

Interactive docs: `http://127.0.0.1:8000/docs`

The SQLite file (`campus_ids.db`) and tables are created automatically on startup.

### Seed sample data (optional)

```bash
python seed_data.py
```

## Frontend setup (`ps17-frontend`)

```bash
cd ps17-frontend
npm install
npm run dev
```

By default this serves the dashboard at `http://127.0.0.1:5173` and expects the backend
API to be running at `http://127.0.0.1:8000` (update the API base URL in `src/` if your
setup differs).

## Backend endpoints (matches section 5.2 of the design doc)

| Method | Path | Purpose |
|---|---|---|
| POST | `/ingest` | Write raw telemetry → fetch baseline → score (ML + statistical) → fuse → write alert if over threshold |
| GET | `/telemetry?entity_id=&limit=` | Raw feed for forensics |
| GET | `/alerts?status=open` | Alert list for dashboard |
| GET | `/alerts/{id}` | Full alert detail incl. `debug_scores` |
| POST | `/alerts/{id}/status` | Mark acknowledged / false_positive / confirmed |
| GET | `/baselines/{entity_id}` | Current learned baseline |
| POST | `/baselines/{entity_id}/recompute` | Recompute one entity's mu/sigma from history |
| POST | `/baselines/recompute-all` | Recompute all entities |
| GET | `/dashboard/summary` | Aggregate counts/trends for charts |
| POST | `/model/retrain` | Rebuild Isolation Forest from `raw_telemetry` |

## Scoring pipeline (section 5.3)

1. **Feature vector (ML input, 4 values):** `time_bucket`, `effective_logins = max(0, raw_login_failures - 3)`,
   `upload_ratio = bytes_up / (bytes_up + bytes_down)`, `port_risk_level` (0/1/2).
2. **ML engine:** scikit-learn `IsolationForest` trained via `/model/retrain`; falls back to a
   bounded heuristic before the first training run (cold start).
3. **Statistical engine:** z-score of `bytes_up` against the entity's `(mu_bytes, sigma_bytes)`,
   passed through a sigmoid → `s_stat_norm`.
4. **Rule override:** hard-coded flags (e.g. non-admin device hitting a restricted port, or
   ≥8 failed logins) force a high-risk floor.
5. **Fusion (Probabilistic OR):** `final_risk_pct = [1 - (1 - s_ml)(1 - s_stat)] × 100`, floored at
   95 if a rule override fired.
6. Rows scoring ≥ `ALERT_THRESHOLD_PCT` (default 60) are persisted to `alerts` with `debug_scores`
   as `{s_ml, s_stat, rule_override}` JSON, matching the schema exactly.

## Backend files

```
app/
  main.py        # FastAPI routes
  models.py      # SQLAlchemy models (3-table schema, verbatim from the doc)
  schemas.py     # Pydantic request/response models
  scoring.py     # Feature engineering, ML engine, statistical engine, fusion
  baselines.py   # Rolling mean/std computation per entity
  database.py    # Engine/session/init
test_run.py      # Exercises every endpoint via TestClient (no server needed)
```

## Testing the backend without a running server

```bash
cd ps17-backend
python test_run.py
```

This seeds 15 "normal" events for one entity, computes a real baseline, trains the model,
then injects the exact anomaly JSON sample from the design doc and confirms it scores high,
triggers a rule override, and produces an alert.

## Running both together

1. Start the backend (`uvicorn app.main:app --reload --port 8000`) from `ps17-backend`.
2. In a second terminal, start the frontend (`npm run dev`) from `ps17-frontend`.
3. Open the dashboard in your browser and confirm it's pulling from `/dashboard/summary`
   and `/alerts` on the backend.