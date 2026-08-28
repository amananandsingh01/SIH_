import pandas as pd
import joblib

from sklearn.ensemble import IsolationForest

from feature_engineering import create_features


# -----------------------------
# 1. LOAD DATA
# -----------------------------

data = pd.read_csv("data/network_data.csv")


# -----------------------------
# 2. CREATE FEATURES
# -----------------------------

data = create_features(data)


# -----------------------------
# 3. SELECT ML FEATURES
# -----------------------------

features = [
    "Time_Bucket",
    "Failed_Login_Adjusted",
    "Upload_Ratio",
    "Port_Risk"
]

X = data[features]


# -----------------------------
# 4. CREATE MODEL
# -----------------------------

model = IsolationForest(
    n_estimators=100,
    contamination=0.15,
    random_state=42
)


# -----------------------------
# 5. TRAIN MODEL
# -----------------------------

model.fit(X)


# -----------------------------
# 6. SAVE MODEL
# -----------------------------

joblib.dump(model, "models/isolation_forest.pkl")

print("Model trained successfully!")