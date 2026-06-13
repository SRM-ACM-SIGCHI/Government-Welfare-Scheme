import json

with open("scratch/detail_api_main.json", "r", encoding="utf-8") as f:
    data = json.load(f)

matches_list = []

# Let's search recursively for demographic keys or values
def find_demographics(obj, path=""):
    if isinstance(obj, dict):
        for k, v in obj.items():
            current_path = f"{path}.{k}" if path else k
            if k.lower() in ["age", "gender", "caste", "income", "state", "occupation", "qualification", "disability", "marital"]:
                matches_list.append({"type": "key", "path": current_path, "value": v})
            # Search values if string
            if isinstance(v, str) and any(w in v.lower() for w in ["male", "female", "general", "obc", "sc", "st", "income", "years old"]):
                matches_list.append({"type": "value", "path": current_path, "value_preview": v[:200]})
            find_demographics(v, current_path)
    elif isinstance(obj, list):
        for idx, item in enumerate(obj):
            find_demographics(item, f"{path}[{idx}]")

find_demographics(data)

with open("scratch/demographics_matches.json", "w", encoding="utf-8") as f_out:
    json.dump(matches_list, f_out, indent=2, ensure_ascii=False)
print("Saved matches to scratch/demographics_matches.json")
