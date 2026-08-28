import time
import requests

BASE_URL = "http://127.0.0.1:8000/api/telemetry"

# Sample dataset: Normal traffic + Suspicious brute-force attacks
sample_events = [
    # Normal everyday traffic
    {
        "timestamp_utc": "2026-08-27T10:00:00Z",
        "entity_id": "lab_pc_01",
        "entity_type": "lab_pc",
        "src_ip": "192.168.1.10",
        "dest_ip": "10.0.0.1",
        "dest_port": 80,
        "bytes_up": 1200,
        "bytes_down": 4500,
        "raw_login_failures": 0,
        "login_status": "success",
    },
    {
        "timestamp_utc": "2026-08-27T10:05:00Z",
        "entity_id": "lab_pc_02",
        "entity_type": "lab_pc",
        "src_ip": "192.168.1.11",
        "dest_ip": "10.0.0.1",
        "dest_port": 443,
        "bytes_up": 3400,
        "bytes_down": 12000,
        "raw_login_failures": 0,
        "login_status": "success",
    },
    # High-Risk SSH Brute Force Attack
    {
        "timestamp_utc": "2026-08-27T10:10:00Z",
        "entity_id": "lab_pc_03",
        "entity_type": "lab_pc",
        "src_ip": "192.168.1.50",
        "dest_ip": "10.0.0.1",
        "dest_port": 22,
        "bytes_up": 85000,
        "bytes_down": 250000,
        "raw_login_failures": 8,
        "login_status": "fail",
    },
    # Suspicious Port Scan / High Bandwidth
    {
        "timestamp_utc": "2026-08-27T10:15:00Z",
        "entity_id": "server_01",
        "entity_type": "admin_server",
        "src_ip": "192.168.1.99",
        "dest_ip": "10.0.0.5",
        "dest_port": 3389,
        "bytes_up": 500000,
        "bytes_down": 1200000,
        "raw_login_failures": 4,
        "login_status": "fail",
    },
]

print("Sending sample network events to local server...")

for event in sample_events:
    response = requests.post(BASE_URL, json=event)
    if response.status_code == 200:
        res_data = response.json()
        print(
            f"[SUCCESS] Entity: {event['entity_id']} | Risk Score: {res_data.get('risk_score', 0)}% | Alert Generated: {res_data.get('alert_generated')}"
        )
    else:
        print(f"[ERROR] Failed to post data: {response.text}")
    time.sleep(0.5)

print("\nDatabase seeded successfully!")
