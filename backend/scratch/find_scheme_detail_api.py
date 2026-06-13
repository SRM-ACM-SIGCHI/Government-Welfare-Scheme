with open("scratch/app.js", "r", encoding="utf-8") as f:
    js = f.read()

import re

# Look for URL structures like /schemes/ or similar inside api calls
matches = re.finditer(r'api\.myscheme\.gov\.in/schemes', js, re.IGNORECASE)
for m in matches:
    idx = m.start()
    print("Found 'api.myscheme.gov.in/schemes' at index:", idx)
    print(js[max(0, idx-200):min(len(js), idx+600)])
    print("-" * 50)
    
# Let's search specifically for public/schemes or schemes/v
matches2 = re.finditer(r'/public/schemes/([a-zA-Z0-9_-]+)', js)
for m in matches2:
    print("Found pattern:", m.group(0))
