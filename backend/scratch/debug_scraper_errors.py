from curl_cffi import requests
import json
import traceback

slug = "sui"
url = f"https://api.myscheme.gov.in/schemes/v6/public/schemes?slug={slug}&lang=en"
headers = {
    "x-api-key": "tYTy5eEhlu9rFjyxuCr7ra7ACp4dv1RH8gWuHTDc",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Origin": "https://www.myscheme.gov.in",
    "Referer": "https://www.myscheme.gov.in/"
}

try:
    print("Testing GET:", url)
    resp = requests.get(url, impersonate="chrome120", headers=headers, timeout=15)
    print("Status Code:", resp.status_code)
    print("Response text length:", len(resp.text))
    
    # Let's inspect the json
    json_data = resp.json()
    print("JSON Type:", type(json_data))
    print("JSON content keys:", json_data.keys() if isinstance(json_data, dict) else "Not a dict")
    
    main_data = json_data.get("data")
    print("main_data Type:", type(main_data))
    if main_data is None:
         print("main_data is None! Response text preview:", resp.text[:400])
    else:
         print("main_data keys:", main_data.keys() if hasattr(main_data, "keys") else "No keys")
         
except Exception as e:
    print("Exception occurred:")
    traceback.print_exc()
