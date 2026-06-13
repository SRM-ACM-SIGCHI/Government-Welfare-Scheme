with open("scratch/app.js", "r", encoding="utf-8") as f:
    js = f.read()

import re

# Look for occurrences of schemeContent or eligibility or benefits near fetch requests
# Let's find matches of "eligibility" or "benefits" or "documentsRequired"
for word in ["eligibility", "benefits", "documentsRequired", "briefDescription"]:
    matches = [m.start() for m in re.finditer(word, js)]
    print(f"Word '{word}' matches count: {len(matches)}")
    if matches:
        print("First match context:")
        idx = matches[0]
        print(js[max(0, idx-100):min(len(js), idx+300)])
        print("-" * 50)
