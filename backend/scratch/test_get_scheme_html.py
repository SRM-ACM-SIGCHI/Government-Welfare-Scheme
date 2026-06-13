from curl_cffi import requests
from bs4 import BeautifulSoup
import json

url = "https://www.myscheme.gov.in/schemes/pm-kisan"
headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
}

try:
    resp = requests.get(url, impersonate="chrome120", headers=headers, timeout=15)
    print("Status Code:", resp.status_code)
    print("HTML length:", len(resp.text))
    
    soup = BeautifulSoup(resp.text, "html.parser")
    
    # 1. Print all h1 and h2 headers on page
    print("\nHeaders in HTML:")
    for h in soup.select("h1, h2, h3"):
        print(f" - {h.name}: {h.text.strip()}")
        
    # 2. Extract __NEXT_DATA__ script
    script = soup.find("script", id="__NEXT_DATA__")
    if script:
        print("\nFound __NEXT_DATA__ script tag!")
        data = json.loads(script.string)
        with open("scratch/pm_kisan_next_data.json", "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        print("Saved scratch/pm_kisan_next_data.json")
        
        # Check keys inside pageProps
        props = data.get("props", {}).get("pageProps", {})
        print("pageProps keys:", props.keys())
        if "scheme" in props:
            print("Scheme key exists! Keys:", props["scheme"].keys())
            print("Scheme Name:", props["scheme"].get("schemeName"))
    else:
        print("Could not find __NEXT_DATA__ script tag")
        
except Exception as e:
    print("Error:", e)
