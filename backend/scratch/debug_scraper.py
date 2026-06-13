import requests
from bs4 import BeautifulSoup

url = "https://www.myscheme.gov.in/search/category/Social%20Welfare%20&%20Empowerment"
headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
}

try:
    resp = requests.get(url, headers=headers, timeout=15)
    print("Status Code:", resp.status_code)
    soup = BeautifulSoup(resp.text, "html.parser")
    
    # Try different selectors
    print("Select .scheme-card:", len(soup.select(".scheme-card")))
    print("Select .schemeCard:", len(soup.select(".schemeCard")))
    print("Select [data-scheme]:", len(soup.select("[data-scheme]")))
    print("Select a tags count:", len(soup.select("a")))
    print("Select h3 tags count:", len(soup.select("h3")))
    
    # Write sample HTML to a file to inspect
    with open("sample.html", "w", encoding="utf-8") as f:
        f.write(resp.text)
    print("Wrote sample.html")
except Exception as e:
    print("Error:", e)
