import json

with open("next_data.json", "r", encoding="utf-8") as f:
    data = json.load(f)

print("Build ID:", data.get("buildId"))
print("Locale:", data.get("locale"))
print("Query:", data.get("query"))
