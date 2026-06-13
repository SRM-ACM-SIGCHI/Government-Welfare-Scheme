with open("scratch/app.js", "r", encoding="utf-8") as f:
    js = f.read()

import re

# Search for the word sort or sortBy near common sorting strings like "relevance", "popular", "name", etc.
# Next.js sorting modals often have key-value pairs for sorting options.
matches = re.findall(r'\"(relevance|popular|alphabetical|asc|desc|name|newest|oldest|recent|default_sort|popular_sort|date)\"', js)
print("Found potential sorting values:", set(matches))

# Let's search for "sort" in a case-insensitive way and find references to strings or options
opts = re.findall(r'\{\s*label:\s*[^,]+,\s*value:\s*\"([^\"]+)\"\}', js)
print("Found options pattern:", set(opts))
