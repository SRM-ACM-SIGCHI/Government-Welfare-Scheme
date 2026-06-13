from curl_cffi import requests
from bs4 import BeautifulSoup

url = "https://www.myscheme.gov.in/schemes/pm-kisan"
headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
}

try:
    resp = requests.get(url, impersonate="chrome120", headers=headers, timeout=15)
    soup = BeautifulSoup(resp.text, "html.parser")
    print("Script tags found in HTML:")
    for s in soup.find_all("script", src=True):
        print("-", s["src"])
except Exception as e:
    print("Error:", e)
