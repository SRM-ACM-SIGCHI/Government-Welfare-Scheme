with open("scratch/app.js", "r", encoding="utf-8") as f:
    js = f.read()

import re
matches = re.finditer(r'Agriculture', js, re.IGNORECASE)
for m in matches:
    idx = m.start()
    print("Found 'Agriculture' at index:", idx)
    print(js[max(0, idx-100):min(len(js), idx+300)])
    print("-" * 50)
