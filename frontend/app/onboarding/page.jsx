"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const STATES = [
  ["AN","Andaman & Nicobar"],["AP","Andhra Pradesh"],["AR","Arunachal Pradesh"],
  ["AS","Assam"],["BR","Bihar"],["CG","Chhattisgarh"],["CH","Chandigarh"],
  ["DL","Delhi"],["GA","Goa"],["GJ","Gujarat"],["HP","Himachal Pradesh"],
  ["HR","Haryana"],["JH","Jharkhand"],["JK","Jammu & Kashmir"],
  ["KA","Karnataka"],["KL","Kerala"],["MH","Maharashtra"],["ML","Meghalaya"],
  ["MN","Manipur"],["MP","Madhya Pradesh"],["MZ","Mizoram"],["NL","Nagaland"],
  ["OD","Odisha"],["PB","Punjab"],["PY","Puducherry"],["RJ","Rajasthan"],
  ["SK","Sikkim"],["TN","Tamil Nadu"],["TR","Tripura"],["TS","Telangana"],
  ["UK","Uttarakhand"],["UP","Uttar Pradesh"],["WB","West Bengal"],
];

const OCCUPATIONS = [
  { value: "farmer",             label: "Farmer / Agriculture" },
  { value: "student",            label: "Student" },
  { value: "unorganised_worker", label: "Daily Wage / Unorganised Worker" },
  { value: "self_employed",      label: "Self-employed / Small Business" },
  { value: "unemployed",         label: "Unemployed / Looking for Work" },
  { value: "salaried",           label: "Salaried Employee" },
];

const INCOME_RANGES = [
  { value: 60000,   label: "Below ₹60,000 / year" },
  { value: 120000,  label: "₹60,000 – ₹1,20,000 / year" },
  { value: 180000,  label: "₹1,20,000 – ₹1,80,000 / year" },
  { value: 250000,  label: "₹1,80,000 – ₹2,50,000 / year" },
  { value: 500000,  label: "₹2,50,000 – ₹5,00,000 / year" },
  { value: 1000000, label: "Above ₹5,00,000 / year" },
];

const STEPS = [
  { title: "Where do you live?",     subtitle: "We use this to filter state-specific welfare schemes" },
  { title: "Tell us about yourself", subtitle: "Demographic factors help us filter eligibility criteria" },
  { title: "Your income & occupation", subtitle: "Welfare benefits are heavily matched to income limits and occupation sectors" },
  { title: "Review your profile",    subtitle: "Verify details before finding matches" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState({
    state: "", gender: "", caste_category: "",
    age: "", income_annual: "", occupation_type: "",
  });
  const [errors, setErrors] = useState({});

  const update = (key, value) => {
    setProfile((p) => ({ ...p, [key]: value }));
    setErrors((e) => ({ ...e, [key]: "" }));
  };

  const validate = () => {
    const e = {};
    if (step === 1 && !profile.state) e.state = "Please select your state of residence";
    if (step === 2) {
      if (!profile.gender)         e.gender         = "Please select a gender profile";
      if (!profile.caste_category) e.caste_category = "Please select a social category";
      if (!profile.age || profile.age < 1 || profile.age > 120) e.age = "Please enter a valid age (1 - 120)";
    }
    if (step === 3) {
      if (!profile.income_annual)   e.income_annual   = "Please select your annual household income";
      if (!profile.occupation_type) e.occupation_type = "Please select your occupation sector";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => { if (validate()) setStep((s) => Math.min(s + 1, 4)); };

  const submit = () => {
    const final = { ...profile, age: parseInt(profile.age), income_annual: parseInt(profile.income_annual) };
    localStorage.setItem("user_profile", JSON.stringify(final));
    router.push("/schemes");
  };

  const s = STEPS[step - 1];

  const renderOptionBtn = (active, onClick, children) => (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 py-3 rounded-2xl border text-xs font-bold transition-all duration-200 cursor-pointer shadow-sm active:scale-[0.99] capitalize ${
        active 
          ? "border-indigo-900 bg-indigo-900 text-white shadow-indigo-100" 
          : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-800"
      }`}
    >
      {children}
    </button>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 md:p-8 box-border font-sans antialiased text-slate-800">
      <div className="w-full max-w-lg bg-white min-h-[85vh] md:min-h-0 md:rounded-3xl md:shadow-xl md:border border-slate-200/85 flex flex-col justify-between overflow-hidden transition-all duration-300">
        
        {/* Dynamic Multi-Step Progress bar */}
        <div className="h-1.5 bg-slate-100 flex-shrink-0 w-full relative">
          <div 
            className="h-full bg-gradient-to-r from-indigo-600 to-blue-600 transition-all duration-500 rounded-r-full" 
            style={{ width: `${(step / 4) * 100}%` }} 
          />
        </div>

        {/* Header */}
        <div className="p-6 md:p-8 pb-3 flex-shrink-0 flex flex-col gap-4">
          <div className="flex justify-between items-center">
            {step > 1 ? (
              <button 
                onClick={() => setStep((s) => s - 1)}
                className="text-slate-400 hover:text-slate-900 bg-transparent border-0 text-xs font-extrabold cursor-pointer p-0 transition-colors"
              >
                ← Back
              </button>
            ) : (
              <span />
            )}
            <span className="text-slate-400 text-[10px] font-extrabold uppercase tracking-widest bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
              Step {step} of 4
            </span>
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 m-0 leading-tight">{s.title}</h1>
            <p className="text-xs text-slate-500 m-0 mt-2.5 leading-relaxed font-medium">{s.subtitle}</p>
          </div>
        </div>

        {/* Content Box */}
        <div className="flex-1 p-6 md:p-8 pt-4">

          {step === 1 && (
            <div className="space-y-3 animate-[fadeIn_0.25s_ease-out]">
              <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                Select Your State
              </label>
              <select 
                value={profile.state} 
                onChange={(e) => update("state", e.target.value)}
                className="w-full py-3 px-4 rounded-2xl border border-slate-200 text-sm bg-white outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all duration-200 cursor-pointer text-slate-700 font-semibold"
              >
                <option value="">— Choose State —</option>
                {STATES.map(([code, name]) => (
                  <option key={code} value={code}>{name}</option>
                ))}
              </select>
              {errors.state && (
                <p className="text-xs text-red-600 font-bold m-0 mt-2 flex items-center gap-1">
                  <span>⚠️</span> {errors.state}
                </p>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-[fadeIn_0.25s_ease-out]">
              <div className="space-y-3">
                <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                  Gender Profile
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  {["male", "female", "other"].map((g) => (
                    renderOptionBtn(profile.gender === g, () => update("gender", g), g)
                  ))}
                </div>
                {errors.gender && (
                  <p className="text-xs text-red-600 font-bold m-0 mt-2 flex items-center gap-1">
                    <span>⚠️</span> {errors.gender}
                  </p>
                )}
              </div>

              <div className="space-y-3">
                <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                  Social Caste Category
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {["SC", "ST", "OBC", "EWS", "GEN"].map((c) => (
                    renderOptionBtn(profile.caste_category === c, () => update("caste_category", c), c)
                  ))}
                </div>
                {errors.caste_category && (
                  <p className="text-xs text-red-600 font-bold m-0 mt-2 flex items-center gap-1">
                    <span>⚠️</span> {errors.caste_category}
                  </p>
                )}
              </div>

              <div className="space-y-3">
                <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                  Your Current Age
                </label>
                <input 
                  type="number" 
                  value={profile.age} 
                  onChange={(e) => update("age", e.target.value)}
                  placeholder="e.g. 28" 
                  min="1" 
                  max="120"
                  className="w-full py-3 px-4 rounded-2xl border border-slate-200 text-sm outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all duration-200 box-border text-slate-700 font-semibold" 
                />
                {errors.age && (
                  <p className="text-xs text-red-600 font-bold m-0 mt-2 flex items-center gap-1">
                    <span>⚠️</span> {errors.age}
                  </p>
                )}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animate-[fadeIn_0.25s_ease-out]">
              <div className="space-y-3">
                <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                  Annual Household Income
                </label>
                <div className="flex flex-col gap-2.5">
                  {INCOME_RANGES.map((r) => (
                    <button 
                      key={r.value} 
                      type="button"
                      onClick={() => update("income_annual", r.value)}
                      className={`text-left px-4 py-3.5 rounded-2xl border transition-all duration-200 cursor-pointer text-xs font-bold shadow-sm active:scale-[0.99] ${
                        profile.income_annual === r.value 
                          ? "border-indigo-900 bg-indigo-50/50 text-indigo-900" 
                          : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-800"
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
                {errors.income_annual && (
                  <p className="text-xs text-red-600 font-bold m-0 mt-2 flex items-center gap-1">
                    <span>⚠️</span> {errors.income_annual}
                  </p>
                )}
              </div>

              <div className="space-y-3">
                <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                  Occupation Sector
                </label>
                <div className="flex flex-col gap-2.5">
                  {OCCUPATIONS.map((o) => (
                    <button 
                      key={o.value} 
                      type="button"
                      onClick={() => update("occupation_type", o.value)}
                      className={`text-left px-4 py-3.5 rounded-2xl border transition-all duration-200 cursor-pointer text-xs font-bold shadow-sm active:scale-[0.99] ${
                        profile.occupation_type === o.value 
                          ? "border-indigo-900 bg-indigo-50/50 text-indigo-900" 
                          : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-800"
                      }`}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
                {errors.occupation_type && (
                  <p className="text-xs text-red-600 font-bold m-0 mt-2 flex items-center gap-1">
                    <span>⚠️</span> {errors.occupation_type}
                  </p>
                )}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-5 animate-[fadeIn_0.25s_ease-out]">
              <div className="border border-slate-200/80 rounded-3xl px-5 py-2.5 bg-slate-50/50">
                {[
                  { label: "State",      value: STATES.find(([c]) => c === profile.state)?.[1] },
                  { label: "Gender",     value: profile.gender },
                  { label: "Category",   value: profile.caste_category },
                  { label: "Age",        value: `${profile.age} years` },
                  { label: "Income",     value: INCOME_RANGES.find((r) => r.value === profile.income_annual)?.label },
                  { label: "Occupation", value: OCCUPATIONS.find((o) => o.value === profile.occupation_type)?.label },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between items-center py-3.5 border-b border-slate-100 last:border-b-0">
                    <span className="text-xs text-slate-400 font-extrabold uppercase tracking-wider">{label}</span>
                    <span className="text-xs font-bold text-slate-800 capitalize text-right">{value}</span>
                  </div>
                ))}
              </div>
              <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex gap-2">
                <span className="text-sm">🛡️</span>
                <p className="text-[11px] text-emerald-800 font-semibold m-0 leading-relaxed">
                  Your welfare profile details are securely saved locally inside your browser cache. We value your confidentiality and never upload your profile metadata to any external server.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="p-6 md:p-8 pt-4 flex-shrink-0 border-t border-slate-100">
          {step < 4 ? (
            <button 
              onClick={next} 
              className="w-full bg-indigo-900 hover:bg-indigo-800 text-white border-0 rounded-2xl py-4 text-sm font-bold cursor-pointer shadow-md transition-all duration-200 active:scale-98"
            >
              Continue →
            </button>
          ) : (
            <button 
              onClick={submit} 
              className="w-full bg-indigo-900 hover:bg-indigo-800 text-white border-0 rounded-2xl py-4 text-sm font-bold cursor-pointer shadow-md transition-all duration-200 active:scale-98"
            >
              Find My Schemes 🎯
            </button>
          )}
        </div>
      </div>
    </div>
  );
}