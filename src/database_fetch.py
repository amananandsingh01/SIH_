import pandas as pd

# Read the data
data = pd.read_csv("data/network_data.csv")

# Convert timestamp to datetime
data["timestamp"] = pd.to_datetime(data["timestamp"])

# Sort by newest record
data = data.sort_values("timestamp", ascending=False)

# Fetch latest 50 records
latest_50 = data.head(50)

print("Total records available:", len(data))
print("Records fetched:", len(latest_50))

print("\nLatest records:")
print(latest_50)