with open("scratch/app.js", "r", encoding="utf-8") as f:
    js = f.read()

import re

# Search for Social Welfare & Empowerment or similar strings
matches = re.finditer(r'Social Welfare', js, re.IGNORECASE)
for m in matches:
    idx = m.start()
    print("Found 'Social Welfare' at index:", idx)
    print(js[max(0, idx-200):min(len(js), idx+600)])
    print("-" * 50)
