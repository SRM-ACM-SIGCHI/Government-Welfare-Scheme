with open("scratch/app.js", "r", encoding="utf-8") as f:
    js = f.read()

import re

matches = [m.start() for m in re.finditer(r'schemeContent', js)]
print(f"Found {len(matches)} matches:")

for idx in matches:
    print(f"\nContext at index {idx}:")
    print(js[max(0, idx-100):min(len(js), idx+500)])
    print("-" * 50)
