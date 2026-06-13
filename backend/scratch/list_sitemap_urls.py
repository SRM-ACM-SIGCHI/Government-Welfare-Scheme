import xml.etree.ElementTree as ET

try:
    tree = ET.parse("sitemap.xml")
    root = tree.getroot()
    ns = {"ns": "http://www.sitemaps.org/schemas/sitemap/0.9"}
    
    for url in root.findall("ns:url", ns):
        loc = url.find("ns:loc", ns)
        if loc is not None:
            print(loc.text)
except Exception as e:
    print(e)
