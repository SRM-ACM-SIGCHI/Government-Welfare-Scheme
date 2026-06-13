import asyncio
import sys
import os
import datetime
sys.path.insert(0, os.path.abspath("."))

from database import connect_db, disconnect_db, get_pool
from services.gemini import build_scheme_search_text, generate_embedding

SCHEMES_TO_SEED = [
    # 1. PM-KISAN (Existing)
    {
        "scheme_id": "pm-kisan",
        "name": "Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)",
        "name_ta": "பிரதம மந்திரி கிசான் சம்மான் நிதி (PM-KISAN)",
        "name_hi": "प्रधानमंत्री किसान सम्मान निधि (PM-KISAN)",
        "ministry": "Ministry of Agriculture and Farmers Welfare",
        "benefit_type": "cash_transfer",
        "benefit_amount": 6000,
        "benefit_frequency": "annual",
        "applicable_states": ["All"],
        "gender": "any",
        "caste_categories": ["All"],
        "min_age": 18,
        "max_age": 100,
        "max_income": None,
        "occupation_types": ["farmer"],
        "documents_required": ["Aadhaar Card", "Bank Account Details", "Land Holding Papers"],
        "application_url": "https://pmkisan.gov.in/",
        "application_deadline": None,
        "is_rolling": True,
        "verified_at": "2026-05-28",
        "active": True
    },
    # 2. AB-PMJAY (Existing)
    {
        "scheme_id": "ab-pmjay",
        "name": "Ayushman Bharat Pradhan Mantri Jan Arogya Yojana (AB-PMJAY)",
        "name_ta": "ஆயுஷ்மான் பாரத் பிரதம மந்திரி ஜன் ஆரோக்யா யோஜனா (AB-PMJAY)",
        "name_hi": "आयुष्मान भारत प्रधानमंत्री जन आरोग्य योजना (AB-PMJAY)",
        "ministry": "Ministry of Health and Family Welfare",
        "benefit_type": "insurance",
        "benefit_amount": 500000,
        "benefit_frequency": "annual",
        "applicable_states": ["All"],
        "gender": "any",
        "caste_categories": ["All"],
        "min_age": 0,
        "max_age": 100,
        "max_income": None,
        "occupation_types": ["unorganised_worker", "unemployed"],
        "documents_required": ["Aadhaar Card", "Ration Card"],
        "application_url": "https://mera.pmjay.gov.in/",
        "application_deadline": None,
        "is_rolling": True,
        "verified_at": "2026-05-28",
        "active": True
    },
    # 3. PMAY-G (Existing)
    {
        "scheme_id": "pmay-g",
        "name": "Pradhan Mantri Awas Yojana - Gramin (PMAY-G)",
        "name_ta": "பிரதம மந்திரி ஆவாஸ் யோஜனா - கிராமின் (PMAY-G)",
        "name_hi": "प्रधानमंत्री आवास योजना - ग्रामीण (PMAY-G)",
        "ministry": "Ministry of Rural Development",
        "benefit_type": "housing",
        "benefit_amount": 120000,
        "benefit_frequency": "one-time",
        "applicable_states": ["All"],
        "gender": "any",
        "caste_categories": ["All"],
        "min_age": 18,
        "max_age": 100,
        "max_income": None,
        "occupation_types": ["All"],
        "documents_required": ["Aadhaar Card", "Job Card", "Bank Account Details"],
        "application_url": "https://pmayg.nic.in/",
        "application_deadline": None,
        "is_rolling": True,
        "verified_at": "2026-05-28",
        "active": True
    },
    # 4. MGNREGA (Existing)
    {
        "scheme_id": "mgnrega",
        "name": "Mahatma Gandhi National Rural Employment Guarantee Act (MGNREGA)",
        "name_ta": "மகாத்மா காந்தி தேசிய ஊரக வேலை உறுதி சட்டம் (MGNREGA)",
        "name_hi": "महात्मा गांधी राष्ट्रीय ग्रामीण रोजगार गारंटी अधिनियम (MGNREGA)",
        "ministry": "Ministry of Rural Development",
        "benefit_type": "employment",
        "benefit_amount": None,
        "benefit_frequency": "one-time",
        "applicable_states": ["All"],
        "gender": "any",
        "caste_categories": ["All"],
        "min_age": 18,
        "max_age": 100,
        "max_income": None,
        "occupation_types": ["unemployed", "unorganised_worker"],
        "documents_required": ["Aadhaar Card", "Bank Account Details", "Photograph"],
        "application_url": "https://nrega.nic.in/",
        "application_deadline": None,
        "is_rolling": True,
        "verified_at": "2026-05-28",
        "active": True
    },
    # 5. SSY (Existing)
    {
        "scheme_id": "ssy",
        "name": "Sukanya Samriddhi Yojana (SSY)",
        "name_ta": "சுகன்யா சம்ரித்தி யோஜனா (SSY)",
        "name_hi": "सुकन्या समृद्धि योजना (SSY)",
        "ministry": "Ministry of Finance",
        "benefit_type": "savings_scheme",
        "benefit_amount": None,
        "benefit_frequency": "one-time",
        "applicable_states": ["All"],
        "gender": "female",
        "caste_categories": ["All"],
        "min_age": 0,
        "max_age": 10,
        "max_income": None,
        "occupation_types": ["All"],
        "documents_required": ["Birth Certificate of Girl Child", "Identity Proof of Parent", "Address Proof"],
        "application_url": "https://www.nsiindia.gov.in/",
        "application_deadline": None,
        "is_rolling": True,
        "verified_at": "2026-05-28",
        "active": True
    },
    # 6. APY (Existing)
    {
        "scheme_id": "apy",
        "name": "Atal Pension Yojana (APY)",
        "name_ta": "அடல் பென்ஷன் யோஜனா (APY)",
        "name_hi": "अटल पेंशन योजना (APY)",
        "ministry": "Ministry of Finance",
        "benefit_type": "insurance",
        "benefit_amount": 5000,
        "benefit_frequency": "monthly",
        "applicable_states": ["All"],
        "gender": "any",
        "caste_categories": ["All"],
        "min_age": 18,
        "max_age": 40,
        "max_income": None,
        "occupation_types": ["unorganised_worker", "self_employed"],
        "documents_required": ["Aadhaar Card", "Savings Bank Account"],
        "application_url": "https://www.pfrda.org.in/",
        "application_deadline": None,
        "is_rolling": True,
        "verified_at": "2026-05-28",
        "active": True
    },
    # 7. PMMVY (New)
    {
        "scheme_id": "pmmvy",
        "name": "Pradhan Mantri Matru Vandana Yojana (PMMVY)",
        "name_ta": "பிரதம மந்திரி மாத்ரு வந்தனா யோஜனா (PMMVY)",
        "name_hi": "प्रधानमंत्री मातृ वंदना योजना (PMMVY)",
        "ministry": "Ministry of Women and Child Development",
        "benefit_type": "cash_transfer",
        "benefit_amount": 5000,
        "benefit_frequency": "one-time",
        "applicable_states": ["All"],
        "gender": "female",
        "caste_categories": ["All"],
        "min_age": 19,
        "max_age": 50,
        "max_income": None,
        "occupation_types": ["All"],
        "documents_required": ["Aadhaar Card", "Mother and Child Protection Card", "Bank Passbook"],
        "application_url": "https://pmmvy.wcd.gov.in/",
        "application_deadline": None,
        "is_rolling": True,
        "verified_at": "2026-06-13",
        "active": True
    },
    # 8. PM SVANidhi (New)
    {
        "scheme_id": "pm-svanidhi",
        "name": "PM Street Vendor’s AtmaNirbhar Nidhi (PM SVANidhi)",
        "name_ta": "பிரதம மந்திரி தெரு வியாபாரிகள் ஆத்மநிர்பார் நிதி (PM SVANidhi)",
        "name_hi": "पीएम स्ट्रीट वेंडर्स आत्मनिर्भर निधि (PM SVANidhi)",
        "ministry": "Ministry of Housing and Urban Affairs",
        "benefit_type": "subsidy",
        "benefit_amount": 10000,
        "benefit_frequency": "one-time",
        "applicable_states": ["All"],
        "gender": "any",
        "caste_categories": ["All"],
        "min_age": 18,
        "max_age": 99,
        "max_income": None,
        "occupation_types": ["self_employed"],
        "documents_required": ["Aadhaar Card", "Voter Identity Card", "Certificate of Vending"],
        "application_url": "https://pmsvanidhi.mohua.gov.in/",
        "application_deadline": None,
        "is_rolling": True,
        "verified_at": "2026-06-13",
        "active": True
    },
    # 9. PM Mudra Yojana (New)
    {
        "scheme_id": "pm-mudra",
        "name": "Pradhan Mantri MUDRA Yojana (PMMY)",
        "name_ta": "பிரதம மந்திரி முத்ரா யோஜனா (PMMY)",
        "name_hi": "प्रधानमंत्री मुद्रा योजना (PMMY)",
        "ministry": "Ministry of Finance",
        "benefit_type": "subsidy",
        "benefit_amount": 1000000,
        "benefit_frequency": "one-time",
        "applicable_states": ["All"],
        "gender": "any",
        "caste_categories": ["All"],
        "min_age": 18,
        "max_age": 65,
        "max_income": None,
        "occupation_types": ["self_employed"],
        "documents_required": ["Identity Proof", "Address Proof", "Business Identity / Address Proof"],
        "application_url": "https://www.mudra.org.in/",
        "application_deadline": None,
        "is_rolling": True,
        "verified_at": "2026-06-13",
        "active": True
    },
    # 10. SCSS (New)
    {
        "scheme_id": "scss",
        "name": "Senior Citizens Savings Scheme (SCSS)",
        "name_ta": "மூத்த குடிமக்கள் சேமிப்பு திட்டம் (SCSS)",
        "name_hi": "वरिष्ठ नागरिक बचत योजना (SCSS)",
        "ministry": "Ministry of Finance",
        "benefit_type": "savings_scheme",
        "benefit_amount": None,
        "benefit_frequency": "one-time",
        "applicable_states": ["All"],
        "gender": "any",
        "caste_categories": ["All"],
        "min_age": 60,
        "max_age": 120,
        "max_income": None,
        "occupation_types": ["All"],
        "documents_required": ["Aadhaar Card", "PAN Card", "Age Proof", "Two Passport Size Photos"],
        "application_url": "https://www.indiapost.gov.in/",
        "application_deadline": None,
        "is_rolling": True,
        "verified_at": "2026-06-13",
        "active": True
    },
    # 11. PM-SYM (New)
    {
        "scheme_id": "pm-sym",
        "name": "Pradhan Mantri Shram Yogi Maan-dhan (PM-SYM)",
        "name_ta": "பிரதம மந்திரி ஷ்ரம் யோகி மான்-தன் (PM-SYM)",
        "name_hi": "प्रधानमंत्री श्रम योगी मान-धन (PM-SYM)",
        "ministry": "Ministry of Labour and Employment",
        "benefit_type": "insurance",
        "benefit_amount": 3000,
        "benefit_frequency": "monthly",
        "applicable_states": ["All"],
        "gender": "any",
        "caste_categories": ["All"],
        "min_age": 18,
        "max_age": 40,
        "max_income": 180000,  # 15,000 per month cap
        "occupation_types": ["unorganised_worker"],
        "documents_required": ["Aadhaar Card", "Savings Bank Account with IFSC", "Mobile Number"],
        "application_url": "https://maandhan.in/",
        "application_deadline": None,
        "is_rolling": True,
        "verified_at": "2026-06-13",
        "active": True
    },
    # 12. Stand-Up India (New)
    {
        "scheme_id": "standup-india",
        "name": "Stand-Up India Scheme",
        "name_ta": "ஸ்டாண்ட் அப் இந்தியா திட்டம்",
        "name_hi": "स्टैंड-अप इंडिया योजना",
        "ministry": "Ministry of Finance",
        "benefit_type": "subsidy",
        "benefit_amount": 10000000, # loan up to 1 crore
        "benefit_frequency": "one-time",
        "applicable_states": ["All"],
        "gender": "female",
        "caste_categories": ["SC", "ST"],
        "min_age": 18,
        "max_age": 99,
        "max_income": None,
        "occupation_types": ["self_employed"],
        "documents_required": ["Aadhaar Card", "Caste Certificate", "Business Plan Proposal", "Bank Statements"],
        "application_url": "https://www.standupmitra.in/",
        "application_deadline": None,
        "is_rolling": True,
        "verified_at": "2026-06-13",
        "active": True
    },
    # 13. Central Sector Scholarship (New)
    {
        "scheme_id": "central-sector-scholarship",
        "name": "Central Sector Scheme of Scholarship for College and University Students",
        "name_ta": "கல்லூரி மற்றும் பல்கலைக்கழக மாணவர்களுக்கான மத்திய துறை கல்வி உதவித்தொகை திட்டம்",
        "name_hi": "कॉलेज और विश्वविद्यालय के छात्रों के लिए छात्रवृत्ति की केंद्रीय क्षेत्र योजना",
        "ministry": "Ministry of Education",
        "benefit_type": "scholarship",
        "benefit_amount": 20000,
        "benefit_frequency": "annual",
        "applicable_states": ["All"],
        "gender": "any",
        "caste_categories": ["All"],
        "min_age": 18,
        "max_age": 25,
        "max_income": 450000,
        "occupation_types": ["student"],
        "documents_required": ["Aadhaar Card", "Class 12th Marksheet", "Income Certificate", "Fees Receipt"],
        "application_url": "https://scholarships.gov.in/",
        "application_deadline": None,
        "is_rolling": True,
        "verified_at": "2026-06-13",
        "active": True
    },
    # 14. LPG PAHAL Subsidy (New)
    {
        "scheme_id": "lpg-pahal",
        "name": "Pradhan Mantri PAHAL LPG Subsidy Scheme Scheme",
        "name_ta": "பிரதம மந்திரி பகல் எல்பிஜி மானியத் திட்டம்",
        "name_hi": "प्रधानमंत्री पहल एलपीजी सब्सिडी योजना",
        "ministry": "Ministry of Petroleum and Natural Gas",
        "benefit_type": "subsidy",
        "benefit_amount": None,
        "benefit_frequency": "one-time",
        "applicable_states": ["All"],
        "gender": "any",
        "caste_categories": ["All"],
        "min_age": 18,
        "max_age": 120,
        "max_income": 1000000,
        "occupation_types": ["All"],
        "documents_required": ["Aadhaar Card", "LPG Connection Blue Book", "Bank Account Linked to LPG"],
        "application_url": "https://mylpg.in/",
        "application_deadline": None,
        "is_rolling": True,
        "verified_at": "2026-06-13",
        "active": True
    }
]

async def seed():
    print("[SEEDER] Connecting to database...")
    await connect_db()
    pool = get_pool()
    if pool is None:
        print("[SEEDER] [ERROR] Database connection failed. Cannot seed.")
        return

    print(f"[SEEDER] Seeding {len(SCHEMES_TO_SEED)} schemes...")
    async with pool.acquire() as conn:
        for s in SCHEMES_TO_SEED:
            # First, check if embedding exists for this scheme
            row = await conn.fetchrow("SELECT embedding FROM schemes WHERE scheme_id = $1", s["scheme_id"])
            embedding_val = None
            if row and row["embedding"]:
                embedding_val = row["embedding"]
                print(f"  [SEEDER] Scheme '{s['scheme_id']}' already has an embedding. Reusing it.")
            else:
                # Generate new embedding
                search_text = build_scheme_search_text(s)
                try:
                    embedding_val = await generate_embedding(search_text)
                    print(f"  [SEEDER] Generated new embedding via Gemini for: {s['scheme_id']}")
                except Exception as ex:
                    print(f"  [SEEDER] [WARNING] Failed to generate embedding for {s['scheme_id']}: {ex}. Using fallback zero vector.")
                    # Fallback to zero vector of dimension 768
                    embedding_val = [0.0] * 768

            # Parse strings into actual datetime.date objects for Postgres DATE columns
            verified_date = None
            if s.get("verified_at"):
                verified_date = datetime.date.fromisoformat(s["verified_at"])
                
            deadline_date = None
            if s.get("application_deadline"):
                deadline_date = datetime.date.fromisoformat(s["application_deadline"])

            # Insert/Update the scheme
            try:
                await conn.execute(
                    """
                    INSERT INTO schemes (
                        scheme_id, name, name_ta, name_hi, ministry, benefit_type,
                        benefit_amount, benefit_frequency, applicable_states,
                        gender, caste_categories, min_age, max_age, max_income,
                        occupation_types, documents_required, application_url,
                        application_deadline, is_rolling, verified_at, active, embedding
                    ) VALUES (
                        $1, $2, $3, $4, $5, $6,
                        $7, $8, $9,
                        $10, $11, $12, $13, $14,
                        $15, $16, $17,
                        $18, $19, $20, $21, $22
                    )
                    ON CONFLICT (scheme_id) DO UPDATE SET
                        name = EXCLUDED.name,
                        name_ta = EXCLUDED.name_ta,
                        name_hi = EXCLUDED.name_hi,
                        ministry = EXCLUDED.ministry,
                        benefit_type = EXCLUDED.benefit_type,
                        benefit_amount = EXCLUDED.benefit_amount,
                        benefit_frequency = EXCLUDED.benefit_frequency,
                        applicable_states = EXCLUDED.applicable_states,
                        gender = EXCLUDED.gender,
                        caste_categories = EXCLUDED.caste_categories,
                        min_age = EXCLUDED.min_age,
                        max_age = EXCLUDED.max_age,
                        max_income = EXCLUDED.max_income,
                        occupation_types = EXCLUDED.occupation_types,
                        documents_required = EXCLUDED.documents_required,
                        application_url = EXCLUDED.application_url,
                        application_deadline = EXCLUDED.application_deadline,
                        is_rolling = EXCLUDED.is_rolling,
                        verified_at = EXCLUDED.verified_at,
                        active = EXCLUDED.active,
                        embedding = COALESCE(EXCLUDED.embedding, schemes.embedding)
                    """,
                    s["scheme_id"],
                    s["name"],
                    s.get("name_ta"),
                    s.get("name_hi"),
                    s.get("ministry"),
                    s.get("benefit_type"),
                    s.get("benefit_amount"),
                    s.get("benefit_frequency"),
                    s.get("applicable_states"),
                    s.get("gender"),
                    s.get("caste_categories"),
                    s.get("min_age"),
                    s.get("max_age"),
                    s.get("max_income"),
                    s.get("occupation_types"),
                    s.get("documents_required"),
                    s.get("application_url"),
                    deadline_date,
                    s.get("is_rolling", True),
                    verified_date,
                    s.get("active", True),
                    str(embedding_val) if embedding_val else None
                )
                print(f"  [SEEDER] Successfully saved scheme: {s['scheme_id']}")
            except Exception as e:
                print(f"  [SEEDER] [ERROR] Failed to save {s['scheme_id']}: {e}")

    await disconnect_db()
    print("[SEEDER] Completed seeding successfully.")

if __name__ == "__main__":
    asyncio.run(seed())
