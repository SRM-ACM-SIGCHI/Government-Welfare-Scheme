"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AppLayout from "../../../components/AppLayout";

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

export default function SchemeDetailPage({ params }) {
  const router = useRouter();
  const id = params.id;

  const [scheme,  setScheme]  = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);
  const [profile, setProfile] = useState(null);
  const [eligibilityCheck, setEligibilityCheck] = useState(null);

  useEffect(() => {
    const raw = localStorage.getItem("user_profile");
    if (raw) setProfile(JSON.parse(raw));

    if (!id) return;
    fetchSchemeAndCheck();
  }, [id]);

  const fetchSchemeAndCheck = async () => {
    try {
      // 1. Fetch details
      const res = await fetch(`${API_URL}/schemes/${id}`);
      if (!res.ok) throw new Error("Scheme not found");
      const data = await res.json();
      setScheme(data);

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
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <AppLayout activeTab="/schemes">
      <div className="w-full max-w-xl mx-auto p-6 space-y-4 animate-pulse pt-10">
        <div className="h-4 bg-gray-200 rounded w-1/4" />
        <div className="h-8 bg-gray-200 rounded w-full" />
        <div className="h-6 bg-gray-200 rounded w-3/4" />
        <div className="h-24 bg-gray-200 rounded-xl w-full" />
        <div className="h-40 bg-gray-200 rounded-xl w-full" />
      </div>
    </AppLayout>
  );

  if (error || !scheme) return (
    <AppLayout activeTab="/schemes">
      <div className="w-full max-w-xl mx-auto p-6 text-center pt-16">
        <p className="text-5xl m-0 mb-4">😕</p>
        <h2 className="text-base font-bold text-gray-800 m-0 mb-4">Scheme details not found</h2>
        <button 
          onClick={() => router.back()} 
          className="bg-blue-900 text-white border-0 rounded-xl px-5 py-3 text-xs font-bold cursor-pointer shadow-sm hover:bg-blue-800"
        >
          Go back
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
      <div className="w-full max-w-xl mx-auto pb-24 md:pb-6 bg-white md:border md:border-gray-200 md:rounded-3xl md:shadow-sm overflow-hidden">
        
        {/* Header */}
        <div className="border-b border-gray-100 p-6 bg-white">
          <button 
            onClick={() => router.back()} 
            className="bg-transparent border-0 text-gray-500 text-xs font-semibold cursor-pointer p-0 mb-4"
          >
            ← Back
          </button>
          <div className="flex justify-between items-start gap-4 mb-2">
            <h1 className="text-lg font-bold text-gray-900 leading-snug m-0">{scheme.name}</h1>
            <span 
              className="text-[10px] font-bold px-2.5 py-0.5 rounded-full whitespace-nowrap"
              style={{ backgroundColor: bt.bg, color: bt.color }}
            >
              {bt.label}
            </span>
          </div>
          <p className="text-xs text-gray-500 m-0 mb-4">{scheme.ministry}</p>
          
          {formatAmount() && (
            <div className="bg-blue-50/50 rounded-xl px-4 py-2.5 inline-flex items-baseline gap-1.5 border border-blue-100/30">
              <span className="text-xl font-bold text-blue-900">{formatAmount()}</span>
              <span className="text-xs text-blue-500 font-medium">benefit</span>
            </div>
          )}
        </div>

        {/* Content Pane */}
        <div className="p-6 space-y-5 bg-gray-50/10">

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

          <div className="grid grid-cols-2 gap-3">
            {/* Verified badge */}
            {scheme.verified_at && (
              <div className="bg-white border border-gray-100 rounded-xl px-4 py-3 flex items-center gap-3">
                <span className="text-lg">🛡️</span>
                <div>
                  <span className="text-[10px] text-gray-400 block font-semibold uppercase">Verified On</span>
                  <span className="text-xs font-semibold text-gray-700">{scheme.verified_at}</span>
                </div>
              </div>
            )}

            {/* Deadline */}
            {scheme.application_deadline ? (
              <div className="bg-white border border-gray-100 rounded-xl px-4 py-3 flex items-center gap-3">
                <span className="text-lg">📅</span>
                <div>
                  <span className="text-[10px] text-gray-400 block font-semibold uppercase">Apply By</span>
                  <span className="text-xs font-semibold text-red-600">{scheme.application_deadline}</span>
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

          {/* myscheme.gov.in portal lookup */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-900 mb-1">Verify on myScheme portal</h3>
            <p className="text-xs text-gray-500 mb-4 leading-relaxed">
              Cross check benefit calculations and details on the central national welfare database.
            </p>
            <a
              href={`https://www.myscheme.gov.in/search?q=${encodeURIComponent(scheme.name)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full bg-blue-900 text-white rounded-xl py-3 text-xs font-bold text-center no-underline shadow-sm transition-transform duration-100 hover:bg-blue-800 active:scale-[0.99]"
            >
              🏛️ Search myScheme.gov.in ↗
            </a>
          </div>

          {/* Eligibility criteria parameters */}
          <div className="bg-white border border-gray-100 rounded-2xl px-5 py-1.5 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-950 mt-4 mb-2">Eligibility Checklist</h2>
            {[
              ["States",     scheme.applicable_states ? scheme.applicable_states.join(", ") : "All India"],
              ["Gender",     scheme.gender ? scheme.gender.charAt(0).toUpperCase() + scheme.gender.slice(1) : "All"],
              ["Categories", scheme.caste_categories ? scheme.caste_categories.join(", ") : "All categories"],
              ["Age Bounds", scheme.min_age && scheme.max_age ? `${scheme.min_age} – ${scheme.max_age} years` : scheme.min_age ? `${scheme.min_age}+ years` : scheme.max_age ? `Up to ${scheme.max_age} years` : "No restrictions"],
              ["Max Income", scheme.max_income ? `Rs.${scheme.max_income.toLocaleString("en-IN")}/year` : "No limit"],
              ["Occupation", scheme.occupation_types ? scheme.occupation_types.join(", ").replace(/_/g, " ") : "Any occupation"],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between items-start py-3 border-b border-gray-50 last:border-b-0">
                <span className="text-xs text-gray-400 font-semibold">{label}</span>
                <span className="text-xs font-semibold text-gray-800 text-right">{value}</span>
              </div>
            ))}
          </div>

          {/* Documents */}
          {scheme.documents_required && scheme.documents_required.length > 0 && (
            <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
              <h2 className="text-sm font-semibold text-gray-950 mb-3">Required Documents</h2>
              <div className="space-y-2.5">
                {scheme.documents_required.map((doc) => (
                  <div key={doc} className="flex items-center gap-2.5">
                    <span className="text-gray-400 text-base">📄</span>
                    <span className="text-xs text-gray-600 font-medium">{DOC_LABELS[doc] || doc.replace(/_/g, " ")}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Apply button */}
          {scheme.application_url && (
            <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs text-gray-400 font-semibold">Official application URL</span>
                <span className="text-[9px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-bold">✓ Verified Link</span>
              </div>
              <a
                href={scheme.application_url}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full bg-emerald-600 text-white rounded-xl py-3 text-xs font-bold text-center no-underline shadow-sm transition-transform duration-100 hover:bg-emerald-700 active:scale-[0.99]"
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