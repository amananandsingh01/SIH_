import math
from app.schemas import TelemetryIn
from app.models import EntityBaseline


def calculate_z_score(bytes_total: float, mu: float, sigma: float) -> float:
    if sigma <= 0:
        sigma = 1.0
    return (bytes_total - mu) / sigma


def calculate_risk_score(telemetry: TelemetryIn, baseline: EntityBaseline) -> dict:
    bytes_total = float(telemetry.bytes_up + telemetry.bytes_down)
    z_score = calculate_z_score(
        bytes_total, baseline.mu_bytes or 0.0, baseline.sigma_bytes or 1.0
    )

    # 1. Bandwidth Anomaly Score (0 to 40)
    if z_score <= 0:
        bandwidth_score = 0.0
    elif z_score >= 3.0:
        bandwidth_score = 40.0
    else:
        bandwidth_score = (z_score / 3.0) * 40.0

    # 2. Authentication Anomaly Score (0 to 35)
    login_score = min(telemetry.raw_login_failures * 7.0, 35.0)

    # 3. Destination Port Risk Score (0 to 25)
    suspicious_ports = {22, 23, 3389, 445, 8080}
    port_score = 25.0 if telemetry.dest_port in suspicious_ports else 5.0

    # Total Risk Percentage (0 to 100)
    raw_total = bandwidth_score + login_score + port_score
    final_risk_pct = round(min(max(raw_total, 0.0), 100.0), 2)

    # Classification Label
    if final_risk_pct >= 75:
        classification = "CRITICAL_ANOMALY"
    elif final_risk_pct >= 50:
        classification = "SUSPICIOUS_BEHAVIOR"
    elif final_risk_pct >= 25:
        classification = "ELEVATED_RISK"
    else:
        classification = "NORMAL"

    return {
        "final_risk_pct": final_risk_pct,
        "threat_classification": classification,
        "debug_scores": {
            "z_score": round(z_score, 2),
            "bandwidth_score": round(bandwidth_score, 2),
            "login_score": round(login_score, 2),
            "port_score": round(port_score, 2),
        },
    }