import xml.etree.ElementTree as ET
import re

try:
    tree = ET.parse("sitemap.xml")
    root = tree.getroot()
    
    # Namespaces are usually present in sitemaps
    ns = {"ns": "http://www.sitemaps.org/schemas/sitemap/0.9"}
    
    urls = []
    for url in root.findall("ns:url", ns):
        loc = url.find("ns:loc", ns)
        if loc is not None:
            urls.append(loc.text)
            
    print("Total URLs in sitemap:", len(urls))
    
    # Filter URLs that represent schemes
    # e.g., https://www.myscheme.gov.in/schemes/pm-kisan
    scheme_urls = [u for u in urls if "/schemes/" in u]
    print("Total scheme URLs:", len(scheme_urls))
    
    print("First 20 scheme URLs:")
    for u in scheme_urls[:20]:
        print("-", u)
        
except Exception as e:
    print("Error:", e)
