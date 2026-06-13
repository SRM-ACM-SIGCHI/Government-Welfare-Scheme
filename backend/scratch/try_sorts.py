from curl_cffi import requests
import json

url = "https://api.myscheme.gov.in/search/v6/schemes"
filters = [{"identifier": "schemeCategory", "value": "Social Welfare & Empowerment"}]
q_param = json.dumps(filters)

sort_options = [None, "", "name", "date", "relevance", "popular", "default_sort", "asc", "desc"]
headers = {
    "x-api-key": "tYTy5eEhlu9rFjyxuCr7ra7ACp4dv1RH8gWuHTDc",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Origin": "https://www.myscheme.gov.in",
    "Referer": "https://www.myscheme.gov.in/"
}

for sort in sort_options:
    params = {
        "lang": "en",
        "q": q_param,
        "keyword": "",
        "from": 0,
        "size": 5
    }
    if sort is not None:
        params["sort"] = sort
        
    try:
        resp = requests.get(url, params=params, impersonate="chrome120", headers=headers, timeout=10)
        if resp.status_code == 200:
            res = resp.json()
            err = res.get("data", {}).get("error") if res.get("data") else None
            hits_count = res.get("data", {}).get("hits", {}).get("total", 0) if res.get("data") else 0
            print(f"Sort: '{sort}' -> Status: 200 | Hits: {hits_count} | Error: {err}")
            if hits_count > 0:
                # print a sample scheme name
                items = res["data"]["hits"]["items"]
                print(f"   Sample: {items[0].get('schemeName')}")
        else:
            print(f"Sort: '{sort}' -> Status: {resp.status_code}")
    except Exception as e:
        print(f"Sort: '{sort}' -> Exception: {e}")
