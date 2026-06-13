with open("scratch/app.js", "r", encoding="utf-8") as f:
    js = f.read()

# Let's search for "public/schemes" or "/public/schemes"
idx = js.find("public/schemes")
if idx != -1:
    print("Found public/schemes usage in JS at index:", idx)
    print("\nPreview of code around this URL:")
    print(js[max(0, idx-500):min(len(js), idx+1500)])
else:
    print("Could not find public/schemes in app.js text.")
