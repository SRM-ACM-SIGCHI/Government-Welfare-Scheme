import json

with open("scratch/slugs_api_results.json", "r", encoding="utf-8") as f:
    data = json.load(f)

scheme = data["data"][0]
en = scheme["en"]

# Let's save a clean representation of the scheme details structure to see what's inside
import sys
# Set console encoding to utf-8 if needed, but writing to file is safer
out_data = {
    "keys_in_en": list(en.keys()),
    "basicDetails": en.get("basicDetails"),
    "schemeContent_keys": list(en.get("schemeContent", {}).keys()),
    "schemeContent": en.get("schemeContent"),
    "hi_keys": list(scheme.get("hi", {}).keys())
}

with open("scratch/scheme_inspection_clean.json", "w", encoding="utf-8") as f_out:
    json.dump(out_data, f_out, indent=2, ensure_ascii=False)
print("Saved inspection data to scratch/scheme_inspection_clean.json")
