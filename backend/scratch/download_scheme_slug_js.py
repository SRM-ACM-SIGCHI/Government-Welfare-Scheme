from curl_cffi import requests
import re

url = "https://cdn.myscheme.in/_next/static/chunks/pages/schemes/%5Bslug%5D-e3ed95a1bb1f9ccc.js"
headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
}

try:
    print("Downloading schemes/[slug] JS bundle...")
    resp = requests.get(url, impersonate="chrome120", headers=headers, timeout=15)
    print("Status:", resp.status_code)
    if resp.status_code == 200:
        js = resp.text
        with open("scratch/scheme_slug.js", "w", encoding="utf-8") as f:
            f.write(js)
        print("Saved scratch/scheme_slug.js")
        
        # Search for occurrences of api.myscheme.gov.in
        matches = [m.start() for m in re.finditer(r'api\.myscheme\.gov\.in', js)]
        print(f"Found {len(matches)} api.myscheme.gov.in matches:")
        for idx in matches:
            print(js[max(0, idx-100):min(len(js), idx+500)])
            print("-" * 50)
            
        # Search for any endpoints or routes
        paths = re.findall(r'"/[^"]+"|\'/[^\']+\'', js)
        print(f"Sample paths: {list(set(paths))[:20]}")
except Exception as e:
    print("Error:", e)
