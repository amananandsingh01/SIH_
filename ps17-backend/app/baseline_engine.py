import numpy as np
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from app.models import RawTelemetry, EntityBaseline

#Keeps track of &quot;what is normal&quot; for every device.
def update_baseline_for_entity(db: Session, entity_id: str) -> EntityBaseline:
    records = (
        db.query(RawTelemetry)
        .filter(RawTelemetry.entity_id == entity_id)
        .all()
    )

    if not records:
        baseline = (
            db.query(EntityBaseline)
            .filter(EntityBaseline.entity_id == entity_id)
            .first()
        )
        if not baseline:
            baseline = EntityBaseline(
                entity_id=entity_id,
                entity_type="unknown",
                mu_bytes=0.0,
                sigma_bytes=1.0,
                last_updated=datetime.now(timezone.utc),
            )
            db.add(baseline)
            db.commit()
            db.refresh(baseline)
        return baseline

    bytes_list = [r.bytes_up + r.bytes_down for r in records]
    mu = float(np.mean(bytes_list))
    sigma = float(np.std(bytes_list))
    if sigma == 0:
        sigma = 1.0

    entity_type = records[-1].entity_type or "unknown"

    baseline = (
        db.query(EntityBaseline)
        .filter(EntityBaseline.entity_id == entity_id)
        .first()
    )
    if not baseline:
        baseline = EntityBaseline(
            entity_id=entity_id,
            entity_type=entity_type,
            mu_bytes=mu,
            sigma_bytes=sigma,
            last_updated=datetime.now(timezone.utc),
        )
        db.add(baseline)
    else:
        baseline.mu_bytes = mu
        baseline.sigma_bytes = sigma
        baseline.entity_type = entity_type
        baseline.last_updated = datetime.now(timezone.utc)

    db.commit()
    db.refresh(baseline)
    return baseline


def get_baseline(db: Session, entity_id: str) -> EntityBaseline:
    baseline = (
        db.query(EntityBaseline)
        .filter(EntityBaseline.entity_id == entity_id)
        .first()
    )
    if not baseline:
        baseline = update_baseline_for_entity(db, entity_id)
    return baseline