from curl_cffi import requests
import json

slug = "pm-kisan"
lang = "en"
base_url = "https://api.myscheme.gov.in/schemes/v6/public/schemes"
headers = {
    "x-api-key": "tYTy5eEhlu9rFjyxuCr7ra7ACp4dv1RH8gWuHTDc",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Origin": "https://www.myscheme.gov.in",
    "Referer": "https://www.myscheme.gov.in/"
}

try:
    # 1. Fetch main scheme details
    print(f"Fetching scheme details for slug '{slug}'...")
    url = f"{base_url}?slug={slug}&lang={lang}"
    resp = requests.get(url, impersonate="chrome120", headers=headers, timeout=15)
    print("Status Code (Main):", resp.status_code)
    
    if resp.status_code == 200:
        data = resp.json()
        scheme_data = data.get("data", {})
        print("Scheme basic details keys:", scheme_data.keys())
        scheme_id = scheme_data.get("_id")
        print("Scheme ID (_id):", scheme_id)
        print("Scheme Name:", scheme_data.get("schemeName"))
        
        # Save main data
        with open("scratch/detail_api_main.json", "w", encoding="utf-8") as f:
            json.dump(scheme_data, f, indent=2, ensure_ascii=False)
            
        if scheme_id:
            # 2. Fetch documents
            print(f"\nFetching documents for scheme ID '{scheme_id}'...")
            docs_url = f"{base_url}/{scheme_id}/documents?lang={lang}"
            docs_resp = requests.get(docs_url, impersonate="chrome120", headers=headers, timeout=15)
            print("Status Code (Docs):", docs_resp.status_code)
            if docs_resp.status_code == 200:
                docs_data = docs_resp.json()
                print("Documents:", docs_data.get("data"))
                with open("scratch/detail_api_docs.json", "w", encoding="utf-8") as f:
                    json.dump(docs_data, f, indent=2, ensure_ascii=False)
            
            # 3. Fetch application channel
            print(f"\nFetching application channel for scheme ID '{scheme_id}'...")
            app_url = f"{base_url}/{scheme_id}/applicationchannel"
            app_resp = requests.get(app_url, impersonate="chrome120", headers=headers, timeout=15)
            print("Status Code (App):", app_resp.status_code)
            if app_resp.status_code == 200:
                app_data = app_resp.json()
                print("Application Channel:", app_data.get("data"))
                with open("scratch/detail_api_app.json", "w", encoding="utf-8") as f:
                    json.dump(app_data, f, indent=2, ensure_ascii=False)
    else:
        print("Failed to fetch main details:", resp.text)
except Exception as e:
    print("Error:", e)
