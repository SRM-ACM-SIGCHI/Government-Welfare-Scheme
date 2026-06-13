with open("scratch/app.js", "r", encoding="utf-8") as f:
    js = f.read()

import re

# Search for public/schemes in case-insensitive way
matches = [m.start() for m in re.finditer(r'public/schemes', js, re.IGNORECASE)]
print(f"Found {len(matches)} occurrences of 'public/schemes':")

for idx in matches:
    print(f"\nContext at index {idx}:")
    print(js[max(0, idx-200):min(len(js), idx+600)])
    print("-" * 50)
