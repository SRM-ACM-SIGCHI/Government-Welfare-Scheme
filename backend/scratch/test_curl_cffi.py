from curl_cffi import requests
from bs4 import BeautifulSoup

url = "https://www.myscheme.gov.in/search/category/Social%20Welfare%20&%20Empowerment"
# curl_cffi simulates standard browser TLS handshakes (JA3)
# impersonate='chrome110' or 'chrome120'
try:
    resp = requests.get(url, impersonate="chrome120", timeout=15)
    print("Status Code:", resp.status_code)
    html = resp.text
    print("HTML length:", len(html))
    
    soup = BeautifulSoup(html, "html.parser")
    # check if Cloudflare blocked us
    # Print all headers in the page to see if it's the real content
    print("Parsed Headers:")
    for h in soup.select("h1, h2, h3"):
        print(" -", h.name, "->", h.text.strip())

    # Check for scheme cards or items
    cards = soup.select(".scheme-card, .schemeCard, [data-scheme], a")
    print(f"Total links found: {len(cards)}")
    for card in cards[:10]:
        print("Link:", card.get("href"), card.text.strip()[:50])

    # Always write the HTML to verify
    with open("scratch/curl_cffi_test.html", "w", encoding="utf-8") as f:
        f.write(html)
            
except Exception as e:
    print("Error:", e)
