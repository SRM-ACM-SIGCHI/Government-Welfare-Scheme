import json

with open("next_data.json", "r", encoding="utf-8") as f:
    data = json.load(f)

print("Main keys:", data.keys())
props = data.get("props", {})
print("Props keys:", props.keys())
page_props = props.get("pageProps", {})
print("pageProps keys:", page_props.keys())
query = data.get("query", {})
print("Query:", query)

# Search recursively for lists that might contain scheme details
def find_lists(obj, path=""):
    if isinstance(obj, dict):
        for k, v in obj.items():
            find_lists(v, f"{path}.{k}" if path else k)
    elif isinstance(obj, list):
        if len(obj) > 0:
            print(f"List at '{path}' of length {len(obj)}")
            if isinstance(obj[0], dict):
                print(f"  Sample keys: {list(obj[0].keys())[:10]}")
            else:
                print(f"  Sample values: {obj[:3]}")

find_lists(data)
