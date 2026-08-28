import pandas as pd
import joblib

# =====================================
# 1. FETCH DATA
# =====================================

data = pd.read_csv("data/network_data.csv")

data["timestamp"] = pd.to_datetime(data["timestamp"])

data = data.sort_values("timestamp", ascending=False)

data = data.head(50).copy()

print("Records fetched:", len(data))


# =====================================
# 2. FEATURE ENGINEERING
# =====================================

data["hour"] = data["timestamp"].dt.hour

data["Time_Bucket"] = data["hour"].apply(
    lambda x: 1 if x < 6 or x >= 22 else 0
)

data["Failed_Login_Adjusted"] = (
    data["failed_logins"] - 3
).clip(lower=0)

data["Upload_Ratio"] = (
    data["bytes_sent"] /
    (data["bytes_sent"] + data["bytes_received"])
)

data["Port_Risk"] = data["port"].apply(
    lambda x: 1 if x in [22, 3389] else 0
)


# =====================================
# 3. SELECT ML FEATURES
# =====================================

features = [
    "Time_Bucket",
    "Failed_Login_Adjusted",
    "Upload_Ratio",
    "Port_Risk"
]

X = data[features]


# =====================================
# 4. LOAD TRAINED MODEL
# =====================================

model = joblib.load(
    "models/isolation_forest.pkl"
)


# =====================================
# 5. PREDICTION
# =====================================

data["prediction"] = model.predict(X)

data["result"] = data["prediction"].apply(
    lambda x: "ANOMALY" if x == -1 else "NORMAL"
)


# =====================================
# 6. RAW ANOMALY SCORE
# =====================================

raw_score = model.score_samples(X)

data["raw_score"] = raw_score


# =====================================
# 7. CONVERT TO S_ml
# =====================================

min_score = raw_score.min()
max_score = raw_score.max()

if max_score == min_score:
    data["S_ml"] = 0.0
else:
    data["S_ml"] = (
        (max_score - raw_score)
        / (max_score - min_score)
    )


# =====================================
# 8. RISK LEVEL
# =====================================

def get_risk_level(score):

    if score < 0.30:
        return "NORMAL"

    elif score < 0.60:
        return "MEDIUM"

    elif score < 0.80:
        return "HIGH"

    else:
        return "CRITICAL"


data["Risk_Level"] = data["S_ml"].apply(
    get_risk_level
)


# =====================================
# 9. DISPLAY RESULTS
# =====================================

print("\n========== DETECTION RESULTS ==========")

print(
    data[
        [
            "timestamp",
            "failed_logins",
            "port",
            "S_ml",
            "result",
            "Risk_Level"
        ]
    ]
)


# =====================================
# 10. SAVE RESULTS
# =====================================

data.to_csv(
    "data/detection_results.csv",
    index=False
)

print("\nDetection completed.")
print("Results saved to data/detection_results.csv")