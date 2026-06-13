from curl_cffi import requests
import json

url = "https://www.myscheme.gov.in/_next/data/ogqeeipEXMk71f8jfOOm1/search/category/Social%20Welfare%20&%20Empowerment.json"
headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
}

try:
    resp = requests.get(url, impersonate="chrome120", headers=headers, timeout=15)
    print("Status Code:", resp.status_code)
    print("Response length:", len(resp.text))
    print("Response preview:", resp.text[:400])
    
    if resp.status_code == 200:
        data = resp.json()
        with open("scratch/category_data_gov.json", "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        print("Success! Saved category_data_gov.json")
except Exception as e:
    print("Error:", e)
