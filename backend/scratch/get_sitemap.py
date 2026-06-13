import requests

url = "https://www.myscheme.gov.in/sitemap-0.xml"
headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
}

try:
    resp = requests.get(url, headers=headers, timeout=15)
    print("Status Code:", resp.status_code)
    print("Content preview:", resp.text[:400])
    with open("sitemap.xml", "w", encoding="utf-8") as f:
        f.write(resp.text)
    print("Wrote sitemap.xml")
except Exception as e:
    print("Error:", e)
