from curl_cffi import requests
import json

url = "https://api.myscheme.gov.in/schemes/v6/public/schemes"
slugs = ["sui", "pm-kisan"]

headers = {
    "x-api-key": "tYTy5eEhlu9rFjyxuCr7ra7ACp4dv1RH8gWuHTDc",
    "Content-Type": "application/json",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Origin": "https://www.myscheme.gov.in",
    "Referer": "https://www.myscheme.gov.in/"
}

try:
    print("POSTing to url:", url)
    print("Payload:", slugs)
    resp = requests.post(url, json=slugs, impersonate="chrome120", headers=headers, timeout=15)
    print("Status Code:", resp.status_code)
    print("Response length:", len(resp.text))
    
    if resp.status_code == 200:
        data = resp.json()
        with open("scratch/slugs_api_results.json", "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        print("Success! Saved scratch/slugs_api_results.json")
        
        # Print preview of returned data
        print("Keys in response:", data.keys())
        if "data" in data and data["data"]:
            print(f"Returned {len(data['data'])} schemes.")
            first_scheme = data["data"][0]
            print("Keys in first returned scheme:", first_scheme.keys())
            print("Scheme details sample:\n", json.dumps(first_scheme, indent=2)[:1000])
    else:
        print("Response text:", resp.text)
except Exception as e:
    print("Error:", e)
