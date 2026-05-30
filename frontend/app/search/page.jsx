"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ChatBot from "../../components/ChatBot";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const DICT = {
  en: {
    title: "AI Semantic Search",
    subtitle: "Search by intent or situation instead of exact keywords",
    placeholder: "e.g. financial aid for poor SC female student to study...",
    btnSearch: "Search Schemes",
    searching: "Embedding query & matching schemes...",
    hint: "Try typing your gender, state, occupation, and what help you need.",
    match: "Similarity Match",
    results: "Schemes found by intent match:",
    noResults: "No schemes matched your search intent. Try describing your situation differently.",
    back: "← Back to Feed"
  },
  ta: {
    title: "AI கருத்தியல் தேடல்",
    subtitle: "விசைச்சொற்களுக்குப் பதிலாக உங்கள் தேவை அல்லது சூழலை வைத்து தேடுங்கள்",
    placeholder: "எ.கா. ஏழை ஆதிதிராவிடர் பெண் மாணவர் படிக்க கல்வி உதவித்தொகை...",
    btnSearch: "திட்டங்களை தேடு",
    searching: "தேடலை பகுப்பாய்வு செய்து பொருத்துகிறது...",
    hint: "உங்கள் பாலினம், மாநிலம், தொழில் மற்றும் தேவையான உதவியை விவரித்து எழுதவும்.",
    match: "பொருத்தமான அளவு",
    results: "உங்கள் சூழலுக்குப் பொருந்தும் திட்டங்கள்:",
    noResults: "உங்கள் தேடல் சூழலுக்குப் பொருந்தும் திட்டங்கள் எதுவும் இல்லை. மாற்று வார்த்தைகளில் விவரிக்கவும்.",
    back: "← பின்னே செல்ல"
  },
  hi: {
    title: "AI सिमेंटिक खोज",
    subtitle: "सटीक कीवर्ड के बजाय अपनी आवश्यकता या स्थिति के आधार पर खोजें",
    placeholder: "उदा. गरीब एससी महिला छात्र को पढ़ाई के लिए वित्तीय सहायता...",
    btnSearch: "योजनाएं खोजें",
    searching: "क्वेरी का विश्लेषण और योजनाओं का मिलान...",
    hint: "अपना लिंग, राज्य, पेशा और आपको क्या मदद चाहिए, यह विस्तार से लिखें।",
    match: "समानता प्रतिशत",
    results: "आपकी स्थिति से मेल खाने वाली योजनाएं:",
    noResults: "आपकी खोज स्थिति से मेल खाने वाली कोई योजना नहीं मिली। कृपया भिन्न तरीके से लिखें।",
    back: "← वापस जाएँ"
  }
};

const BENEFIT_COLORS = {
  cash_transfer:  { bg: "#eff6ff", color: "#1d4ed8", label: "Cash Transfer" },
  scholarship:    { bg: "#f0fdf4", color: "#15803d", label: "Scholarship" },
  subsidy:        { bg: "#fefce8", color: "#854d0e", label: "Subsidy" },
  insurance:      { bg: "#f5f3ff", color: "#6d28d9", label: "Insurance" },
  housing:        { bg: "#fff7ed", color: "#9a3412", label: "Housing" },
  employment:     { bg: "#f0fdf4", color: "#166534", label: "Employment" },
  healthcare:     { bg: "#fdf2f8", color: "#9d174d", label: "Healthcare" },
  food_subsidy:   { bg: "#fff7ed", color: "#c2410c", label: "Food Subsidy" },
  savings_scheme: { bg: "#eff6ff", color: "#1e40af", label: "Savings" },
  other:          { bg: "#f9fafb", color: "#374151", label: "Scheme" }
};

function SkeletonCard() {
  return (
    <div style={{ background: "#fff", border: "1px solid #f3f4f6", borderRadius: 16, padding: 20, marginBottom: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
        <div style={{ height: 20, width: "65%", background: "#f3f4f6", borderRadius: 6 }} />
        <div style={{ height: 20, width: "20%", background: "#f3f4f6", borderRadius: 20 }} />
      </div>
      <div style={{ height: 14, width: "40%", background: "#f3f4f6", borderRadius: 6, marginBottom: 16 }} />
      <div style={{ height: 36, background: "#f3f4f6", borderRadius: 10 }} />
    </div>
  );
}

function SchemeCard({ scheme, onClick, matchLabel }) {
  const bt = BENEFIT_COLORS[scheme.benefit_type] || BENEFIT_COLORS.other;
  const matchPercentage = Math.round((scheme.similarity || 0) * 100);
  
  const formatAmount = () => {
    if (!scheme.benefit_amount) return null;
    const freq = scheme.benefit_frequency === "monthly" ? "/month"
               : scheme.benefit_frequency === "annual"  ? "/year"
               : scheme.benefit_frequency === "one-time" ? " one-time" : "";
    return `Rs.${scheme.benefit_amount.toLocaleString("en-IN")}${freq}`;
  };

  return (
    <div onClick={onClick}
      style={{
        background: "#fff",
        border: "1px solid #f3f4f6",
        borderRadius: 16,
        padding: 20,
        marginBottom: 12,
        cursor: "pointer",
        transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
        animation: "fadeIn 0.4s ease-out"
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow = "0 8px 20px rgba(0,0,0,0.04)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6, gap: 8 }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, color: "#111827", margin: 0, flex: 1, lineHeight: 1.4 }}>{scheme.name}</h3>
        <span style={{ background: bt.bg, color: bt.color, fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20, whiteSpace: "nowrap" }}>{bt.label}</span>
      </div>
      <p style={{ fontSize: 13, color: "#6b7280", margin: "0 0 14px" }}>{scheme.ministry}</p>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        {formatAmount()
          ? <span style={{ fontSize: 16, fontWeight: 700, color: "#2563eb" }}>{formatAmount()}</span>
          : <span style={{ fontSize: 13, color: "#9ca3af" }}>Amount varies</span>}
          
        {/* Semantic similarity score badge */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{
            fontSize: 12,
            color: matchPercentage >= 80 ? "#16a34a" : (matchPercentage >= 60 ? "#d97706" : "#4b5563"),
            background: matchPercentage >= 80 ? "#f0fdf4" : (matchPercentage >= 60 ? "#fef3c7" : "#f3f4f6"),
            padding: "3px 8px",
            borderRadius: 8,
            fontWeight: 600
          }}>
            🎯 {matchPercentage}% {matchLabel}
          </span>
          <span style={{ color: "#9ca3af", fontSize: 18 }}>›</span>
        </div>
      </div>
    </div>
  );
}

export default function SemanticSearchPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [language, setLanguage] = useState("en");
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    // Read user's chosen language from local storage
    const savedLang = localStorage.getItem("language") || "en";
    setLanguage(savedLang);
  }, []);

  const t = DICT[language] || DICT.en;

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!query.trim() || query.length < 2) return;

    setLoading(true);
    setError(null);
    setSearched(true);

    try {
      const res = await fetch(`${API_URL}/schemes/semantic-search?q=${encodeURIComponent(query)}&lang=${language}`);
      if (!res.ok) throw new Error("Search service error");
      const data = await res.json();
      setResults(data.results || []);
    } catch (err) {
      setError("Could not connect to semantic search server. Verify backend is running and Supabase pgvector is enabled.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", maxWidth: 480, margin: "0 auto", background: "#f9fafb", fontFamily: "Inter, sans-serif", paddingBottom: 120 }}>
      {/* Header Banner */}
      <div style={{ background: "linear-gradient(135deg, #7c3aed 0%, #2563eb 100%)", padding: "24px 20px", color: "#fff", position: "relative" }}>
        <button onClick={() => router.push("/schemes")}
          style={{ background: "none", border: "none", color: "#e0e7ff", fontSize: 14, cursor: "pointer", padding: 0, marginBottom: 12, display: "block" }}>
          {t.back}
        </button>
        <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>🧠 {t.title}</h1>
        <p style={{ fontSize: 13, color: "#e0e7ff", margin: "6px 0 0", lineHeight: 1.4 }}>{t.subtitle}</p>
      </div>

      {/* Semantic Search Glassmorphic Card */}
      <div style={{ padding: "16px 16px 0" }}>
        <form onSubmit={handleSearch}
          style={{
            background: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: 20,
            padding: 20,
            boxShadow: "0 10px 25px rgba(0,0,0,0.03)",
            display: "flex",
            flexDirection: "column",
            gap: 12
          }}
        >
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t.placeholder}
            rows={3}
            style={{
              width: "100%",
              boxSizing: "border-box",
              border: "1px solid #e5e7eb",
              borderRadius: 14,
              padding: "14px 16px",
              fontSize: 14,
              lineHeight: 1.5,
              outline: "none",
              resize: "none",
              fontFamily: "Inter, sans-serif"
            }}
          />
          <p style={{ fontSize: 11, color: "#9ca3af", margin: 0, fontStyle: "italic" }}>
            💡 {t.hint}
          </p>
          <button
            type="submit"
            disabled={loading || !query.trim()}
            style={{
              background: "linear-gradient(135deg, #7c3aed 0%, #2563eb 100%)",
              color: "#fff",
              border: "none",
              borderRadius: 14,
              padding: 14,
              fontSize: 15,
              fontWeight: 600,
              cursor: "pointer",
              opacity: loading || !query.trim() ? 0.6 : 1,
              transition: "transform 0.1s"
            }}
          >
            {loading ? t.searching : t.btnSearch}
          </button>
        </form>
      </div>

      {/* Results Container */}
      <div style={{ padding: "20px 16px 0" }}>
        {searched && !loading && (
          <h2 style={{ fontSize: 15, fontWeight: 700, color: "#374151", margin: "0 0 12px" }}>
            {t.results}
          </h2>
        )}

        {loading && [1, 2, 3].map((i) => <SkeletonCard key={i} />)}

        {error && (
          <div style={{ background: "#fff", border: "1px solid #fee2e2", borderRadius: 16, padding: 20, textAlign: "center" }}>
            <p style={{ fontSize: 14, color: "#ef4444", margin: 0, fontWeight: 500 }}>{error}</p>
          </div>
        )}

        {!loading && searched && results.length === 0 && !error && (
          <div style={{ background: "#fff", border: "1px solid #f3f4f6", borderRadius: 16, padding: 32, textAlign: "center" }}>
            <p style={{ fontSize: 40, margin: "0 0 10px" }}>🕵️‍♂️</p>
            <p style={{ fontSize: 14, color: "#6b7280", margin: 0 }}>{t.noResults}</p>
          </div>
        )}

        {!loading && results.map((scheme) => (
          <SchemeCard
            key={scheme.scheme_id}
            scheme={scheme}
            matchLabel={t.match}
            onClick={() => router.push(`/schemes/${scheme.scheme_id}`)}
          />
        ))}
      </div>

      {/* RAG assistant chatbot */}
      <ChatBot language={language} />

      {/* Entrance fade animations stylesheet */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}