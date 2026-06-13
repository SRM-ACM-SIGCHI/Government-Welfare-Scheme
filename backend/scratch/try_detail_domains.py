from curl_cffi import requests
import json

domains = [
    "https://www.myscheme.gov.in",
    "https://cdn.myscheme.in"
]

headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
}

for base in domains:
    url = f"{base}/_next/data/ogqeeipEXMk71f8jfOOm1/schemes/sui.json"
    try:
        resp = requests.get(url, impersonate="chrome120", headers=headers, timeout=10)
        print(f"Domain: {base} -> Status: {resp.status_code} | Length: {len(resp.text)}")
        if resp.status_code == 200:
            print("Successfully fetched! Sample keys:", resp.json().keys())
    except Exception as e:
        print(f"Domain: {base} -> Exception: {e}")
