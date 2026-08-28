import pandas as pd


def create_features(data):

    # Convert timestamp into datetime
    data["timestamp"] = pd.to_datetime(data["timestamp"])

    # --------------------------------
    # 1. TIME BUCKET
    # --------------------------------

    data["hour"] = data["timestamp"].dt.hour

    data["Time_Bucket"] = data["hour"].apply(
        lambda x: 1 if x < 6 or x >= 22 else 0
    )

    # --------------------------------
    # 2. FAILED LOGIN ADJUSTMENT
    # --------------------------------

    data["Failed_Login_Adjusted"] = (
        data["failed_logins"] - 3
    ).clip(lower=0)

    # --------------------------------
    # 3. UPLOAD RATIO
    # --------------------------------

    total_bytes = data["bytes_sent"] + data["bytes_received"]

    data["Upload_Ratio"] = (
        data["bytes_sent"] / total_bytes
    )

    # --------------------------------
    # 4. PORT RISK
    # --------------------------------

    data["Port_Risk"] = data["port"].apply(
        lambda x: 1 if x in [22, 3389] else 0
    )

    return data


if __name__ == "__main__":

    data = pd.read_csv("data/network_data.csv")

    data = create_features(data)

    print(data)