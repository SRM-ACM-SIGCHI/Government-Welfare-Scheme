import re

with open("sample.html", "r", encoding="utf-8") as f:
    html = f.read()

# Look for mentions of schemes or typical scheme keywords
keywords = ["kisan", "awas", "yojana", "shram", "poshan", "scholarship", "samman", "pm-"]
matches = []
for keyword in keywords:
    count = len(re.findall(keyword, html, re.IGNORECASE))
    print(f"Keyword '{keyword}' matches: {count}")

# Print all text content inside headers or cards
from bs4 import BeautifulSoup
soup = BeautifulSoup(html, "html.parser")
for h1 in soup.select("h1, h2, h3, h4, h5, h6"):
    print(f"Header: {h1.name} -> {h1.text.strip()}")

# Let's check the first 20 'div' elements with classes
divs = soup.select("div[class]")
print(f"Total divs with classes: {len(divs)}")
for idx, div in enumerate(divs[:15]):
    print(f"Div {idx}: class={div.get('class')} -> text={div.text.strip()[:60]}...")
