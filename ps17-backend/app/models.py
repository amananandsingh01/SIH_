from datetime import datetime, timezone
from sqlalchemy import Column, DateTime, Float, Integer, String
from sqlalchemy.orm import declarative_base

Base = declarative_base()

# raw network log
class RawTelemetry(Base):
    __tablename__ = "raw_telemetry"

    id = Column(Integer, primary_key=True, autoincrement=True)
    timestamp_utc = Column(DateTime, nullable=False)
    entity_id = Column(String, nullable=False, index=True)
    entity_type = Column(String)
    src_ip = Column(String)
    dest_ip = Column(String)
    dest_port = Column(Integer)
    bytes_up = Column(Integer)
    bytes_down = Column(Integer)
    raw_login_failures = Column(Integer)
    login_status = Column(String)

#normal behaviour
class EntityBaseline(Base):
    __tablename__ = "entity_baselines"

    entity_id = Column(String, primary_key=True)
    entity_type = Column(String)
    mu_bytes = Column(Float)
    sigma_bytes = Column(Float)
    last_updated = Column(DateTime, default=lambda: datetime.now(timezone.utc))

#Saves an entry whenever a suspicious activity occurs.
class Alert(Base):
    __tablename__ = "alerts"

    alert_id = Column(Integer, primary_key=True, autoincrement=True)
    entity_id = Column(String, nullable=False, index=True)
    timestamp_utc = Column(DateTime, nullable=False)
    final_risk_pct = Column(Float)
    threat_classification = Column(String)
    status = Column(String, default="open")
    debug_scores = Column(String)