from curl_cffi import requests
from bs4 import BeautifulSoup
import re

url = "https://www.myscheme.gov.in/"
headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
}

try:
    resp = requests.get(url, impersonate="chrome120", headers=headers, timeout=15)
    print("Status Code:", resp.status_code)
    
    soup = BeautifulSoup(resp.text, "html.parser")
    
    # Let's find all links
    links = soup.find_all("a", href=True)
    print("Total links on homepage:", len(links))
    
    cat_links = []
    for link in links:
        href = link["href"]
        if "/search/category/" in href or "category" in href.lower():
            cat_links.append((href, link.text.strip()))
            
    print("\nCategory/Search-related links:")
    for href, text in set(cat_links):
        print(f"- Text: '{text}' | Href: '{href}'")
        
except Exception as e:
    print("Error:", e)
