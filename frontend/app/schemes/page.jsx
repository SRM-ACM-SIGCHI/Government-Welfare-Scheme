"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AppLayout from "../../components/AppLayout";
import ChatBot from "../../components/ChatBot";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

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
  other:          { bg: "#f9fafb", color: "#374151", label: "Scheme" },
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
      className={`bg-white border rounded-2xl p-5 mb-3 cursor-pointer transition-all duration-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 ${
        isActive ? "border-blue-600 ring-2 ring-blue-50" : "border-gray-100"
      }`}
    >
      <div className="flex justify-between items-start mb-2.5 gap-2">
        <h3 className="text-[15px] font-semibold text-gray-900 leading-snug flex-1 pr-2">
          {scheme.name}
        </h3>
        <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
          <span
            className="text-[10px] font-bold px-2.5 py-0.5 rounded-full whitespace-nowrap"
            style={{ backgroundColor: bt.bg, color: bt.color }}
          >
            {bt.label}
          </span>
          {scheme.similarity !== undefined && (
            <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-md whitespace-nowrap">
              🎯 {Math.round(scheme.similarity * 100)}% Match
            </span>
          )}
        </div>
      </div>
      <p className="text-xs text-gray-500 mb-3.5">{scheme.ministry}</p>
      <div className="flex items-center justify-between">
        {formatAmount() ? (
          <span className="text-[15px] font-bold text-blue-700">{formatAmount()}</span>
        ) : (
          <span className="text-xs text-gray-400">Amount varies</span>
        )}
        <div className="flex items-center gap-2">
          {scheme.is_rolling && !scheme.application_deadline && (
            <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
              Open now
            </span>
          )}
          <span className="text-gray-400 text-lg">›</span>
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

  // Semantic search state
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);

  // Desktop Master-Detail active selection
  const [selectedSchemeId, setSelectedSchemeId] = useState(null);
  const [selectedDetails, setSelectedDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState(null);

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
      
      // Auto-select first scheme on desktop
      if (loadedSchemes.length > 0 && window.innerWidth >= 768) {
        setSelectedSchemeId(loadedSchemes[0].scheme_id);
      }
    } catch (err) {
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
        setDetailsError(err.message);
      } finally {
        setDetailsLoading(false);
        setCheckingEligibility(false);
      }
    };

    fetchDetailsAndCheck();
  }, [selectedSchemeId, profile]);

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
      <div className="w-full max-w-md mx-auto md:max-w-none md:mx-0 h-full flex flex-col md:flex-row gap-6 md:h-[calc(100vh-4rem)]">
        
        {/* Left Column: List Pane */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#f9fafb] md:bg-white md:border md:border-gray-200 md:rounded-3xl md:shadow-sm overflow-hidden h-full">
          
          {/* Header Controls */}
          <div className="bg-white border-b border-gray-100 p-5 sticky top-0 z-20 flex-shrink-0 md:rounded-t-3xl">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h1 className="text-xl font-bold text-gray-900 m-0 tracking-tight">
                  {isSearching ? "Search Results" : "Your Schemes"}
                </h1>
                {!loading && (
                  <p className="text-xs text-gray-500 mt-1 m-0">
                    {filtered.length} scheme{filtered.length !== 1 ? "s" : ""} {isSearching ? "found" : "matched"}
                  </p>
                )}
              </div>
              <button
                onClick={() => { handleClearSearch(); if (profile) fetchSchemes(profile, language); }}
                className="bg-blue-50 text-blue-600 border-0 rounded-xl px-4 py-2 text-xs font-semibold cursor-pointer transition-colors duration-150 hover:bg-blue-100"
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
                  placeholder="Search by intent (e.g. poor girl student aid)..."
                  className="w-full py-2.5 pl-4 pr-10 rounded-xl border border-gray-200 text-sm outline-none box-border transition-colors duration-150 focus:border-blue-500"
                />
                {searchQuery && (
                  <button 
                    type="button" 
                    onClick={handleClearSearch}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 bg-transparent border-0 text-gray-400 text-lg cursor-pointer p-1"
                  >
                    ×
                  </button>
                )}
              </div>
              <button 
                type="submit" 
                className="bg-blue-900 text-white border-0 rounded-xl px-4 py-2.5 text-xs font-bold cursor-pointer transition-transform duration-100 active:scale-95 shadow-sm whitespace-nowrap"
              >
                Search
              </button>
            </form>

            {/* Filter chips */}
            <div className="flex gap-2 overflow-x-auto pb-1.5 custom-scrollbar">
              {FILTERS.map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3.5 py-1.5 rounded-full border-0 text-xs font-medium cursor-pointer transition-all duration-150 whitespace-nowrap flex-shrink-0 ${
                    filter === f 
                      ? "bg-blue-900 text-white shadow-sm" 
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {f === "all" ? "All" : (BENEFIT_COLORS[f]?.label || f)}
                </button>
              ))}
            </div>
          </div>

          {/* Scheme Cards Feed */}
          <div className="flex-1 overflow-y-auto px-5 pb-24 md:pb-6 pt-3 custom-scrollbar">
            {loading && [1, 2, 3, 4].map((i) => <SkeletonCard key={i} />)}

            {error && !loading && (
              <div className="bg-white border border-red-100 rounded-2xl p-6 text-center shadow-sm">
                <p className="text-sm font-semibold text-red-800 mb-1">Could not load schemes</p>
                <p className="text-xs text-gray-500 mb-4">{error}</p>
                <button
                  onClick={() => profile && fetchSchemes(profile)}
                  className="bg-blue-600 text-white border-0 rounded-xl px-5 py-2.5 text-xs font-semibold cursor-pointer shadow-sm hover:bg-blue-700"
                >
                  Try again
                </button>
              </div>
            )}

            {!loading && !error && filtered.length === 0 && (
              <div className="bg-white border border-gray-100 rounded-2xl p-8 text-center shadow-sm">
                <p className="text-sm font-semibold text-gray-800 mb-4">No schemes found</p>
                <button
                  onClick={() => filter !== "all" ? setFilter("all") : router.push("/profile")}
                  className="bg-blue-600 text-white border-0 rounded-xl px-5 py-2.5 text-xs font-semibold cursor-pointer shadow-sm hover:bg-blue-700"
                >
                  {filter !== "all" ? "Show all" : "Update profile"}
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

            {/* Profile Overview Tag */}
            {profile && !loading && (
              <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 mt-4 flex justify-between items-center">
                <span className="text-xs text-gray-500">
                  {profile.state} · {profile.caste_category} · Age {profile.age}
                </span>
                <button
                  onClick={() => router.push("/profile")}
                  className="text-xs text-blue-600 bg-transparent border-0 font-semibold cursor-pointer"
                >
                  Edit
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Desktop Detail Pane */}
        <div className="hidden md:flex flex-[1.4] flex-col bg-white border border-gray-200 rounded-3xl shadow-sm overflow-hidden h-full">
          {selectedSchemeId ? (
            <div className="flex-1 flex flex-col h-full overflow-hidden">
              
              {/* Detail Header */}
              {selectedDetails && (
                <div className="border-b border-gray-100 p-6 flex-shrink-0">
                  <div className="flex justify-between items-start gap-4 mb-2">
                    <h2 className="text-lg font-bold text-gray-900 leading-snug m-0">
                      {selectedDetails.name}
                    </h2>
                    {activeBt && (
                      <span
                        className="text-[10px] font-bold px-2.5 py-0.5 rounded-full whitespace-nowrap"
                        style={{ backgroundColor: activeBt.bg, color: activeBt.color }}
                      >
                        {activeBt.label}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 m-0 mb-4">{selectedDetails.ministry}</p>
                  
                  {activeFormatAmount() && (
                    <div className="bg-blue-50/50 rounded-xl px-4 py-2.5 inline-flex items-baseline gap-1.5 border border-blue-100/30">
                      <span className="text-xl font-bold text-blue-900">{activeFormatAmount()}</span>
                      <span className="text-xs text-blue-500 font-medium">benefit</span>
                    </div>
                  )}
                </div>
              )}

              {/* Detail Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-5 custom-scrollbar bg-gray-50/30">
                {detailsLoading ? (
                  <div className="space-y-4 animate-pulse pt-4">
                    <div className="h-10 bg-gray-100 rounded-lg w-full" />
                    <div className="h-28 bg-gray-100 rounded-xl w-full" />
                    <div className="h-40 bg-gray-100 rounded-xl w-full" />
                  </div>
                ) : detailsError ? (
                  <div className="text-center py-10">
                    <p className="text-sm font-semibold text-red-600">Failed to load details</p>
                    <p className="text-xs text-gray-400 mt-1">{detailsError}</p>
                  </div>
                ) : selectedDetails ? (
                  <>
                    {/* Real-time eligibility evaluation check log */}
                    {eligibilityCheck && (
                      <div className={`border rounded-xl p-4 flex flex-col gap-2.5 shadow-sm transition-all duration-300 ${
                        eligibilityCheck.eligible 
                          ? "bg-emerald-50/70 border-emerald-100 text-emerald-800" 
                          : "bg-red-50/70 border-red-100 text-red-800"
                      }`}>
                        <div className="flex items-center gap-2 font-bold text-sm">
                          <span>{eligibilityCheck.eligible ? "✅ Eligible" : "⚠️ Profile Mismatch"}</span>
                        </div>
                        {eligibilityCheck.reasons && eligibilityCheck.reasons.length > 0 ? (
                          <div className="text-xs space-y-1 pl-1 opacity-90 leading-relaxed">
                            <span className="font-semibold block mb-1">Checking constraints logs:</span>
                            {eligibilityCheck.reasons.map((reason, i) => (
                              <div key={i} className="flex items-start gap-1.5">
                                <span>•</span>
                                <span>{reason}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs pl-1 opacity-90 m-0">Your profile matches all criteria perfectly for this welfare scheme.</p>
                        )}
                      </div>
                    )}

                    {/* Metadata tags */}
                    <div className="grid grid-cols-2 gap-3">
                      {selectedDetails.verified_at && (
                        <div className="bg-white border border-gray-100 rounded-xl px-4 py-3 flex items-center gap-3">
                          <span className="text-lg">🛡️</span>
                          <div>
                            <span className="text-[10px] text-gray-400 block font-semibold uppercase">Verified On</span>
                            <span className="text-xs font-semibold text-gray-700">{selectedDetails.verified_at}</span>
                          </div>
                        </div>
                      )}
                      {selectedDetails.application_deadline ? (
                        <div className="bg-white border border-gray-100 rounded-xl px-4 py-3 flex items-center gap-3">
                          <span className="text-lg">📅</span>
                          <div>
                            <span className="text-[10px] text-gray-400 block font-semibold uppercase">Apply By</span>
                            <span className="text-xs font-semibold text-red-600">{selectedDetails.application_deadline}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-white border border-gray-100 rounded-xl px-4 py-3 flex items-center gap-3">
                          <span className="text-lg">📅</span>
                          <div>
                            <span className="text-[10px] text-gray-400 block font-semibold uppercase">Deadline</span>
                            <span className="text-xs font-semibold text-emerald-600">Open (Rolling)</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Official Portal Finder */}
                    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                      <h3 className="text-sm font-semibold text-gray-900 mb-1">Verify on myScheme portal</h3>
                      <p className="text-xs text-gray-500 mb-4 leading-relaxed">
                        Cross check benefit calculations and details on the central national welfare database.
                      </p>
                      <a
                        href={`https://www.myscheme.gov.in/search?q=${encodeURIComponent(selectedDetails.name)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 w-full bg-blue-900 text-white rounded-xl py-3 text-xs font-bold text-center no-underline shadow-sm transition-transform duration-100 hover:bg-blue-800 active:scale-[0.99]"
                      >
                        🏛️ Search myScheme.gov.in ↗
                      </a>
                    </div>

                    {/* Eligibility Checklist parameters */}
                    <div className="bg-white border border-gray-100 rounded-2xl px-5 py-1.5 shadow-sm">
                      <h3 className="text-sm font-semibold text-gray-950 mt-4 mb-2">Eligibility Checklist</h3>
                      {[
                        ["States",     selectedDetails.applicable_states ? selectedDetails.applicable_states.join(", ") : "All India"],
                        ["Gender",     selectedDetails.gender ? selectedDetails.gender.charAt(0).toUpperCase() + selectedDetails.gender.slice(1) : "All"],
                        ["Categories", selectedDetails.caste_categories ? selectedDetails.caste_categories.join(", ") : "All categories"],
                        ["Age Bounds", selectedDetails.min_age && selectedDetails.max_age ? `${selectedDetails.min_age} – ${selectedDetails.max_age} years` : selectedDetails.min_age ? `${selectedDetails.min_age}+ years` : selectedDetails.max_age ? `Up to ${selectedDetails.max_age} years` : "No restrictions"],
                        ["Max Income", selectedDetails.max_income ? `Rs.${selectedDetails.max_income.toLocaleString("en-IN")}/year` : "No limit"],
                        ["Occupation", selectedDetails.occupation_types ? selectedDetails.occupation_types.join(", ").replace(/_/g, " ") : "Any occupation"],
                      ].map(([label, value]) => (
                        <div key={label} className="flex justify-between items-start py-3 border-b border-gray-50 last:border-b-0">
                          <span className="text-xs text-gray-400 font-semibold">{label}</span>
                          <span className="text-xs font-semibold text-gray-800 text-right">{value}</span>
                        </div>
                      ))}
                    </div>

                    {/* Documents required */}
                    {selectedDetails.documents_required && selectedDetails.documents_required.length > 0 && (
                      <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                        <h3 className="text-sm font-semibold text-gray-950 mb-3">Required Documents</h3>
                        <div className="space-y-2.5">
                          {selectedDetails.documents_required.map((doc) => (
                            <div key={doc} className="flex items-center gap-2.5">
                              <span className="text-gray-400 text-base">📄</span>
                              <span className="text-xs text-gray-600 font-medium">{DOC_LABELS[doc] || doc.replace(/_/g, " ")}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Application Link */}
                    {selectedDetails.application_url && (
                      <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-xs text-gray-400 font-semibold">Official application URL</span>
                          <span className="text-[9px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-bold">✓ Verified Link</span>
                        </div>
                        <a
                          href={selectedDetails.application_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block w-full bg-emerald-600 text-white rounded-xl py-3 text-xs font-bold text-center no-underline shadow-sm transition-transform duration-100 hover:bg-emerald-700 active:scale-[0.99]"
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
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-gray-50/50">
              <span className="text-4xl mb-4">🏛️</span>
              <h3 className="text-sm font-bold text-gray-700 mb-1.5">No scheme selected</h3>
              <p className="text-xs text-gray-400 max-w-xs leading-relaxed m-0">
                Select a welfare scheme from the matched feed list on the left to inspect eligibility requirements, required files, and apply.
              </p>
            </div>
          )}
        </div>
      </div>
      <ChatBot language={language} />
    </AppLayout>
  );
}