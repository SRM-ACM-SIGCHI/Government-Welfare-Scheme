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
  { value: "unorganised_worker", label: "Daily wage / Unorganised worker" },
  { value: "self_employed",      label: "Self-employed / Small business" },
  { value: "unemployed",         label: "Unemployed / Looking for work" },
  { value: "salaried",           label: "Salaried employee" },
];

const INCOME_RANGES = [
  { value: 60000,   label: "Below ₹60,000 / year" },
  { value: 120000,  label: "₹60,000 – ₹1,20,000" },
  { value: 180000,  label: "₹1,20,000 – ₹1,80,000" },
  { value: 250000,  label: "₹1,80,000 – ₹2,50,000" },
  { value: 500000,  label: "₹2,50,000 – ₹5,00,000" },
  { value: 1000000, label: "Above ₹5,00,000" },
];

const STEPS = [
  { title: "Where do you live?",     subtitle: "We use this to find schemes in your state" },
  { title: "Tell us about yourself", subtitle: "This helps us match the right schemes" },
  { title: "Your income & work",     subtitle: "Many schemes depend on income and occupation" },
  { title: "Almost done!",           subtitle: "Review your profile before we find your schemes" },
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
    if (step === 1 && !profile.state) e.state = "Please select your state";
    if (step === 2) {
      if (!profile.gender)         e.gender         = "Please select gender";
      if (!profile.caste_category) e.caste_category = "Please select category";
      if (!profile.age || profile.age < 1) e.age   = "Please enter a valid age";
    }
    if (step === 3) {
      if (!profile.income_annual)   e.income_annual   = "Please select income";
      if (!profile.occupation_type) e.occupation_type = "Please select occupation";
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

  const btn = (active, onClick, children) => (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-3 rounded-xl border text-xs font-bold transition-all duration-150 cursor-pointer ${
        active 
          ? "border-blue-600 bg-blue-900 text-white shadow-sm" 
          : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
      }`}
    >
      {children}
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-0 md:p-6 box-border">
      <div className="w-full max-w-xl bg-white min-h-screen md:min-h-0 md:rounded-3xl md:shadow-md border-0 md:border border-gray-200/80 flex flex-col overflow-hidden">
        
        {/* Progress bar */}
        <div className="h-1 bg-gray-100 flex-shrink-0">
          <div className="h-1 bg-blue-600 transition-all duration-300" style={{ width: `${((step - 1) / 3) * 100}%` }} />
        </div>

        {/* Header */}
        <div className="p-6 pb-3 flex-shrink-0">
          <div className="flex justify-between items-center mb-4">
            {step > 1 ? (
              <button 
                onClick={() => setStep((s) => s - 1)}
                className="text-gray-400 bg-transparent border-0 text-xs font-semibold cursor-pointer p-0"
              >
                ← Back
              </button>
            ) : (
              <span />
            )}
            <span className="text-gray-400 text-xs font-bold uppercase tracking-wider">{step} of 4</span>
          </div>
          <h1 className="text-lg font-bold text-gray-900 m-0 leading-tight">{s.title}</h1>
          <p className="text-xs text-gray-500 m-0 mt-1 leading-relaxed">{s.subtitle}</p>
        </div>

        {/* Content Box */}
        <div className="flex-1 p-6 pt-2">

          {step === 1 && (
            <div className="space-y-2.5">
              <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider">Select your state</label>
              <select 
                value={profile.state} 
                onChange={(e) => update("state", e.target.value)}
                className="w-full py-2.5 px-4 rounded-xl border border-gray-200 text-sm bg-white outline-none focus:border-blue-500"
              >
                <option value="">— Choose state —</option>
                {STATES.map(([code, name]) => <option key={code} value={code}>{name}</option>)}
              </select>
              {errors.state && <p className="text-xs text-red-600 font-medium m-0 mt-1">{errors.state}</p>}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <div className="space-y-2">
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider">Gender</label>
                <div className="grid grid-cols-3 gap-2">
                  {["male", "female", "other"].map((g) => (
                    btn(profile.gender === g, () => update("gender", g), g)
                  ))}
                </div>
                {errors.gender && <p className="text-xs text-red-600 font-medium m-0 mt-1">{errors.gender}</p>}
              </div>

              <div className="space-y-2">
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider">Category</label>
                <div className="grid grid-cols-5 gap-1.5">
                  {["SC", "ST", "OBC", "EWS", "GEN"].map((c) => (
                    btn(profile.caste_category === c, () => update("caste_category", c), c)
                  ))}
                </div>
                {errors.caste_category && <p className="text-xs text-red-600 font-medium m-0 mt-1">{errors.caste_category}</p>}
              </div>

              <div className="space-y-2">
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider">Your age</label>
                <input 
                  type="number" 
                  value={profile.age} 
                  onChange={(e) => update("age", e.target.value)}
                  placeholder="e.g. 28" 
                  min="1" 
                  max="120"
                  className="w-full py-2.5 px-4 rounded-xl border border-gray-200 text-sm outline-none focus:border-blue-500 box-border" 
                />
                {errors.age && <p className="text-xs text-red-600 font-medium m-0 mt-1">{errors.age}</p>}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5">
              <div className="space-y-2">
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider">Annual household income</label>
                <div className="flex flex-col gap-2">
                  {INCOME_RANGES.map((r) => (
                    <button 
                      key={r.value} 
                      type="button"
                      onClick={() => update("income_annual", r.value)}
                      className={`text-left px-4 py-3 rounded-xl border transition-colors cursor-pointer text-xs font-semibold ${
                        profile.income_annual === r.value 
                          ? "border-blue-600 bg-blue-50/50 text-blue-700" 
                          : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
                {errors.income_annual && <p className="text-xs text-red-600 font-medium m-0 mt-1">{errors.income_annual}</p>}
              </div>

              <div className="space-y-2">
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider">Occupation</label>
                <div className="flex flex-col gap-2">
                  {OCCUPATIONS.map((o) => (
                    <button 
                      key={o.value} 
                      type="button"
                      onClick={() => update("occupation_type", o.value)}
                      className={`text-left px-4 py-3 rounded-xl border transition-colors cursor-pointer text-xs font-semibold ${
                        profile.occupation_type === o.value 
                          ? "border-blue-600 bg-blue-50/50 text-blue-700" 
                          : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
                {errors.occupation_type && <p className="text-xs text-red-600 font-medium m-0 mt-1">{errors.occupation_type}</p>}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <div className="border border-gray-100 rounded-2xl px-5 py-1 bg-gray-50/10">
                {[
                  { label: "State",      value: STATES.find(([c]) => c === profile.state)?.[1] },
                  { label: "Gender",     value: profile.gender },
                  { label: "Category",   value: profile.caste_category },
                  { label: "Age",        value: `${profile.age} years` },
                  { label: "Income",     value: INCOME_RANGES.find((r) => r.value === profile.income_annual)?.label },
                  { label: "Occupation", value: OCCUPATIONS.find((o) => o.value === profile.occupation_type)?.label },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between items-center py-3 border-b border-gray-50 last:border-b-0">
                    <span className="text-xs text-gray-400 font-semibold">{label}</span>
                    <span className="text-xs font-semibold text-gray-800 capitalize">{value}</span>
                  </div>
                ))}
              </div>
              <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3.5">
                <p className="color-[#166534] text-xs font-medium m-0 leading-relaxed">
                  ✅ Your welfare profile is saved locally in your browser. We respect your privacy and never upload it.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="p-6 pt-3 flex-shrink-0 border-t border-gray-50">
          {step < 4 ? (
            <button 
              onClick={next} 
              className="w-full bg-blue-900 text-white border-0 rounded-xl py-3.5 text-xs font-bold cursor-pointer shadow-sm hover:bg-blue-800 transition-colors"
            >
              Continue →
            </button>
          ) : (
            <button 
              onClick={submit} 
              className="w-full bg-blue-900 text-white border-0 rounded-xl py-3.5 text-xs font-bold cursor-pointer shadow-sm hover:bg-blue-800 transition-colors"
            >
              Find My Schemes 🎯
            </button>
          )}
        </div>
      </div>
    </div>
  );
}