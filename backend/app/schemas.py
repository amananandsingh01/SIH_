from datetime import datetime
from typing import Optional, Literal
from pydantic import BaseModel, ConfigDict

#Checks incoming data packets before letting them touch the rest of your system.

class TelemetryIn(BaseModel):
    timestamp_utc: datetime
    entity_id: str
    entity_type: Literal["lab_pc", "wifi_client", "admin_server"]
    src_ip: str
    dest_ip: str
    dest_port: int
    bytes_up: int
    bytes_down: int
    raw_login_failures: int = 0
    login_status: Literal["success", "fail"] = "success"


class IngestResult(BaseModel):
    telemetry_id: int
    scored: bool
    final_risk_pct: float
    alert_triggered: bool
    alert_id: Optional[int] = None
    debug_scores: dict


# Telemetry Output Schema
class TelemetryOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    timestamp_utc: datetime
    entity_id: str
    entity_type: Optional[str]
    src_ip: Optional[str]
    dest_ip: Optional[str]
    dest_port: Optional[int]
    bytes_up: Optional[int]
    bytes_down: Optional[int]
    raw_login_failures: Optional[int]
    login_status: Optional[str]


# Entity Baseline Schema
class BaselineOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    entity_id: str
    entity_type: Optional[str]
    mu_bytes: Optional[float]
    sigma_bytes: Optional[float]
    last_updated: Optional[datetime]


# Alert Schema (for Arpit's Dashboard)
class AlertOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    alert_id: int
    entity_id: str
    timestamp_utc: datetime
    final_risk_pct: Optional[float]
    threat_classification: Optional[str]
    status: Optional[str]
    debug_scores: Optional[str]


class AlertStatusUpdate(BaseModel):
    status: Literal["open", "acknowledged", "false_positive", "confirmed"]


# Summary Statistics Schema
class DashboardSummary(BaseModel):
    total_events: int
    total_alerts: int
    open_alerts: int
    acknowledged_alerts: int
    false_positive_alerts: int
    confirmed_alerts: int
    avg_risk_pct: float
    alerts_by_classification: dict


# Model Training Result Schema
class RetrainResult(BaseModel):
    trained: bool
    samples_used: int
    message: str