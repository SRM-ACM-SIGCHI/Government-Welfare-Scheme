import re

with open("scratch/app.js", "r", encoding="utf-8") as f:
    js = f.read()

# Find all occurrences of api.myscheme.gov.in
matches = [m.start() for m in re.finditer(r'api\.myscheme\.gov\.in', js)]
print(f"Found {len(matches)} matches:")

for i, idx in enumerate(matches):
    print(f"\nMatch {i+1} at index {idx}:")
    print(js[max(0, idx-200):min(len(js), idx+600)])
