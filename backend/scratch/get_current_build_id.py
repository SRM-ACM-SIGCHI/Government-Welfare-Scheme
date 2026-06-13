from curl_cffi import requests
from bs4 import BeautifulSoup
import json

url = "https://www.myscheme.gov.in/"
headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
}

try:
    resp = requests.get(url, impersonate="chrome120", headers=headers, timeout=15)
    print("Status Code:", resp.status_code)
    
    soup = BeautifulSoup(resp.text, "html.parser")
    script = soup.find("script", id="__NEXT_DATA__")
    
    if script:
        data = json.loads(script.string)
        build_id = data.get("buildId")
        print("Found Build ID:", build_id)
        
        # Write to temporary file
        with open("scratch/current_build_id.json", "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        print("Saved build ID data to current_build_id.json")
    else:
        print("Could not find __NEXT_DATA__ script tag")
        # Let's search for buildId inside the text using regex
        import re
        matches = re.findall(r'"buildId":"([^"]+)"', resp.text)
        if matches:
            print("Found buildId via regex:", matches[0])
        else:
            print("No buildId found in page HTML.")
except Exception as e:
    print("Error:", e)
