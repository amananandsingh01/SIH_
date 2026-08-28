import pandas as pd
import joblib

from feature_engineering import create_features


# Load trained model
model = joblib.load("models/isolation_forest.pkl")


# Load data
data = pd.read_csv("data/network_data.csv")


# Create features
data = create_features(data)


# Features used by ML
features = [
    "Time_Bucket",
    "Failed_Login_Adjusted",
    "Upload_Ratio",
    "Port_Risk"
]

X = data[features]


# Predict
data["prediction"] = model.predict(X)


# Convert prediction into readable result
data["result"] = data["prediction"].apply(
    lambda x: "ANOMALY" if x == -1 else "NORMAL"
)


print(
    data[
        [
            "timestamp",
            "failed_logins",
            "bytes_sent",
            "port",
            "result"
        ]
    ]
)

raw_score = model.score_samples(X)

data["raw_score"] = raw_score

min_score = raw_score.min()
max_score = raw_score.max()

if max_score == min_score:
    data["S_ml"] = 0.0
else:
    data["S_ml"] = (
        (max_score - raw_score)
        / (max_score - min_score)
    )

print(data[["timestamp", "raw_score", "S_ml", "result"]])

def get_risk_level(score):
    if score < 0.30:
        return "NORMAL"
    elif score < 0.60:
        return "MEDIUM"
    elif score < 0.80:
        return "HIGH"
    else:
        return "CRITICAL"


data["Risk_Level"] = data["S_ml"].apply(get_risk_level)

print(data[[
    "timestamp",
    "raw_score",
    "S_ml",
    "result",
    "Risk_Level"
]])

data.to_csv("data/predictions.csv", index=False)

print("Predictions saved successfully to data/predictions.csv")