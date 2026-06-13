import json
from bs4 import BeautifulSoup

try:
    with open("sample.html", "r", encoding="utf-8") as f:
        html = f.read()
    
    soup = BeautifulSoup(html, "html.parser")
    script = soup.find("script", id="__NEXT_DATA__")
    
    if script:
        data = json.loads(script.string)
        print("Found __NEXT_DATA__!")
        # Let's inspect the page props
        props = data.get("props", {})
        page_props = props.get("pageProps", {})
        print("Keys in pageProps:", page_props.keys())
        
        # Let's look at scheme count or data
        schemes = page_props.get("schemes", [])
        print("Number of schemes in pageProps:", len(schemes))
        
        # If there is schemes, print the first one
        if schemes:
            print("First scheme key details:", schemes[0].keys())
            print("Name:", schemes[0].get("schemeName"))
            
        # Write clean data to json
        with open("next_data.json", "w", encoding="utf-8") as f2:
            json.dump(data, f2, indent=2, ensure_ascii=False)
        print("Saved next_data.json")
    else:
        print("Could not find __NEXT_DATA__ script tag")
except Exception as e:
    print("Error:", e)
