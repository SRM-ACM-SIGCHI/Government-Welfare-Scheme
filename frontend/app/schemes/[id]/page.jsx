"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AppLayout from "../../../components/AppLayout";

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

export default function SchemeDetailPage({ params }) {
  const router = useRouter();
  const id = params.id;

  const [scheme,  setScheme]  = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);
  const [profile, setProfile] = useState(null);
  const [eligibilityCheck, setEligibilityCheck] = useState(null);
  const [offlineMode, setOfflineMode] = useState(false);
  const [isTracked, setIsTracked] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem("user_profile");
    if (raw) setProfile(JSON.parse(raw));

    if (!id) return;
    fetchSchemeAndCheck();
  }, [id]);

  useEffect(() => {
    if (!id) {
      setIsTracked(false);
      return;
    }
    const raw = localStorage.getItem("tracked_schemes") || "[]";
    try {
      const list = JSON.parse(raw);
      setIsTracked(list.some(s => s.scheme_id === id));
    } catch (e) {
      setIsTracked(false);
    }
  }, [id]);

  const handleToggleTrack = () => {
    if (!scheme) return;
    const raw = localStorage.getItem("tracked_schemes") || "[]";
    let list = [];
    try { list = JSON.parse(raw); } catch (e) {}

    if (isTracked) {
      list = list.filter(s => s.scheme_id !== id);
      setIsTracked(false);
    } else {
      list.push({
        scheme_id: id,
        name: scheme.name,
        status: "saved",
        notes: "",
        reminder_date: "",
        saved_at: new Date().toISOString()
      });
      setIsTracked(true);
    }
    localStorage.setItem("tracked_schemes", JSON.stringify(list));
  };

  const fetchSchemeAndCheck = async () => {
    try {
      // 1. Fetch details
      const res = await fetch(`${API_URL}/schemes/${id}`);
      if (!res.ok) throw new Error("Scheme not found");
      const data = await res.json();
      setScheme(data);
      setOfflineMode(false);

      // Cache details locally
      try {
        const cached = localStorage.getItem("cached_scheme_details") || "{}";
        const dict = JSON.parse(cached);
        dict[id] = data;
        localStorage.setItem("cached_scheme_details", JSON.stringify(dict));
      } catch (e) {}

      // 2. Fetch eligibility logs if user profile exists
      const raw = localStorage.getItem("user_profile");
      if (raw) {
        const checkRes = await fetch(`${API_URL}/schemes/check/${id}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: raw
        });
        if (checkRes.ok) {
          setEligibilityCheck(await checkRes.json());
        }
      }
    } catch (err) {
      console.warn("Failed to fetch scheme details. Trying cache fallback.", err);
      // Attempt offline fallback
      try {
        const cached = localStorage.getItem("cached_scheme_details");
        if (cached) {
          const dict = JSON.parse(cached);
          if (dict[id]) {
            setScheme(dict[id]);
            setOfflineMode(true);
            setError(null);
            return;
          }
        }
      } catch (e) {}
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <AppLayout activeTab="/schemes">
      <div className="w-full max-w-xl mx-auto p-5 space-y-4 animate-pulse pt-10">
        <div className="h-4 bg-slate-100 rounded w-1/4" />
        <div className="h-8 bg-slate-100 rounded w-full" />
        <div className="h-6 bg-slate-100 rounded w-3/4" />
        <div className="h-24 bg-slate-100 rounded-2xl w-full" />
        <div className="h-40 bg-slate-100 rounded-2xl w-full" />
      </div>
    </AppLayout>
  );

  if (error || !scheme) return (
    <AppLayout activeTab="/schemes">
      <div className="w-full max-w-xl mx-auto p-6 text-center pt-16 select-none">
        <p className="text-5xl m-0 mb-4">😕</p>
        <h2 className="text-base font-extrabold text-slate-800 m-0 mb-3">Scheme Details Not Found</h2>
        <p className="text-xs text-slate-400 mb-6 font-medium">We could not locate this specific scheme in our database.</p>
        <button 
          onClick={() => router.back()} 
          className="bg-indigo-900 hover:bg-indigo-800 text-white border-0 rounded-2xl px-6 py-3.5 text-xs font-bold cursor-pointer shadow-sm active:scale-98"
        >
          Go Back
        </button>
      </div>
    </AppLayout>
  );

  const bt = BENEFIT_COLORS[scheme.benefit_type] || BENEFIT_COLORS.other;

  const formatAmount = () => {
    if (!scheme.benefit_amount) return null;
    const freq = scheme.benefit_frequency === "monthly" ? "/month"
               : scheme.benefit_frequency === "annual"  ? "/year"
               : scheme.benefit_frequency === "one-time" ? " one-time" : "";
    return `Rs.${scheme.benefit_amount.toLocaleString("en-IN")}${freq}`;
  };

  return (
    <AppLayout activeTab="/schemes">
      <div className="w-full max-w-xl mx-auto pb-24 md:pb-6 px-4 md:px-0 bg-white md:border md:border-slate-200 md:rounded-3xl md:shadow-sm overflow-hidden animate-[fadeIn_0.25s_ease-out]">
        
        {/* Header */}
        <div className="border-b border-slate-100 p-6 bg-white flex-shrink-0">
          <button 
            onClick={() => router.back()} 
            className="bg-transparent border-0 text-slate-400 hover:text-slate-800 text-xs font-bold cursor-pointer p-0 mb-4.5 transition-colors"
          >
            ← Back
          </button>
          <div className="flex justify-between items-start gap-4 mb-3">
            <h1 className="text-lg font-extrabold text-slate-900 leading-snug m-0">{scheme.name}</h1>
            <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
              <span className={`text-[9px] font-extrabold px-2.5 py-0.5 rounded-full border whitespace-nowrap uppercase tracking-wider ${bt.bg}`}>
                {bt.label}
              </span>
              {offlineMode && (
                <span className="bg-amber-50 text-amber-800 border border-amber-100/60 text-[9px] font-extrabold px-2 py-0.5 rounded-md whitespace-nowrap uppercase tracking-wider">
                  ⚠️ Offline
                </span>
              )}
            </div>
          </div>
          <p className="text-[11px] font-bold text-slate-400 m-0 mb-4 uppercase tracking-widest">{scheme.ministry}</p>
          
          {formatAmount() && (
            <div className="bg-indigo-50/50 rounded-2xl px-4 py-2.5 inline-flex items-baseline gap-1.5 border border-indigo-100/45">
              <span className="text-lg font-extrabold text-indigo-900">{formatAmount()}</span>
              <span className="text-[10px] text-indigo-500 font-bold uppercase tracking-wider">Benefit</span>
            </div>
          )}
        </div>

        {/* Content Pane */}
        <div className="p-6 space-y-6 bg-slate-50/10">

          {/* Real-time eligibility evaluation check log */}
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
                <p className="text-[11px] pl-1 font-semibold opacity-90 m-0">Your profile details matches all criteria for this welfare scheme.</p>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3.5 select-none">
            {/* Verified badge */}
            {scheme.verified_at && (
              <div className="bg-white border border-slate-200/80 rounded-2xl px-4 py-3.5 flex items-center gap-3">
                <span className="text-lg">🛡️</span>
                <div>
                  <span className="text-[9px] text-slate-400 block font-extrabold uppercase tracking-widest">Verified On</span>
                  <span className="text-xs font-bold text-slate-700">{scheme.verified_at}</span>
                </div>
              </div>
            )}

            {/* Deadline */}
            {scheme.application_deadline ? (
              <div className="bg-white border border-slate-200/80 rounded-2xl px-4 py-3.5 flex items-center gap-3">
                <span className="text-lg">📅</span>
                <div>
                  <span className="text-[9px] text-slate-400 block font-extrabold uppercase tracking-widest">Apply By</span>
                  <span className="text-xs font-bold text-red-600">{scheme.application_deadline}</span>
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

          {/* myscheme.gov.in portal lookup */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-sm">
            <h3 className="text-xs font-bold text-slate-900 mb-1.5 uppercase tracking-wide">Cross-check on national database</h3>
            <p className="text-[11px] text-slate-400 font-semibold mb-4 leading-relaxed">
              Verify eligibility restrictions and submit documents on the central myScheme welfare portal.
            </p>
            <a
              href={`https://www.myscheme.gov.in/search?q=${encodeURIComponent(scheme.name)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full bg-indigo-900 hover:bg-indigo-800 text-white rounded-2xl py-3.5 text-xs font-bold text-center no-underline shadow-sm transition-transform duration-105 active:scale-[0.99]"
            >
              🏛️ Verify on myScheme.gov.in ↗
            </a>
          </div>

          {/* Eligibility criteria parameters */}
          <div className="bg-white border border-slate-200/80 rounded-3xl px-5 py-2.5 shadow-sm">
            <h2 className="text-xs font-bold text-slate-900 mt-3.5 mb-2 uppercase tracking-wide">Eligibility Checklist</h2>
            {[
              ["States",     scheme.applicable_states ? scheme.applicable_states.join(", ") : "All India"],
              ["Gender",     scheme.gender ? scheme.gender.charAt(0).toUpperCase() + scheme.gender.slice(1) : "All"],
              ["Categories", scheme.caste_categories ? scheme.caste_categories.join(", ") : "All categories"],
              ["Age Bounds", scheme.min_age && scheme.max_age ? `${scheme.min_age} – ${scheme.max_age} years` : scheme.min_age ? `${scheme.min_age}+ years` : scheme.max_age ? `Up to ${scheme.max_age} years` : "No restrictions"],
              ["Max Income", scheme.max_income ? `Rs.${scheme.max_income.toLocaleString("en-IN")}/year` : "No limit"],
              ["Occupation", scheme.occupation_types ? scheme.occupation_types.join(", ").replace(/_/g, " ") : "Any occupation"],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between items-start py-3.5 border-b border-slate-100 last:border-b-0">
                <span className="text-xs text-slate-400 font-extrabold uppercase tracking-wider">{label}</span>
                <span className="text-xs font-bold text-slate-800 text-right">{value}</span>
              </div>
            ))}
          </div>

          {/* Documents */}
          {scheme.documents_required && scheme.documents_required.length > 0 && (
            <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-sm">
              <h2 className="text-xs font-bold text-slate-900 mb-3.5 uppercase tracking-wide">Required Documents</h2>
              <div className="grid grid-cols-1 gap-3">
                {scheme.documents_required.map((doc) => (
                  <div key={doc} className="flex items-center gap-3 text-xs font-semibold text-slate-600">
                    <span className="text-base text-slate-400">📄</span>
                    <span>{DOC_LABELS[doc] || doc.replace(/_/g, " ")}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Apply button */}
          {scheme.application_url && (
            <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-3.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Application link</span>
                <span className="text-[9px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-100 font-extrabold">✓ Verified official URL</span>
              </div>
              <a
                href={scheme.application_url}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl py-3.5 text-xs font-bold text-center no-underline shadow-sm transition-transform duration-100 active:scale-[0.99]"
              >
                Apply Now — Official Site ↗
              </a>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}