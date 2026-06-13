with open("scratch/app.js", "r", encoding="utf-8") as f:
    js = f.read()

import re
# Look for sort parameter values or sorting options in the search hooks
matches = [m.start() for m in re.finditer(r'sort', js, re.IGNORECASE)]
print(f"Found {len(matches)} occurrences of 'sort'.")

# Let's search for the get method on schemes endpoint and see what it puts for sort
idx = js.find("/schemes?lang=")
if idx != -1:
    print("\nFound /schemes?lang= at index:", idx)
    print(js[max(0, idx-200):min(len(js), idx+600)])
