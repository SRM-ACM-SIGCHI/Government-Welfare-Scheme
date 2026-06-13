from curl_cffi import requests
import json
import urllib.parse

# Construct the query parameter 'q' as URL-encoded JSON filters array
filters = [{"identifier": "schemeCategory", "value": "Social Welfare & Empowerment"}]
q_param = json.dumps(filters)

url = "https://api.myscheme.gov.in/search/v6/schemes"
params = {
    "lang": "en",
    "q": q_param,
    "keyword": "",
    "sort": "default",
    "from": 0,
    "size": 10
}

headers = {
    "x-api-key": "tYTy5eEhlu9rFjyxuCr7ra7ACp4dv1RH8gWuHTDc",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Origin": "https://www.myscheme.gov.in",
    "Referer": "https://www.myscheme.gov.in/"
}

try:
    print("Requesting url:", url)
    print("Params:", params)
    resp = requests.get(url, params=params, impersonate="chrome120", headers=headers, timeout=15)
    print("Status Code:", resp.status_code)
    print("Response length:", len(resp.text))
    
    if resp.status_code == 200:
        data = resp.json()
        with open("scratch/api_test_results.json", "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        print("Saved api_test_results.json")
        
        print("Response structure keys:", data.keys())
        if "data" in data and data["data"] is not None:
            print("Keys inside data:", data["data"].keys())
            hits = data["data"].get("hits", {})
            print("Hits structure:", type(hits), hits.keys() if hasattr(hits, "keys") else hits)
            if isinstance(hits, dict):
                total = hits.get("total", 0)
                print("Total hits:", total)
                items = hits.get("items", [])
                print("Items count returned:", len(items))
                if items:
                    print("First scheme sample:\n", json.dumps(items[0], indent=2))
    else:
        print("Response text preview:", resp.text[:500])
except Exception as e:
    import traceback
    traceback.print_exc()
    print("Error:", e)
