from curl_cffi import requests
import json

url = "https://api.myscheme.gov.in/search/v6/schemes"
filters = [{"identifier": "schemeCategory", "value": "Social welfare & Empowerment"}]
q_param = json.dumps(filters)

params = {
    "lang": "en",
    "q": q_param,
    "keyword": "",
    "from": 0,
    "size": 5
}

headers = {
    "x-api-key": "tYTy5eEhlu9rFjyxuCr7ra7ACp4dv1RH8gWuHTDc",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Origin": "https://www.myscheme.gov.in",
    "Referer": "https://www.myscheme.gov.in/"
}

try:
    resp = requests.get(url, params=params, impersonate="chrome120", headers=headers, timeout=15)
    print("Status Code:", resp.status_code)
    if resp.status_code == 200:
        data = resp.json()
        print("Status in JSON:", data.get("status"))
        hits = data.get("data", {}).get("hits", {})
        print("Total hits:", hits.get("total", 0))
        items = hits.get("items", [])
        print("Items count:", len(items))
        if items:
            print("First item keys:", items[0].keys())
            print("First item content dump:\n", json.dumps(items[0], indent=2))
            for idx, item in enumerate(items):
                print(f"{idx+1}. Name: {item.get('schemeName') or item.get('name') or item.get('title')}")
    else:
        print("Response text:", resp.text)
except Exception as e:
    print("Error:", e)
