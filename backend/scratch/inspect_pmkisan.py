import json

with open("scratch/slugs_api_results.json", "r", encoding="utf-8") as f:
    data = json.load(f)

# The second scheme is PM-Kisan
scheme = data["data"][1]
en = scheme["en"]

print("PM-Kisan root keys:", scheme.keys())
print("PM-Kisan 'en' keys:", en.keys())
print("PM-Kisan 'en' schemeContent keys:", en.get("schemeContent", {}).keys())

# Let's save the clean PM-Kisan data to a JSON file
with open("scratch/scheme_inspection_pmkisan.json", "w", encoding="utf-8") as f_out:
    json.dump(scheme, f_out, indent=2, ensure_ascii=False)
print("Saved PM-Kisan data to scratch/scheme_inspection_pmkisan.json")
