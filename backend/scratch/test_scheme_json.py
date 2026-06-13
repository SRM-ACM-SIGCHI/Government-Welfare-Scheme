from curl_cffi import requests
import json

url = "https://www.myscheme.gov.in/_next/data/ogqeeipEXMk71f8jfOOm1/schemes/sui.json"
headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Origin": "https://www.myscheme.gov.in",
    "Referer": "https://www.myscheme.gov.in/"
}

try:
    resp = requests.get(url, impersonate="chrome120", headers=headers, timeout=15)
    print("Status Code:", resp.status_code)
    print("Response length:", len(resp.text))
    
    if resp.status_code == 200:
        data = resp.json()
        with open("scratch/scheme_detail_sui.json", "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        print("Success! Saved scratch/scheme_detail_sui.json")
    else:
        print("Response text preview:", resp.text[:500])
except Exception as e:
    print("Error:", e)
