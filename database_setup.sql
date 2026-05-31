-- Connect to Supabase or your Postgres instance and run this
-- to initialize your database schema.

CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS schemes (
    scheme_id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    name_ta TEXT,
    name_hi TEXT,
    ministry TEXT,
    benefit_type TEXT,
    benefit_amount INTEGER,
    benefit_frequency TEXT,
    applicable_states TEXT[],
    gender TEXT,
    caste_categories TEXT[],
    min_age INTEGER,
    max_age INTEGER,
    max_income INTEGER,
    occupation_types TEXT[],
    documents_required TEXT[],
    application_url TEXT,
    application_deadline DATE,
    is_rolling BOOLEAN DEFAULT TRUE,
    verified_at DATE,
    embedding vector(768),
    active BOOLEAN DEFAULT TRUE
);

CREATE INDEX IF NOT EXISTS schemes_embedding_idx ON schemes USING hnsw (embedding vector_cosine_ops);

-- Hardcoded Scheme Inserts

INSERT INTO schemes (
    scheme_id, name, ministry, benefit_type, benefit_amount, 
    applicable_states, gender, caste_categories, 
    min_age, max_age, occupation_types, documents_required, 
    application_url, is_rolling, active
) VALUES
('pm-kisan', 'Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)', 'Ministry of Agriculture and Farmers Welfare', 'cash_transfer', 6000, 
 ARRAY['All'], 'any', ARRAY['All'], 18, 100, ARRAY['farmer'], ARRAY['Aadhaar Card', 'Bank Account Details', 'Land Holding Papers'], 
 'https://pmkisan.gov.in/', TRUE, TRUE)
ON CONFLICT (scheme_id) DO NOTHING;

INSERT INTO schemes (
    scheme_id, name, ministry, benefit_type, benefit_amount, 
    applicable_states, gender, caste_categories, 
    min_age, max_age, occupation_types, documents_required, 
    application_url, is_rolling, active
) VALUES
('ab-pmjay', 'Ayushman Bharat Pradhan Mantri Jan Arogya Yojana (AB-PMJAY)', 'Ministry of Health and Family Welfare', 'insurance', 500000, 
 ARRAY['All'], 'any', ARRAY['All'], 0, 100, ARRAY['unorganised_worker', 'unemployed'], ARRAY['Aadhaar Card', 'Ration Card'], 
 'https://mera.pmjay.gov.in/', TRUE, TRUE)
ON CONFLICT (scheme_id) DO NOTHING;

INSERT INTO schemes (
    scheme_id, name, ministry, benefit_type, benefit_amount, 
    applicable_states, gender, caste_categories, 
    min_age, max_age, occupation_types, documents_required, 
    application_url, is_rolling, active
) VALUES
('pmay-g', 'Pradhan Mantri Awas Yojana - Gramin (PMAY-G)', 'Ministry of Rural Development', 'housing', 120000, 
 ARRAY['All'], 'any', ARRAY['All'], 18, 100, ARRAY['All'], ARRAY['Aadhaar Card', 'Job Card', 'Bank Account Details'], 
 'https://pmayg.nic.in/', TRUE, TRUE)
ON CONFLICT (scheme_id) DO NOTHING;

INSERT INTO schemes (
    scheme_id, name, ministry, benefit_type, benefit_amount,
    applicable_states, gender, caste_categories,
    min_age, max_age, occupation_types, documents_required,
    application_url, is_rolling, active
) VALUES
('mgnrega', 'Mahatma Gandhi National Rural Employment Guarantee Act (MGNREGA)', 'Ministry of Rural Development', 'employment', NULL,
 ARRAY['All'], 'any', ARRAY['All'], 18, 100, ARRAY['unemployed', 'unorganised_worker'], ARRAY['Aadhaar Card', 'Bank Account Details', 'Photograph'],
 'https://nrega.nic.in/', TRUE, TRUE)
ON CONFLICT (scheme_id) DO NOTHING;

INSERT INTO schemes (
    scheme_id, name, ministry, benefit_type, benefit_amount,
    applicable_states, gender, caste_categories,
    min_age, max_age, occupation_types, documents_required,
    application_url, is_rolling, active
) VALUES
('ssy', 'Sukanya Samriddhi Yojana (SSY)', 'Ministry of Finance', 'saving', NULL,
 ARRAY['All'], 'female', ARRAY['All'], 0, 10, ARRAY['All'], ARRAY['Birth Certificate of Girl Child', 'Identity Proof of Parent', 'Address Proof'],
 'https://www.nsiindia.gov.in/', TRUE, TRUE)
ON CONFLICT (scheme_id) DO NOTHING;

INSERT INTO schemes (
    scheme_id, name, ministry, benefit_type, benefit_amount,
    applicable_states, gender, caste_categories,
    min_age, max_age, occupation_types, documents_required,
    application_url, is_rolling, active
) VALUES
('apy', 'Atal Pension Yojana (APY)', 'Ministry of Finance', 'pension', 5000,
 ARRAY['All'], 'any', ARRAY['All'], 18, 40, ARRAY['unorganised_worker', 'self_employed'], ARRAY['Aadhaar Card', 'Savings Bank Account'],
 'https://www.pfrda.org.in/', TRUE, TRUE)
ON CONFLICT (scheme_id) DO NOTHING;

