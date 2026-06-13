import os
import re

directory = "scratch/chunks"
for fname in os.listdir(directory):
    path = os.path.join(directory, fname)
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()
    
    # Let's search for "37191:" which indicates definition of module 37191
    if "37191:" in content or ",37191:" in content or "{37191:" in content:
        print(f"Module 37191 is defined in {fname}!")
        
        # Let's find the text around 37191:
        idx = content.find("37191:")
        print("Preview around module definition:")
        print(content[max(0, idx-100):min(len(content), idx+1000)])
