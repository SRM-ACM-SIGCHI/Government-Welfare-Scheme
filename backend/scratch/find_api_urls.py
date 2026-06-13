import re

with open("sample.html", "r", encoding="utf-8") as f:
    html = f.read()

# Look for URLs starting with http/https or containing api
urls = re.findall(r'https?://[^\s"\'><]+', html)
print("Total absolute URLs found:", len(urls))
print("Sample URLs:")
for u in list(set(urls))[:30]:
    print("-", u)

# Search specifically for API domains or endpoints
api_matches = [u for u in urls if "api" in u.lower()]
print("\nAPI-related URLs found:", len(api_matches))
for u in list(set(api_matches)):
    print("-", u)
