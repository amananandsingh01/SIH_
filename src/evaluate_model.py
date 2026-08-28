import pandas as pd

data = pd.read_csv("data/predictions.csv")

total_records = len(data)

detected_anomalies = (data["result"] == "ANOMALY").sum()

normal_records = (data["result"] == "NORMAL").sum()

# Our test dataset contains 2 intentionally injected anomalies
actual_anomalies = 2

detection_rate = (
    detected_anomalies / actual_anomalies
) * 100

print("========== MODEL EVALUATION ==========")

print("Total records:", total_records)
print("Normal records detected:", normal_records)
print("Anomalies detected:", detected_anomalies)
print("Actual simulated anomalies:", actual_anomalies)
print("Detection rate:", detection_rate, "%")

print("\nSuspicious records detected:")

print(data[data["result"] == "ANOMALY"][
    [
        "timestamp",
        "failed_logins",
        "port",
        "S_ml",
        "Risk_Level"
    ]
])