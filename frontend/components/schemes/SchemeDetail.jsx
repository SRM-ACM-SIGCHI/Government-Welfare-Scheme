import React from "react";
import * as Icons from "lucide-react";
import { BENEFIT_COLORS, DOC_LABELS } from "../../lib/constants";
import { formatAmount, snakeToTitle } from "../../lib/utils";
import Badge from "../ui/Badge";

export default function SchemeDetail({ scheme, eligibility, userProfile }) {
  if (!scheme) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-50/30 select-none">
        <Icons.Landmark className="w-12 h-12 text-slate-300 stroke-[1] mb-4" />
        <h3 className="text-sm font-extrabold text-slate-700 mb-2 uppercase tracking-wide">
          No Scheme Selected
        </h3>
        <p className="text-xs text-slate-500 max-w-xs leading-relaxed m-0 font-medium">
          Select a welfare scheme from the list on the left to inspect eligibility checklists, required application files, and verify credentials.
        </p>
      </div>
    );
  }

  const benefitType = scheme.benefit_type || "other";
  const benefitConfig = BENEFIT_COLORS[benefitType] || BENEFIT_COLORS.other;
  const formattedBenefit = formatAmount(scheme.benefit_amount, scheme.benefit_frequency);

  // Check if we have eligibility details from matching
  const hasEligibility = eligibility !== undefined && eligibility !== null;
  const isEligible = hasEligibility ? eligibility.eligible : true;
  const mismatchReasons = hasEligibility ? eligibility.reasons || [] : [];

  return (
    <div className="flex-1 flex flex-col h-full bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden animate-fade-in">
      {/* Header Banner */}
      <div className="p-6 md:p-8 border-b border-slate-100 flex-shrink-0 bg-slate-50/50">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            {scheme.ministry || "Ministry / Department"}
          </span>
          {scheme.is_rolling && (
            <Badge variant="blue" className="ml-auto text-[9px] font-extrabold px-2 py-0.5">
              ⚡ Rolling Application
            </Badge>
          )}
        </div>
        
        <h1 className="text-sm md:text-base font-extrabold text-slate-900 leading-relaxed mb-4 m-0 uppercase tracking-wide">
          {scheme.name}
        </h1>

        <div className="flex flex-wrap gap-2.5">
          <Badge className={benefitConfig.bg} style={{ borderWidth: "1px" }}>
            {benefitConfig.label}
          </Badge>
          {formattedBenefit && (
            <Badge variant="accent" className="font-bold">
              {formattedBenefit}
            </Badge>
          )}
        </div>
      </div>

      {/* Main Details Body */}
      <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 custom-scrollbar">
        {/* User Eligibility Card (if matching results present) */}
        {hasEligibility && (
          <div
            className={`border rounded-2xl p-5 flex items-start gap-4 ${
              isEligible
                ? "bg-emerald-50/30 border-emerald-100/80 text-emerald-800"
                : "bg-rose-50/30 border-rose-100/80 text-rose-800"
            }`}
          >
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-xl ${
                isEligible ? "bg-emerald-100 text-emerald-600" : "bg-rose-100 text-rose-600"
              }`}
            >
              {isEligible ? (
                <Icons.CheckCircle2 className="w-5 h-5" />
              ) : (
                <Icons.AlertTriangle className="w-5 h-5" />
              )}
            </div>
            <div className="flex-1">
              <h4 className="text-xs font-extrabold uppercase tracking-wide m-0 mb-1">
                {isEligible ? "You Are Eligible" : "Eligibility Issues Found"}
              </h4>
              <p className="text-xs font-medium m-0 leading-relaxed opacity-90">
                {isEligible
                  ? "Based on your citizen profile, you satisfy all requirements for this scheme."
                  : "You do not meet the criteria due to the following requirements:"}
              </p>
              {!isEligible && mismatchReasons.length > 0 && (
                <ul className="list-disc pl-5 mt-2 space-y-1 text-xs font-semibold">
                  {mismatchReasons.map((reason, idx) => (
                    <li key={idx} className="leading-relaxed">
                      {reason}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        {/* Detailed Criteria Fields */}
        <div>
          <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wide mb-4 flex items-center gap-2">
            <Icons.Sliders className="w-4 h-4 text-slate-400 stroke-[2]" />
            Scheme Criteria
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Age limits */}
            <div className="bg-slate-50 border border-slate-200/40 rounded-xl p-3.5 flex items-center gap-3">
              <Icons.UserCheck className="w-4 h-4 text-slate-400" />
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Age Limit</span>
                <span className="text-xs font-bold text-slate-800">
                  {scheme.min_age || scheme.max_age
                    ? `${scheme.min_age || 0} to ${scheme.max_age || "∞"} years`
                    : "All Ages"}
                </span>
              </div>
            </div>

            {/* Income Limits */}
            <div className="bg-slate-50 border border-slate-200/40 rounded-xl p-3.5 flex items-center gap-3">
              <Icons.IndianRupee className="w-4 h-4 text-slate-400" />
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Max Income Limit</span>
                <span className="text-xs font-bold text-slate-800">
                  {scheme.max_income ? `₹${scheme.max_income.toLocaleString("en-IN")} / year` : "No Limit"}
                </span>
              </div>
            </div>

            {/* States */}
            <div className="bg-slate-50 border border-slate-200/40 rounded-xl p-3.5 flex items-center gap-3">
              <Icons.MapPin className="w-4 h-4 text-slate-400" />
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Applicable States</span>
                <span className="text-xs font-bold text-slate-800 leading-snug">
                  {scheme.applicable_states && scheme.applicable_states.length > 0
                    ? scheme.applicable_states.join(", ")
                    : "All India"}
                </span>
              </div>
            </div>

            {/* Gender */}
            <div className="bg-slate-50 border border-slate-200/40 rounded-xl p-3.5 flex items-center gap-3">
              <Icons.Users2 className="w-4 h-4 text-slate-400" />
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Gender Target</span>
                <span className="text-xs font-bold text-slate-800 capitalize">
                  {scheme.gender || "Any"}
                </span>
              </div>
            </div>

            {/* Occupations */}
            {scheme.occupation_types && scheme.occupation_types.length > 0 && (
              <div className="bg-slate-50 border border-slate-200/40 rounded-xl p-3.5 flex items-center gap-3 md:col-span-2">
                <Icons.Briefcase className="w-4 h-4 text-slate-400" />
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Target Occupations</span>
                  <span className="text-xs font-bold text-slate-800 leading-snug">
                    {scheme.occupation_types.map(o => snakeToTitle(o)).join(", ")}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Required Documents Section */}
        {scheme.documents_required && scheme.documents_required.length > 0 && (
          <div>
            <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wide mb-4 flex items-center gap-2">
              <Icons.FileText className="w-4 h-4 text-slate-400 stroke-[2]" />
              Required Documents
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {scheme.documents_required.map((docKey) => (
                <div
                  key={docKey}
                  className="flex items-center gap-3 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-xl p-3"
                >
                  <Icons.File className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  <span>{DOC_LABELS[docKey] || snakeToTitle(docKey)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer / Apply Link */}
      {scheme.application_url && (
        <div className="p-6 md:p-8 border-t border-slate-100 bg-slate-50/50 flex-shrink-0">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Application link
            </span>
            <span className="text-[9px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-100/80 font-extrabold flex items-center gap-1">
              <Icons.Check className="w-2.5 h-2.5" /> Verified official URL
            </span>
          </div>
          <a
            href={scheme.application_url}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl py-4 text-xs font-bold text-center no-underline shadow-md hover:shadow-lg transition-all duration-200 active:scale-[0.99] cursor-pointer"
          >
            Apply Now — Official Site ↗
          </a>
        </div>
      )}
    </div>
  );
}
