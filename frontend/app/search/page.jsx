"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AppLayout from "../../components/AppLayout";
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
    <div className="bg-white border border-gray-100 rounded-2xl p-5 mb-3 animate-pulse">
      <div className="flex justify-between mb-3">
        <div className="h-5 w-3/5 bg-gray-100 rounded-md" />
        <div className="h-5 w-1/5 bg-gray-100 rounded-full" />
      </div>
      <div className="h-3.5 w-2/5 bg-gray-100 rounded-md mb-4" />
      <div className="h-9 bg-gray-100 rounded-lg" />
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
    <div
      onClick={onClick}
      className="bg-white border border-gray-100 rounded-2xl p-5 mb-3 cursor-pointer transition-all duration-200 shadow-sm hover:shadow-md hover:-translate-y-0.5"
    >
      <div className="flex justify-between items-start mb-2 gap-2">
        <h3 className="text-[15px] font-semibold text-gray-900 leading-snug flex-1">
          {scheme.name}
        </h3>
        <span
          className="text-[10px] font-bold px-2.5 py-0.5 rounded-full whitespace-nowrap"
          style={{ backgroundColor: bt.bg, color: bt.color }}
        >
          {bt.label}
        </span>
      </div>
      <p className="text-xs text-gray-500 mb-3.5">{scheme.ministry}</p>
      <div className="flex items-center justify-between">
        {formatAmount() ? (
          <span className="text-[15px] font-bold text-blue-700">{formatAmount()}</span>
        ) : (
          <span className="text-xs text-gray-400">Amount varies</span>
        )}
          
        <div className="flex items-center gap-2">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
            matchPercentage >= 80 ? "bg-emerald-50 text-emerald-700" : (matchPercentage >= 60 ? "bg-amber-50 text-amber-700" : "bg-gray-100 text-gray-600")
          }`}>
            🎯 {matchPercentage}% {matchLabel}
          </span>
          <span className="text-gray-400 text-lg">›</span>
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
    <AppLayout activeTab="/search">
      <div className="w-full max-w-md mx-auto md:max-w-none md:mx-0 h-full flex flex-col md:flex-row gap-6 md:h-[calc(100vh-4rem)]">
        
        {/* Left Panel: Desktop Persistent Chatbot Counselor */}
        <div className="hidden md:block flex-1 h-full min-w-0">
          <ChatBot language={language} isInline={true} />
        </div>

        {/* Right Panel: Search Console */}
        <div className="flex-1 flex flex-col bg-[#f9fafb] md:bg-white md:border md:border-gray-200 md:rounded-3xl md:shadow-sm overflow-hidden h-full">
          
          {/* Header Banner */}
          <div className="bg-gradient-to-br from-blue-900 to-indigo-950 px-6 py-5 text-white flex-shrink-0 md:rounded-t-3xl shadow-sm">
            <button 
              onClick={() => router.push("/schemes")}
              className="bg-transparent border-0 text-blue-200 text-xs font-semibold cursor-pointer p-0 mb-2.5 block hover:text-white"
            >
              {t.back}
            </button>
            <h1 className="text-lg font-bold m-0 flex items-center gap-2">🧠 {t.title}</h1>
            <p className="text-xs text-blue-200/90 mt-1 m-0 leading-relaxed">{t.subtitle}</p>
          </div>

          {/* Search box controls */}
          <div className="p-5 border-b border-gray-50 bg-white flex-shrink-0">
            <form onSubmit={handleSearch} className="flex flex-col gap-3">
              <textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t.placeholder}
                rows={3}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none resize-none box-border focus:border-blue-500 font-sans leading-relaxed"
              />
              <div className="flex justify-between items-center">
                <span className="text-[11px] text-gray-400 font-medium italic">
                  💡 {t.hint}
                </span>
                <button
                  type="submit"
                  disabled={loading || !query.trim()}
                  className="bg-blue-900 text-white border-0 rounded-xl px-5 py-2.5 text-xs font-bold cursor-pointer transition-transform duration-100 active:scale-95 shadow-sm disabled:opacity-50 whitespace-nowrap"
                >
                  {loading ? t.searching : t.btnSearch}
                </button>
              </div>
            </form>
          </div>

          {/* Results container */}
          <div className="flex-1 overflow-y-auto px-5 pb-24 md:pb-6 pt-4 custom-scrollbar bg-gray-50/20">
            {searched && !loading && (
              <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3.5 m-0">
                {t.results}
              </h2>
            )}

            {loading && [1, 2, 3].map((i) => <SkeletonCard key={i} />)}

            {error && (
              <div className="bg-white border border-red-100 rounded-2xl p-5 text-center shadow-sm">
                <p className="text-xs font-semibold text-red-600 m-0">{error}</p>
              </div>
            )}

            {!loading && searched && results.length === 0 && !error && (
              <div className="bg-white border border-gray-100 rounded-2xl p-8 text-center shadow-sm">
                <p className="text-3xl m-0 mb-2">🕵️‍♂️</p>
                <p className="text-xs text-gray-500 m-0 leading-relaxed">{t.noResults}</p>
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
        </div>
      </div>

      {/* Floating chatbot bubble for mobile only */}
      <div className="md:hidden">
        <ChatBot language={language} isInline={false} />
      </div>
    </AppLayout>
  );
}