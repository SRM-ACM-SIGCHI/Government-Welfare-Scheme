from curl_cffi import requests
import json

slug = "sui"
url = f"https://api.myscheme.gov.in/schemes/v6/public/schemes?slug={slug}&lang=en"
headers = {
    "x-api-key": "tYTy5eEhlu9rFjyxuCr7ra7ACp4dv1RH8gWuHTDc",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Origin": "https://www.myscheme.gov.in",
    "Referer": "https://www.myscheme.gov.in/"
}

try:
    resp = requests.get(url, impersonate="chrome120", headers=headers, timeout=15)
    print("Status Code:", resp.status_code)
    data = resp.json()
    print("Response JSON:")
    print(json.dumps(data, indent=2))
except Exception as e:
    print("Error:", e)
