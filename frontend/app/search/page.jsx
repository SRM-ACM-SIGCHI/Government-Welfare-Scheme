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
    searching: "Matching intent in database...",
    hint: "Try typing your state, caste category, gender, and the assistance you need.",
    match: "Match Score",
    results: "Schemes matched by intent:",
    noResults: "No schemes matched your search intent. Try describing your situation differently.",
    back: "← Back to matched schemes"
  },
  ta: {
    title: "AI கருத்தியல் தேடல்",
    subtitle: "விசைச்சொற்களுக்குப் பதிலாக உங்கள் தேவை அல்லது சூழலை வைத்து தேடுங்கள்",
    placeholder: "எ.கா. ஏழை ஆதிதிராவிடர் பெண் மாணவர் படிக்க கல்வி உதவித்தொகை...",
    btnSearch: "திட்டங்களை தேடு",
    searching: "தேடலைப் பொருத்துகிறது...",
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
    searching: "योजनाओं का मिलान हो रहा है...",
    hint: "अपना लिंग, राज्य, पेशा और आपको क्या मदद चाहिए, यह विस्तार से लिखें।",
    match: "समानता स्कोर",
    results: "आपकी स्थिति से मेल खाने वाली योजनाएं:",
    noResults: "आपकी खोज स्थिति से मेल खाने वाली कोई योजना नहीं मिली। कृपया भिन्न तरीके से लिखें।",
    back: "← वापस जाएँ"
  }
};

const BENEFIT_COLORS = {
  cash_transfer:  { bg: "bg-blue-50/70 text-blue-700 border-blue-100", label: "Cash Transfer" },
  scholarship:    { bg: "bg-emerald-50/70 text-emerald-700 border-emerald-100", label: "Scholarship" },
  subsidy:        { bg: "bg-amber-50/70 text-amber-800 border-amber-100", label: "Subsidy" },
  insurance:      { bg: "bg-purple-50/70 text-purple-700 border-purple-100", label: "Insurance" },
  housing:        { bg: "bg-orange-50/70 text-orange-700 border-orange-100", label: "Housing" },
  employment:     { bg: "bg-teal-50/70 text-teal-700 border-teal-100", label: "Employment" },
  healthcare:     { bg: "bg-rose-50/70 text-rose-700 border-rose-100", label: "Healthcare" },
  food_subsidy:   { bg: "bg-orange-50/70 text-orange-800 border-orange-100", label: "Food Subsidy" },
  savings_scheme: { bg: "bg-indigo-50/70 text-indigo-700 border-indigo-100", label: "Savings" },
  other:          { bg: "bg-slate-50 text-slate-700 border-slate-100", label: "Scheme" }
};

function SkeletonCard() {
  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-5 mb-3.5 animate-pulse shadow-sm">
      <div className="flex justify-between items-start mb-3">
        <div className="h-5 w-3/5 bg-slate-100 rounded-lg" />
        <div className="h-5 w-1/5 bg-slate-100 rounded-full" />
      </div>
      <div className="h-3.5 w-2/5 bg-slate-100 rounded-md mb-4" />
      <div className="h-9 bg-slate-100 rounded-2xl w-full" />
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
      className="bg-white border border-slate-200 rounded-3xl p-5 mb-3.5 cursor-pointer transition-all duration-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 select-none"
    >
      <div className="flex justify-between items-start mb-3 gap-3">
        <h3 className="text-sm font-bold text-slate-900 leading-snug flex-1 pr-1">
          {scheme.name}
        </h3>
        <span className={`text-[9px] font-extrabold px-2.5 py-0.5 rounded-full border whitespace-nowrap uppercase tracking-wider ${bt.bg}`}>
          {bt.label}
        </span>
      </div>
      
      <p className="text-[11px] text-slate-400 font-semibold mb-4 leading-normal">
        {scheme.ministry}
      </p>
      
      <div className="flex items-center justify-between border-t border-slate-50 pt-3">
        {formatAmount() ? (
          <span className="text-sm font-extrabold text-indigo-900">{formatAmount()}</span>
        ) : (
          <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Amount Varies</span>
        )}
          
        <div className="flex items-center gap-2">
          <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-md border ${
            matchPercentage >= 80 
              ? "bg-emerald-50 text-emerald-700 border-emerald-100/60" 
              : (matchPercentage >= 60 ? "bg-amber-50 text-amber-800 border-amber-100/60" : "bg-slate-50 text-slate-600 border-slate-100")
          }`}>
            🎯 {matchPercentage}% {matchLabel}
          </span>
          <span className="text-slate-300 text-base font-bold">›</span>
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
        <div className="flex-1 flex flex-col bg-slate-50 md:bg-white md:border md:border-slate-200 md:rounded-3xl md:shadow-sm overflow-hidden h-full">
          
          {/* Header Banner */}
          <div className="bg-gradient-to-br from-indigo-900 to-blue-900 px-6 py-5 text-white flex-shrink-0 md:rounded-t-3xl shadow-sm">
            <button 
              onClick={() => router.push("/schemes")}
              className="bg-transparent border-0 text-indigo-200 hover:text-white text-xs font-bold cursor-pointer p-0 mb-3.5 block transition-colors"
            >
              {t.back}
            </button>
            <h1 className="text-lg font-extrabold m-0 flex items-center gap-2">🧠 {t.title}</h1>
            <p className="text-xs text-indigo-200/90 mt-1 m-0 leading-relaxed font-medium">{t.subtitle}</p>
          </div>

          {/* Search box controls */}
          <div className="p-5 border-b border-slate-100 bg-white flex-shrink-0">
            <form onSubmit={handleSearch} className="flex flex-col gap-3.5">
              <textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t.placeholder}
                rows={3}
                className="w-full border border-slate-200 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 rounded-2xl px-4 py-3 text-xs outline-none resize-none box-border font-sans font-semibold text-slate-700 leading-relaxed placeholder-slate-400 transition-all shadow-sm"
              />
              <div className="flex justify-between items-center gap-3">
                <span className="text-[10px] text-slate-400 font-bold italic leading-normal flex-1 max-w-[70%]">
                  💡 {t.hint}
                </span>
                <button
                  type="submit"
                  disabled={loading || !query.trim()}
                  className="bg-indigo-900 hover:bg-indigo-800 text-white border-0 rounded-2xl px-5 py-3 text-xs font-bold cursor-pointer transition-transform duration-100 active:scale-95 shadow-sm disabled:opacity-50 whitespace-nowrap"
                >
                  {loading ? t.searching : t.btnSearch}
                </button>
              </div>
            </form>
          </div>

          {/* Results container */}
          <div className="flex-1 overflow-y-auto px-5 pb-24 md:pb-6 pt-5 custom-scrollbar bg-slate-50/30">
            {searched && !loading && (
              <h2 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-3.5 m-0">
                {t.results}
              </h2>
            )}

            {loading && [1, 2, 3].map((i) => <SkeletonCard key={i} />)}

            {error && (
              <div className="bg-white border border-red-100 rounded-3xl p-5 text-center shadow-sm">
                <p className="text-xs font-bold text-red-600 m-0 leading-normal">{error}</p>
              </div>
            )}

            {!loading && searched && results.length === 0 && !error && (
              <div className="bg-white border border-slate-200 rounded-3xl p-8 text-center shadow-sm select-none">
                <p className="text-4xl m-0 mb-3">🕵️‍♂️</p>
                <p className="text-xs text-slate-500 font-bold m-0 leading-relaxed max-w-xs mx-auto">{t.noResults}</p>
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