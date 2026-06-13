import requests

url = "https://www.myscheme.gov.in/sitemap.xml"
headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
}

try:
    resp = requests.get(url, headers=headers, timeout=15)
    print("Status Code:", resp.status_code)
    print("Content length:", len(resp.text))
    print("Content preview:\n", resp.text[:1000])
    
    with open("scratch/sitemap_index.xml", "w", encoding="utf-8") as f:
        f.write(resp.text)
    print("Wrote scratch/sitemap_index.xml")
except Exception as e:
    print("Error:", e)
