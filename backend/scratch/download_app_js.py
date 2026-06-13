from curl_cffi import requests
import re

url = "https://cdn.myscheme.in/_next/static/chunks/pages/_app-b25e52158af6327a.js"
headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
}

try:
    print("Downloading _app JS bundle...")
    resp = requests.get(url, impersonate="chrome120", headers=headers, timeout=15)
    print("Status:", resp.status_code)
    if resp.status_code == 200:
        js = resp.text
        with open("scratch/app.js", "w", encoding="utf-8") as f:
            f.write(js)
        print("Saved scratch/app.js")
        
        # Search for module 37191
        if "37191:" in js or ",37191:" in js:
            print("Found module 37191 definition in _app.js!")
            idx = js.find("37191:")
            print("Preview:\n", js[idx:idx+1500])
        else:
            print("Module 37191 is not defined in _app.js")
            
        # Search for any API patterns or fetch endpoints
        urls = re.findall(r'https?://[^\s"\')]+', js)
        api_related = [u for u in urls if "api" in u.lower() or "scheme" in u.lower()]
        print(f"Found {len(urls)} URLs, {len(api_related)} API-related:")
        for u in list(set(api_related))[:10]:
            print(f"  - {u}")
            
except Exception as e:
    print("Error:", e)
