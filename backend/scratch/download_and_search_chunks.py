from curl_cffi import requests
import re
import os

chunks = [
    "9586.84b71235c148edf4.js",
    "0c428ae2-219bee599e9d4e46.js",
    "1bfc9850-29d2a188f9d46363.js",
    "6893-d16f39a374ce9d24.js",
    "2267-a0f24cadbfde00c2.js",
    "8088-3148aef4c51a051c.js"
]

os.makedirs("scratch/chunks", exist_ok=True)

headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
}

for chunk in chunks:
    url = f"https://cdn.myscheme.in/_next/static/chunks/{chunk}"
    try:
        print(f"Downloading {chunk}...")
        resp = requests.get(url, impersonate="chrome120", headers=headers, timeout=15)
        if resp.status_code == 200:
            js = resp.text
            path = f"scratch/chunks/{chunk}"
            with open(path, "w", encoding="utf-8") as f:
                f.write(js)
            
            # Find URLs
            urls = re.findall(r'https?://[^\s"\')]+', js)
            api_related = [u for u in urls if "api" in u.lower() or "scheme" in u.lower()]
            print(f"  Successfully saved. Found {len(urls)} URLs, {len(api_related)} API-related:")
            for u in list(set(api_related))[:5]:
                print(f"    - {u}")
                
            # Search for api paths like /api/... or backend routes
            api_paths = re.findall(r'"/api/[^"]+"|\'/api/[^\']+\'', js)
            if api_paths:
                print(f"  Found API paths:")
                for p in list(set(api_paths))[:5]:
                    print(f"    - {p}")
        else:
            print(f"  Failed with status: {resp.status_code}")
    except Exception as e:
        print(f"  Error downloading {chunk}: {e}")
