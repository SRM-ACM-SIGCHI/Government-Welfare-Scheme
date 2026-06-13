import requests
import re

url = "https://cdn.myscheme.in/_next/static/chunks/pages/search/category/%5Bname%5D-9b497c79618215f7.js"
headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
}

try:
    resp = requests.get(url, headers=headers, timeout=15)
    print("Status Code:", resp.status_code)
    js = resp.text
    
    # Save the JS file to search locally
    with open("category_page.js", "w", encoding="utf-8") as f:
        f.write(js)
    print("Wrote category_page.js")
    
    # Search for URLs or APIs
    apis = re.findall(r'https?://[^\s"\')]+', js)
    print("Found APIs:", len(apis))
    for a in list(set(apis))[:20]:
        print("-", a)
        
    # Search for keywords like fetch, axios, api, query
    keywords = ["fetch", "axios", "api", "query", "/api/", "url"]
    for kw in keywords:
        matches = [m.start() for m in re.finditer(kw, js, re.IGNORECASE)]
        print(f"Keyword '{kw}' matches: {len(matches)}")
        
except Exception as e:
    print("Error:", e)
