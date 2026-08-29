import json
from typing import List
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from app.database import engine, get_db, init_db
from app import models, schemas
from app.baseline_engine import get_baseline, update_baseline_for_entity
from app.scoring_engine import calculate_risk_score

app = FastAPI(title="Campus IDS Anomaly Detection Backend", version="1.0")

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup():
    init_db()


@app.get("/")
def read_root():
    return {"status": "online", "message": "Campus IDS Backend API is running."}


# 1. Ingest & Score Telemetry Endpoint
@app.post("/api/telemetry", response_model=schemas.IngestResult)
def ingest_telemetry(data: schemas.TelemetryIn, db: Session = Depends(get_db)):
    # Save raw log to DB
    log = models.RawTelemetry(
        timestamp_utc=data.timestamp_utc,
        entity_id=data.entity_id,
        entity_type=data.entity_type,
        src_ip=data.src_ip,
        dest_ip=data.dest_ip,
        dest_port=data.dest_port,
        bytes_up=data.bytes_up,
        bytes_down=data.bytes_down,
        raw_login_failures=data.raw_login_failures,
        login_status=data.login_status,
    )
    db.add(log)
    db.commit()
    db.refresh(log)

    # Fetch baseline and calculate risk score
    baseline = get_baseline(db, data.entity_id)
    score_res = calculate_risk_score(data, baseline)

    final_risk = score_res["final_risk_pct"]
    classification = score_res["threat_classification"]
    debug = score_res["debug_scores"]

    # Trigger alert if risk is high (>= 50%)
    alert_triggered = False
    alert_id = None
    if final_risk >= 50.0:
        alert_triggered = True
        alert = models.Alert(
            entity_id=data.entity_id,
            timestamp_utc=data.timestamp_utc,
            final_risk_pct=final_risk,
            threat_classification=classification,
            status="open",
            debug_scores=json.dumps(debug),
        )
        db.add(alert)
        db.commit()
        db.refresh(alert)
        alert_id = alert.alert_id

    # Update dynamic baseline in background
    update_baseline_for_entity(db, data.entity_id)

    return {
        "telemetry_id": log.id,
        "scored": True,
        "final_risk_pct": final_risk,
        "alert_triggered": alert_triggered,
        "alert_id": alert_id,
        "debug_scores": debug,
    }


# 2. Alerts List Endpoint
@app.get("/api/alerts", response_model=List[schemas.AlertOut])
def list_alerts(db: Session = Depends(get_db)):
    return db.query(models.Alert).order_by(models.Alert.alert_id.desc()).all()


# 3. Update Alert Status Endpoint
@app.patch("/api/alerts/{alert_id}", response_model=schemas.AlertOut)
def update_alert_status(
    alert_id: int, payload: schemas.AlertStatusUpdate, db: Session = Depends(get_db)
):
    alert = db.query(models.Alert).filter(models.Alert.alert_id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")

    alert.status = payload.status
    db.commit()
    db.refresh(alert)
    return alert


# 4. Dashboard Metrics Endpoint
@app.get("/api/dashboard/summary", response_model=schemas.DashboardSummary)
def get_dashboard_summary(db: Session = Depends(get_db)):
    total_events = db.query(models.RawTelemetry).count()
    alerts = db.query(models.Alert).all()
    total_alerts = len(alerts)

    open_a = sum(1 for a in alerts if a.status == "open")
    ack_a = sum(1 for a in alerts if a.status == "acknowledged")
    fp_a = sum(1 for a in alerts if a.status == "false_positive")
    conf_a = sum(1 for a in alerts if a.status == "confirmed")

    avg_risk = (
        sum(a.final_risk_pct for a in alerts) / total_alerts if total_alerts > 0 else 0.0
    )

    classifications = {}
    for a in alerts:
        cls = a.threat_classification or "UNKNOWN"
        classifications[cls] = classifications.get(cls, 0) + 1

    return {
        "total_events": total_events,
        "total_alerts": total_alerts,
        "open_alerts": open_a,
        "acknowledged_alerts": ack_a,
        "false_positive_alerts": fp_a,
        "confirmed_alerts": conf_a,
        "avg_risk_pct": round(avg_risk, 2),
        "alerts_by_classification": classifications,
    }


# 5. Baselines Endpoint
@app.get("/api/baselines", response_model=List[schemas.BaselineOut])
def get_baselines(db: Session = Depends(get_db)):
    return db.query(models.EntityBaseline).all()