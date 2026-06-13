from curl_cffi import requests
import json
import re
from datetime import datetime

categories = [
    "Social welfare & Empowerment",
    "Education & Learning",
    "Agriculture,Rural & Environment",
    "Health & Wellness"
]

headers = {
    "x-api-key": "tYTy5eEhlu9rFjyxuCr7ra7ACp4dv1RH8gWuHTDc",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Origin": "https://www.myscheme.gov.in",
    "Referer": "https://www.myscheme.gov.in/"
}

def clean_text_list(items):
    """Recursively extract text from rich content structure if needed."""
    if not items:
        return []
    res = []
    for item in items:
        if isinstance(item, str):
            res.append(item)
        elif isinstance(item, dict):
            # Try to get text or children
            if "text" in item:
                res.append(item["text"])
            elif "children" in item:
                res.extend(clean_text_list(item["children"]))
    return res

def extract_benefit_amount(benefits_text):
    """Use regex to find benefit amount (e.g. ₹ 6,000 or Rs. 6000)."""
    if not benefits_text:
        return None
    # Look for amounts
    matches = re.findall(r'(?:₹|Rs\.?)\s*([\d,]+)', benefits_text)
    if matches:
        # Get the highest amount found or first
        amounts = [int(m.replace(",", "")) for m in matches if m.replace(",", "").isdigit()]
        if amounts:
            return max(amounts)
    return None

def extract_demographics(desc_text, elig_text):
    """Extract gender, caste, age, income, occupations from text."""
    combined = (desc_text + " " + elig_text).lower()
    
    # 1. Gender
    gender = "any"
    if re.search(r'\bfemale\b|\bwomen\b|\bgirl\b', combined):
        gender = "female"
    elif re.search(r'\bmale\b|\bmen\b', combined) and not re.search(r'\bfemale\b|\bwomen\b', combined):
        gender = "male"
        
    # 2. Caste
    castes = []
    if re.search(r'\bsc\b|\bscheduled\s+caste', combined):
        castes.append("SC")
    if re.search(r'\bst\b|\bscheduled\s+tribe', combined):
        castes.append("ST")
    if re.search(r'\bobc\b|\bother\s+backward', combined):
        castes.append("OBC")
    if re.search(r'\bews\b|\beconomically\s+weaker', combined):
        castes.append("EWS")
    if re.search(r'\bgen\b|\bgeneral\b', combined):
        castes.append("GEN")
        
    if not castes:
        castes = ["GEN", "OBC", "SC", "ST", "EWS"] # default to all
        
    # 3. Age
    min_age = None
    max_age = None
    age_match = re.search(r'(\d+)\s*(?:to|-)\s*(\d+)\s*years', combined)
    if age_match:
        min_age = int(age_match.group(1))
        max_age = int(age_match.group(2))
    else:
        # Check for above/below age limits
        above_match = re.search(r'(?:above|at least|minimum of)\s*(\d+)\s*years', combined)
        if above_match:
            min_age = int(above_match.group(1))
        below_match = re.search(r'(?:below|up to|maximum of|under)\s*(\d+)\s*years', combined)
        if below_match:
            max_age = int(below_match.group(1))
            
    # 4. Income
    max_income = None
    income_match = re.search(r'(?:income|annual|family).{0,30}(?:₹|Rs\.?)\s*([\d,]+)|(?:₹|Rs\.?)\s*([\d,]+).{0,30}(?:income|annual|family)', combined)
    if income_match:
        raw = income_match.group(1) or income_match.group(2)
        if raw:
            max_income = int(raw.replace(",", ""))
            
    # 5. Occupations
    occ_map = {
        "farmer": ["farmer", "agriculture", "cultivator", "kisan"],
        "student": ["student", "scholar", "school", "college"],
        "unorganised_worker": ["unorganised", "informal", "labour", "worker", "artisan"],
        "self_employed": ["self-employed", "entrepreneur", "business owner"],
        "unemployed": ["unemployed", "job seeker"],
        "salaried": ["salaried", "employee", "government servant"]
    }
    occupations = []
    for occ, keywords in occ_map.items():
        for kw in keywords:
            if re.search(r'\b' + re.escape(kw) + r'\b', combined):
                occupations.append(occ)
                break
    if not occupations:
        occupations = ["All"]
        
    return gender, castes, min_age, max_age, max_income, occupations

def extract_benefit_type(combined_text):
    """Classify scheme into a benefit type."""
    text = combined_text.lower()
    # Remove false positives
    text = text.replace("crop health", "crop")
    
    benefit_keywords = {
        "cash_transfer":  ["cash", "dbt", "financial assistance", "stipend", "grant", "subsidy", "incentive", "income support", "assistance", "installments"],
        "scholarship":    ["scholarship", "fellowship", "education", "tuition", "school", "educational"],
        "housing":        ["house", "housing", "awas", "flat", "shelter"],
        "subsidy":        ["subsidy", "loan", "credit", "interest subvention"],
        "insurance":      ["insurance", "pension", "maan-dhan", "social security"],
        "food_subsidy":   ["food", "ration", "nutrition", "meal", "grain"],
        "healthcare":     ["health", "medical", "treatment", "hospital", "ayushman"],
        "employment":     ["employment", "job", "rozgar", "work opportunity"]
    }
    for btype, keywords in benefit_keywords.items():
        for kw in keywords:
            if re.search(r'\b' + re.escape(kw) + r'\b', text):
                return btype
    return "other"

def parse_scheme_data(main_data, docs_data, app_data):
    """Parse main_data, docs_data, app_data into our database schema."""
    slug = main_data.get("slug")
    en = main_data.get("en", {})
    bd = en.get("basicDetails", {})
    sc = en.get("schemeContent", {})
    
    name = bd.get("schemeName")
    ministry = bd.get("nodalMinistryName", {}).get("label", "")
    
    desc_md = sc.get("detailedDescription_md", "")
    benefits_md = sc.get("benefits_md", "")
    elig_md = en.get("eligibilityCriteria", {}).get("eligibilityDescription_md", "")
    exclusions_md = sc.get("exclusions_md", "")
    
    # Extract benefit amount and type
    benefit_amt = extract_benefit_amount(benefits_md + " " + desc_md)
    benefit_type = extract_benefit_type(bd.get("schemeShortTitle", "") + " " + name + " " + desc_md + " " + benefits_md)
    
    # Extract demographics
    gender, castes, min_age, max_age, max_income, occupations = extract_demographics(desc_md, elig_md)
    
    # Extract states
    states_list = bd.get("beneficiaryState", [])
    applicable_states = [s.get("label") for s in states_list if s.get("label")] if isinstance(states_list, list) else None
    if not applicable_states:
        applicable_states = ["All"]
        
    # Extract documents
    docs_list = []
    if docs_data and "data" in docs_data:
        req_docs = docs_data["data"].get("en", {}).get("documents_required", [])
        # Extract plain strings
        for doc in req_docs:
            if isinstance(doc, str):
                docs_list.append(doc)
            elif isinstance(doc, dict):
                # check children
                for child in doc.get("children", []):
                    if "text" in child and child["text"].strip():
                        docs_list.append(child["text"].strip())
                    elif "children" in child:
                        for subchild in child.get("children", []):
                            if "text" in subchild and subchild["text"].strip():
                                docs_list.append(subchild["text"].strip())
                                
    # Clean empty strings and limit count
    docs_list = [d for d in docs_list if d][:8]
    if not docs_list:
        docs_list = ["Aadhaar Card", "Identity Proof", "Address Proof"]
        
    # Application URL
    app_url = f"https://www.myscheme.gov.in/schemes/{slug}"
    if app_data and "data" in app_data:
        channels = app_data["data"].get("applicationChannel", [])
        if channels and isinstance(channels, list):
            first_url = channels[0].get("applicationUrl")
            if first_url:
                app_url = first_url
                
    scheme_id = f"{slug.upper().replace('-', '_')}_SCRAPED"
    
    return {
        "scheme_id": scheme_id,
        "name": name,
        "ministry": ministry,
        "benefit_type": benefit_type,
        "benefit_amount": benefit_amt,
        "applicable_states": applicable_states,
        "gender": gender,
        "caste_categories": castes,
        "min_age": min_age,
        "max_age": max_age,
        "max_income": max_income,
        "occupation_types": occupations,
        "documents_required": docs_list,
        "application_url": app_url,
        "is_rolling": True,
        "verified_at": datetime.today().strftime("%Y-%m-%d"),
        "active": True
    }

# Load the saved detail files for testing
with open("scratch/detail_api_main.json", "r", encoding="utf-8") as f:
    main_data = json.load(f)
with open("scratch/detail_api_docs.json", "r", encoding="utf-8") as f:
    docs_data = json.load(f)
with open("scratch/detail_api_app.json", "r", encoding="utf-8") as f:
    app_data = json.load(f)

parsed = parse_scheme_data(main_data, docs_data, app_data)
print("Parsed Result:")
print(json.dumps(parsed, indent=2))
