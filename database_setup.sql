-- Connect to Supabase or your Postgres instance and run this
-- to initialize your database schema.

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
    active BOOLEAN DEFAULT TRUE
);
