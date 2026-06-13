"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AppLayout from "../../components/AppLayout";
import ChatBot from "../../components/ChatBot";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

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
  other:          { bg: "bg-slate-50 text-slate-700 border-slate-100", label: "Scheme" },
};

const DOC_LABELS = {
  aadhaar:               "Aadhaar Card",
  ration_card:           "Ration Card",
  bank_passbook:         "Bank Passbook",
  caste_certificate:     "Caste Certificate",
  income_certificate:    "Income Certificate",
  land_records:          "Land Records",
  mark_sheet:            "Mark Sheet / Certificates",
  birth_certificate:     "Birth Certificate",
  guardian_id:           "Guardian ID Proof",
  education_certificate: "Education Certificate",
  project_report:        "Project Report",
  mobile_number:         "Mobile Number",
  bpl_card:              "BPL Card",
  none_required:         "No documents required",
};

function SkeletonCard() {
  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-5 mb-3 animate-pulse shadow-sm">
      <div className="flex justify-between items-start mb-3">
        <div className="h-5 w-3/5 bg-slate-100 rounded-lg" />
        <div className="h-5 w-1/5 bg-slate-100 rounded-full" />
      </div>
      <div className="h-3 w-2/5 bg-slate-100 rounded-md mb-4" />
      <div className="flex justify-between items-center">
        <div className="h-5 w-1/4 bg-slate-100 rounded-md" />
        <div className="h-4 w-4 bg-slate-100 rounded-full" />
      </div>
    </div>
  );
}

function SchemeCard({ scheme, onClick, isActive }) {
  const bt = BENEFIT_COLORS[scheme.benefit_type] || BENEFIT_COLORS.other;
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
      className={`bg-white border rounded-3xl p-5 mb-3.5 cursor-pointer transition-all duration-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 select-none ${
        isActive ? "border-indigo-600 ring-2 ring-indigo-50 bg-indigo-50/5" : "border-slate-200"
      }`}
    >
      <div className="flex justify-between items-start mb-3 gap-3">
        <h3 className="text-sm font-bold text-slate-900 leading-snug flex-1 pr-1">
          {scheme.name}
        </h3>
        <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
          <span className={`text-[9px] font-extrabold px-2.5 py-0.5 rounded-full border whitespace-nowrap uppercase tracking-wider ${bt.bg}`}>
            {bt.label}
          </span>
          {scheme.similarity !== undefined && (
            <span className="bg-emerald-50 text-emerald-700 border border-emerald-100/60 text-[9px] font-extrabold px-2 py-0.5 rounded-md whitespace-nowrap">
              🎯 {Math.round(scheme.similarity * 100)}% Match
            </span>
          )}
        </div>
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
          {scheme.is_rolling && !scheme.application_deadline && (
            <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50/80 px-2 py-0.5 rounded-md border border-emerald-100/40">
              Open Now
            </span>
          )}
          <span className="text-slate-300 text-base font-bold transition-transform group-hover:translate-x-0.5">›</span>
        </div>
      </div>
    </div>
  );
}

export default function SchemesPage() {
  const router = useRouter();
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profile, setProfile] = useState(null);
  const [filter, setFilter] = useState("all");
  const [language, setLanguage] = useState("en");
  const [offlineMode, setOfflineMode] = useState(false);

  // Semantic search state
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);

  // Desktop Master-Detail active selection
  const [selectedSchemeId, setSelectedSchemeId] = useState(null);
  const [selectedDetails, setSelectedDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState(null);
  const [isTracked, setIsTracked] = useState(false);

  // Real-time eligibility state
  const [eligibilityCheck, setEligibilityCheck] = useState(null);
  const [checkingEligibility, setCheckingEligibility] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem("user_profile");
    if (!raw) {
      router.push("/onboarding");
      return;
    }
    const p = JSON.parse(raw);
    setProfile(p);

    const savedLang = localStorage.getItem("language") || "en";
    setLanguage(savedLang);

    fetchSchemes(p, savedLang);
  }, []);

  const fetchSchemes = async (p, langCode = "en") => {
    setLoading(true);
    setError(null);
    setIsSearching(false);
    setSearchQuery("");
    setSearchResults([]);
    setSelectedSchemeId(null);
    try {
      const res = await fetch(`${API_URL}/schemes/match`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_profile: p, language: langCode }),
      });
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data = await res.json();
      const loadedSchemes = data.schemes || [];
      setSchemes(loadedSchemes);
      setOfflineMode(false);
      
      // Cache matching schemes for offline use
      try {
        localStorage.setItem("cached_schemes", JSON.stringify(loadedSchemes));
      } catch (e) {}

      // Auto-select first scheme on desktop
      if (loadedSchemes.length > 0 && window.innerWidth >= 768) {
        setSelectedSchemeId(loadedSchemes[0].scheme_id);
      }
    } catch (err) {
      console.warn("Failed to fetch matching schemes. Trying local cache fallback.", err);
      // Attempt offline caching load
      try {
        const cached = localStorage.getItem("cached_schemes");
        if (cached) {
          const loadedSchemes = JSON.parse(cached);
          setSchemes(loadedSchemes);
          setOfflineMode(true);
          if (loadedSchemes.length > 0 && window.innerWidth >= 768) {
            setSelectedSchemeId(loadedSchemes[0].scheme_id);
          }
          return;
        }
      } catch (e) {}
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSemanticSearch = async (q) => {
    const queryTerm = q || searchQuery;
    if (!queryTerm.trim() || queryTerm.length < 2) return;

    setLoading(true);
    setError(null);
    setIsSearching(true);
    setSelectedSchemeId(null);
    try {
      const res = await fetch(`${API_URL}/schemes/semantic-search?q=${encodeURIComponent(queryTerm)}&lang=${language}`);
      if (!res.ok) throw new Error("Search service error");
      const data = await res.json();
      const results = data.results || [];
      setSearchResults(results);
      
      // Auto-select first search result on desktop
      if (results.length > 0 && window.innerWidth >= 768) {
        setSelectedSchemeId(results[0].scheme_id);
      }
    } catch (err) {
      setError("Could not connect to semantic search server. Verify backend is running.");
    } finally {
      setLoading(false);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setIsSearching(false);
    setSearchResults([]);
    setError(null);
    setSelectedSchemeId(schemes.length > 0 ? schemes[0].scheme_id : null);
  };

  // Fetch full details of the active scheme for the desktop side-panel
  useEffect(() => {
    if (!selectedSchemeId) {
      setSelectedDetails(null);
      setEligibilityCheck(null);
      return;
    }

    const fetchDetailsAndCheck = async () => {
      setDetailsLoading(true);
      setDetailsError(null);
      setEligibilityCheck(null);
      
      try {
        // 1. Fetch details
        const res = await fetch(`${API_URL}/schemes/${selectedSchemeId}`);
        if (!res.ok) throw new Error("Scheme details not found");
        const details = await res.json();
        setSelectedDetails(details);

        // Cache scheme details locally
        try {
          const cached = localStorage.getItem("cached_scheme_details") || "{}";
          const dict = JSON.parse(cached);
          dict[selectedSchemeId] = details;
          localStorage.setItem("cached_scheme_details", JSON.stringify(dict));
        } catch (e) {}

        // 2. Fetch eligibility logs in parallel
        if (profile) {
          setCheckingEligibility(true);
          const checkRes = await fetch(`${API_URL}/schemes/check/${selectedSchemeId}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(profile)
          });
          if (checkRes.ok) {
            setEligibilityCheck(await checkRes.json());
          }
        }
      } catch (err) {
        console.warn("Failed to fetch scheme details. Trying cache fallback.", err);
        // Attempt offline fallback from cached details
        try {
          const cached = localStorage.getItem("cached_scheme_details");
          if (cached) {
            const dict = JSON.parse(cached);
            if (dict[selectedSchemeId]) {
              setSelectedDetails(dict[selectedSchemeId]);
              setOfflineMode(true);
              return;
            }
          }
        } catch (e) {}
        setDetailsError(err.message);
      } finally {
        setDetailsLoading(false);
        setCheckingEligibility(false);
      }
    };

    fetchDetailsAndCheck();
  }, [selectedSchemeId, profile]);

  useEffect(() => {
    if (!selectedSchemeId) {
      setIsTracked(false);
      return;
    }
    const raw = localStorage.getItem("tracked_schemes") || "[]";
    try {
      const list = JSON.parse(raw);
      setIsTracked(list.some(s => s.scheme_id === selectedSchemeId));
    } catch (e) {
      setIsTracked(false);
    }
  }, [selectedSchemeId]);

  const handleToggleTrack = () => {
    if (!selectedDetails) return;
    const raw = localStorage.getItem("tracked_schemes") || "[]";
    let list = [];
    try { list = JSON.parse(raw); } catch (e) {}

    if (isTracked) {
      list = list.filter(s => s.scheme_id !== selectedSchemeId);
      setIsTracked(false);
    } else {
      list.push({
        scheme_id: selectedSchemeId,
        name: selectedDetails.name,
        status: "saved",
        notes: "",
        reminder_date: "",
        saved_at: new Date().toISOString()
      });
      setIsTracked(true);
    }
    localStorage.setItem("tracked_schemes", JSON.stringify(list));
  };

  const FILTERS = ["all", "cash_transfer", "scholarship", "subsidy", "insurance", "housing"];
  const activeSchemes = isSearching ? searchResults : schemes;
  const filtered = filter === "all" ? activeSchemes : activeSchemes.filter((s) => s.benefit_type === filter);

  // Fallback to select first matching option if active selection gets filtered out
  useEffect(() => {
    if (window.innerWidth >= 768 && filtered.length > 0) {
      const isStillVisible = filtered.some(s => s.scheme_id === selectedSchemeId);
      if (!isStillVisible) {
        setSelectedSchemeId(filtered[0].scheme_id);
      }
    } else if (filtered.length === 0) {
      setSelectedSchemeId(null);
    }
  }, [filter, schemes, searchResults, isSearching]);

  const handleCardClick = (schemeId) => {
    if (window.innerWidth >= 768) {
      setSelectedSchemeId(schemeId);
    } else {
      router.push(`/schemes/${schemeId}`);
    }
  };

  const activeBt = selectedDetails ? (BENEFIT_COLORS[selectedDetails.benefit_type] || BENEFIT_COLORS.other) : null;
  const activeFormatAmount = () => {
    if (!selectedDetails || !selectedDetails.benefit_amount) return null;
    const freq = selectedDetails.benefit_frequency === "monthly" ? "/month"
               : selectedDetails.benefit_frequency === "annual"  ? "/year"
               : selectedDetails.benefit_frequency === "one-time" ? " one-time" : "";
    return `Rs.${selectedDetails.benefit_amount.toLocaleString("en-IN")}${freq}`;
  };

  return (
    <AppLayout activeTab="/schemes">
      <div className="w-full max-w-md mx-auto md:max-w-none md:mx-0 h-full flex flex-col md:flex-row gap-6 md:h-[calc(100vh-4rem)] box-border">
        
        {/* Left Column: List Pane */}
        <div className="flex-1 flex flex-col min-w-0 bg-slate-50 md:bg-white md:border md:border-slate-200/80 md:rounded-3xl md:shadow-sm overflow-hidden h-full">
          
          {/* Header Controls */}
          <div className="bg-white border-b border-slate-100 p-5 sticky top-0 z-20 flex-shrink-0 md:rounded-t-3xl">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h1 className="text-lg font-extrabold text-slate-900 m-0 tracking-tight">
                  {isSearching ? "Search Results" : "Your Matches"}
                </h1>
                {!loading && (
                  <div className="flex items-center gap-2 mt-1.5">
                    <p className="text-[11px] text-slate-400 font-bold m-0 uppercase tracking-wider">
                      {filtered.length} scheme{filtered.length !== 1 ? "s" : ""} matched
                    </p>
                    {offlineMode && (
                      <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-800 border border-amber-200 text-[9px] font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider">
                        ⚠️ Offline
                      </span>
                    )}
                  </div>
                )}
              </div>
              <button
                onClick={() => { handleClearSearch(); if (profile) fetchSchemes(profile, language); }}
                className="bg-slate-50 hover:bg-slate-100 text-slate-600 border-0 rounded-2xl px-4 py-2 text-xs font-bold cursor-pointer transition-colors duration-150 shadow-sm"
              >
                {isSearching ? "Reset" : "Refresh"}
              </button>
            </div>

            {/* Semantic Search Box */}
            <form
              onSubmit={(e) => { e.preventDefault(); handleSemanticSearch(searchQuery); }}
              className="flex gap-2 mb-4"
            >
              <div className="relative flex-1">
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Describe your situation (e.g. farmer girl student)..."
                  className="w-full py-2.5 pl-4 pr-10 rounded-2xl border border-slate-200 text-xs outline-none box-border transition-colors duration-150 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 font-semibold text-slate-700 placeholder-slate-400 shadow-sm"
                />
                {searchQuery && (
                  <button 
                    type="button" 
                    onClick={handleClearSearch}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 bg-transparent border-none text-slate-400 hover:text-slate-800 text-base cursor-pointer p-1 transition-colors"
                  >
                    ×
                  </button>
                )}
              </div>
              <button 
                type="submit" 
                className="bg-indigo-900 hover:bg-indigo-850 text-white border-0 rounded-2xl px-5 py-2.5 text-xs font-bold cursor-pointer transition-transform duration-100 active:scale-95 shadow-sm whitespace-nowrap"
              >
                Search
              </button>
            </form>

            {/* Filter chips */}
            <div className="flex gap-2 overflow-x-auto pb-1.5 custom-scrollbar select-none">
              {FILTERS.map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2 rounded-full border-0 text-xs font-bold cursor-pointer transition-all duration-150 whitespace-nowrap flex-shrink-0 ${
                    filter === f 
                      ? "bg-indigo-900 text-white shadow-sm" 
                      : "bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                  }`}
                >
                  {f === "all" ? "All Schemes" : (BENEFIT_COLORS[f]?.label || f)}
                </button>
              ))}
            </div>
          </div>

          {/* Scheme Cards Feed */}
          <div className="flex-1 overflow-y-auto px-5 pb-24 md:pb-6 pt-4.5 custom-scrollbar bg-slate-50/30">
            {loading && [1, 2, 3].map((i) => <SkeletonCard key={i} />)}

            {error && !loading && (
              <div className="bg-white border border-red-100 rounded-3xl p-6 text-center shadow-sm">
                <p className="text-xs font-bold text-red-800 mb-1">Could not load matches</p>
                <p className="text-[11px] text-slate-400 font-semibold mb-4">{error}</p>
                <button
                  onClick={() => profile && fetchSchemes(profile)}
                  className="bg-indigo-900 text-white border-0 rounded-2xl px-5 py-2.5 text-xs font-bold cursor-pointer shadow-sm hover:bg-indigo-800"
                >
                  Try Again
                </button>
              </div>
            )}

            {!loading && !error && filtered.length === 0 && (
              <div className="bg-white border border-slate-200/80 rounded-3xl p-8 text-center shadow-sm">
                <p className="text-base font-extrabold text-slate-700 mb-2">No matching schemes found</p>
                <p className="text-xs text-slate-400 leading-relaxed max-w-xs mx-auto mb-5">
                  Try clearing filters, searching with different keywords, or adjusting your demographic profile constraints.
                </p>
                <button
                  onClick={() => filter !== "all" ? setFilter("all") : router.push("/profile")}
                  className="bg-indigo-900 text-white border-0 rounded-2xl px-5 py-2.5 text-xs font-bold cursor-pointer shadow-sm hover:bg-indigo-800"
                >
                  {filter !== "all" ? "Clear Filters" : "Update Profile"}
                </button>
              </div>
            )}

            {!loading && !error && filtered.map((scheme) => (
              <SchemeCard
                key={scheme.scheme_id}
                scheme={scheme}
                isActive={selectedSchemeId === scheme.scheme_id}
                onClick={() => handleCardClick(scheme.scheme_id)}
              />
            ))}

            {/* Profile Summary Footer Tag */}
            {profile && !loading && (
              <div className="bg-slate-100/80 border border-slate-200/50 rounded-2xl px-4 py-3 mt-4.5 flex justify-between items-center text-[10px] font-bold text-slate-500 uppercase tracking-wider select-none">
                <span>
                  {profile.state} · {profile.caste_category} · Age {profile.age}
                </span>
                <button
                  onClick={() => router.push("/profile")}
                  className="text-[10px] text-indigo-600 bg-transparent border-0 font-extrabold cursor-pointer transition-colors hover:text-indigo-950"
                >
                  Edit
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Desktop Detail Pane */}
        <div className="hidden md:flex flex-[1.4] flex-col bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden h-full">
          {selectedSchemeId ? (
            <div className="flex-1 flex flex-col h-full overflow-hidden">
              
              {/* Detail Header */}
              {selectedDetails && (
                <div className="border-b border-slate-100 p-6 flex-shrink-0">
                  <div className="flex justify-between items-start gap-4 mb-3">
                    <h2 className="text-base font-extrabold text-slate-900 leading-snug m-0">
                      {selectedDetails.name}
                    </h2>
                    {activeBt && (
                      <span className={`text-[9px] font-extrabold px-2.5 py-0.5 rounded-full border whitespace-nowrap uppercase tracking-wider ${activeBt.bg}`}>
                        {activeBt.label}
                      </span>
                    )}
                  </div>
                  
                  <p className="text-[11px] font-bold text-slate-400 m-0 mb-4 uppercase tracking-widest">{selectedDetails.ministry}</p>
                  
                  {activeFormatAmount() && (
                    <div className="bg-indigo-50/50 rounded-2xl px-4 py-2.5 inline-flex items-baseline gap-1.5 border border-indigo-100/40">
                      <span className="text-lg font-extrabold text-indigo-900">{activeFormatAmount()}</span>
                      <span className="text-[10px] text-indigo-500 font-bold uppercase tracking-wider">Benefit</span>
                    </div>
                  )}
                </div>
              )}

              {/* Detail Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-slate-50/10">
                {detailsLoading ? (
                  <div className="space-y-4 animate-pulse pt-4">
                    <div className="h-12 bg-slate-100 rounded-2xl w-full" />
                    <div className="h-28 bg-slate-100 rounded-2xl w-full" />
                    <div className="h-40 bg-slate-100 rounded-2xl w-full" />
                  </div>
                ) : detailsError ? (
                  <div className="text-center py-10">
                    <p className="text-xs font-bold text-red-600">Failed to load details</p>
                    <p className="text-[11px] text-slate-400 mt-1 font-semibold">{detailsError}</p>
                  </div>
                ) : selectedDetails ? (
                  <>
                    {/* Eligibility evaluation constraint results */}
                    {eligibilityCheck && (
                      <div className={`border rounded-2xl p-4 flex flex-col gap-3 shadow-sm transition-all duration-300 ${
                        eligibilityCheck.eligible 
                          ? "bg-emerald-50/70 border-emerald-100 text-emerald-800" 
                          : "bg-red-50/70 border-red-100 text-red-800"
                      }`}>
                        <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wide">
                          <span>{eligibilityCheck.eligible ? "✅ Profile Match Confirmed" : "⚠️ Profile Mismatch Warning"}</span>
                        </div>
                        {eligibilityCheck.reasons && eligibilityCheck.reasons.length > 0 ? (
                          <div className="text-xs space-y-1.5 pl-1 opacity-90 leading-relaxed font-semibold">
                            <span className="font-bold block mb-1">Check Constraints Log:</span>
                            {eligibilityCheck.reasons.map((reason, i) => (
                              <div key={i} className="flex items-start gap-2 text-[11px]">
                                <span className="opacity-60">•</span>
                                <span>{reason}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-[11px] pl-1 font-semibold opacity-90 m-0">Your profile coordinates and filters matches all criteria for this welfare scheme.</p>
                        )}
                      </div>
                    )}

                    {/* Metadata tags */}
                    <div className="grid grid-cols-2 gap-3.5 select-none">
                      {selectedDetails.verified_at && (
                        <div className="bg-white border border-slate-200/80 rounded-2xl px-4 py-3.5 flex items-center gap-3">
                          <span className="text-lg">🛡️</span>
                          <div>
                            <span className="text-[9px] text-slate-400 block font-extrabold uppercase tracking-widest">Verified On</span>
                            <span className="text-xs font-bold text-slate-700">{selectedDetails.verified_at}</span>
                          </div>
                        </div>
                      )}
                      {selectedDetails.application_deadline ? (
                        <div className="bg-white border border-slate-200/80 rounded-2xl px-4 py-3.5 flex items-center gap-3">
                          <span className="text-lg">📅</span>
                          <div>
                            <span className="text-[9px] text-slate-400 block font-extrabold uppercase tracking-widest">Apply By</span>
                            <span className="text-xs font-bold text-red-600">{selectedDetails.application_deadline}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-white border border-slate-200/80 rounded-2xl px-4 py-3.5 flex items-center gap-3">
                          <span className="text-lg">📅</span>
                          <div>
                            <span className="text-[9px] text-slate-400 block font-extrabold uppercase tracking-widest">Deadline</span>
                            <span className="text-xs font-bold text-emerald-600">Open (Rolling)</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Track Application Panel */}
                    <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-sm">
                      <h3 className="text-xs font-bold text-slate-900 mb-1.5 uppercase tracking-wide">Application Tracking</h3>
                      <p className="text-[11px] text-slate-400 font-semibold mb-4 leading-relaxed">
                        {isTracked ? "This scheme is saved to your tracker. You can set reminders and write notes." : "Save this scheme to your tracker to monitor your application progress."}
                      </p>
                      <button
                        onClick={handleToggleTrack}
                        className={`w-full rounded-2xl py-3.5 text-xs font-bold text-center border cursor-pointer transition-all duration-200 active:scale-[0.99] flex items-center justify-center gap-2 ${
                          isTracked
                            ? "bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100"
                            : "bg-indigo-900 border-transparent text-white hover:bg-indigo-850"
                        }`}
                      >
                        <span>📋</span>
                        <span>{isTracked ? "Stop Tracking Scheme" : "Track & Save Scheme"}</span>
                      </button>
                    </div>

                    {/* Official Portal Finder */}
                    <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-sm">
                      <h3 className="text-xs font-bold text-slate-900 mb-1.5 uppercase tracking-wide">Cross-check on national database</h3>
                      <p className="text-[11px] text-slate-400 font-semibold mb-4 leading-relaxed">
                        Verify eligibility restrictions and submit documents on the central myScheme welfare portal.
                      </p>
                      <a
                        href={`https://www.myscheme.gov.in/search?q=${encodeURIComponent(selectedDetails.name)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 w-full bg-indigo-900 hover:bg-indigo-800 text-white rounded-2xl py-3.5 text-xs font-bold text-center no-underline shadow-sm transition-transform duration-100 active:scale-[0.99]"
                      >
                        🏛️ Verify on myScheme.gov.in ↗
                      </a>
                    </div>

                    {/* Eligibility Checklist parameters */}
                    <div className="bg-white border border-slate-200/80 rounded-3xl px-5 py-2.5 shadow-sm">
                      <h3 className="text-xs font-bold text-slate-900 mt-3.5 mb-2 uppercase tracking-wide">Eligibility Checklist</h3>
                      {[
                        ["States",     selectedDetails.applicable_states ? selectedDetails.applicable_states.join(", ") : "All India"],
                        ["Gender",     selectedDetails.gender ? selectedDetails.gender.charAt(0).toUpperCase() + selectedDetails.gender.slice(1) : "All"],
                        ["Categories", selectedDetails.caste_categories ? selectedDetails.caste_categories.join(", ") : "All categories"],
                        ["Age Bounds", selectedDetails.min_age && selectedDetails.max_age ? `${selectedDetails.min_age} – ${selectedDetails.max_age} years` : selectedDetails.min_age ? `${selectedDetails.min_age}+ years` : selectedDetails.max_age ? `Up to ${selectedDetails.max_age} years` : "No restrictions"],
                        ["Max Income", selectedDetails.max_income ? `Rs.${selectedDetails.max_income.toLocaleString("en-IN")}/year` : "No limit"],
                        ["Occupation", selectedDetails.occupation_types ? selectedDetails.occupation_types.join(", ").replace(/_/g, " ") : "Any occupation"],
                      ].map(([label, value]) => (
                        <div key={label} className="flex justify-between items-start py-3.5 border-b border-slate-100 last:border-b-0">
                          <span className="text-xs text-slate-400 font-extrabold uppercase tracking-wider">{label}</span>
                          <span className="text-xs font-bold text-slate-800 text-right">{value}</span>
                        </div>
                      ))}
                    </div>

                    {/* Documents required */}
                    {selectedDetails.documents_required && selectedDetails.documents_required.length > 0 && (
                      <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-sm">
                        <h3 className="text-xs font-bold text-slate-900 mb-3.5 uppercase tracking-wide">Required Documents</h3>
                        <div className="grid grid-cols-1 gap-3">
                          {selectedDetails.documents_required.map((doc) => (
                            <div key={doc} className="flex items-center gap-3 text-xs font-semibold text-slate-600">
                              <span className="text-base text-slate-400">📄</span>
                              <span>{DOC_LABELS[doc] || doc.replace(/_/g, " ")}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Application Link */}
                    {selectedDetails.application_url && (
                      <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-sm">
                        <div className="flex items-center gap-2 mb-3.5">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Application link</span>
                          <span className="text-[9px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-100 font-extrabold">✓ Verified official URL</span>
                        </div>
                        <a
                          href={selectedDetails.application_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl py-3.5 text-xs font-bold text-center no-underline shadow-sm transition-transform duration-100 active:scale-[0.99]"
                        >
                          Apply Now — Official Site ↗
                        </a>
                      </div>
                    )}
                  </>
                ) : null}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-50/30 select-none">
              <span className="text-4xl mb-4">🏛️</span>
              <h3 className="text-sm font-extrabold text-slate-700 mb-2 uppercase tracking-wide">No Scheme Selected</h3>
              <p className="text-xs text-slate-500 max-w-xs leading-relaxed m-0 font-medium">
                Select a welfare scheme from the matched list on the left to inspect eligibility checklists, required application files, and verify credentials.
              </p>
            </div>
          )}
        </div>
      </div>
      <ChatBot language={language} />
    </AppLayout>
  );
}