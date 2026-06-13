"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AppLayout from "../../components/AppLayout";
import ChatBot from "../../components/ChatBot";

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

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [saved, setSaved] = useState(false);
  const [language, setLanguage] = useState("en");

  useEffect(() => {
    const raw = localStorage.getItem("user_profile");
    if (!raw) { router.push("/onboarding"); return; }
    const p = JSON.parse(raw);
    setProfile(p);
    setForm(p);

    const savedLang = localStorage.getItem("language") || "en";
    setLanguage(savedLang);
  }, []);

  const update = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const handleSave = () => {
    const updated = { ...form, age: parseInt(form.age), income_annual: parseInt(form.income_annual) };
    localStorage.setItem("user_profile", JSON.stringify(updated));
    setProfile(updated);
    setEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete your profile? All matching criteria will be removed and you will need to fill it in again.")) {
      localStorage.removeItem("user_profile");
      router.push("/");
    }
  };

  if (!profile) return null;

  const stateName    = STATES.find(([c]) => c === profile.state)?.[1] || profile.state;
  const occLabel     = OCCUPATIONS.find((o) => o.value === profile.occupation_type)?.label || profile.occupation_type;
  const incomeLabel  = INCOME_RANGES.find((r) => r.value === profile.income_annual)?.label || `₹${profile.income_annual}`;

  const renderOptionBtn = (active, onClick, children) => (
    <button
      type="button"
      onClick={onClick}
      className={`px-3.5 py-2.5 rounded-2xl border text-xs font-bold transition-all duration-200 cursor-pointer shadow-sm active:scale-[0.99] capitalize ${
        active 
          ? "border-indigo-900 bg-indigo-900 text-white shadow-indigo-100" 
          : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-800"
      }`}
    >
      {children}
    </button>
  );

  return (
    <AppLayout activeTab="/profile">
      <div className="w-full max-w-xl mx-auto pb-24 md:pb-6 px-4 md:px-0 box-border">
        
        {/* Profile Card Shell */}
        <div className="bg-white border border-slate-200/80 rounded-3xl shadow-sm overflow-hidden animate-[fadeIn_0.25s_ease-out]">
          
          {/* Header */}
          <div className="border-b border-slate-100 px-6 py-5 flex items-center justify-between bg-white flex-shrink-0">
            <button
              onClick={() => router.back()}
              className="bg-transparent border-0 text-slate-400 hover:text-slate-800 text-xs font-bold cursor-pointer transition-colors p-0"
            >
              ← Back
            </button>
            <h1 className="text-sm font-extrabold text-slate-900 tracking-tight m-0 uppercase tracking-widest text-[11px] text-slate-400">
              My Welfare Profile
            </h1>
            <button
              onClick={() => { setEditing(!editing); setForm(profile); }}
              className="bg-transparent border-0 text-indigo-600 hover:text-indigo-900 text-xs font-extrabold cursor-pointer transition-colors"
            >
              {editing ? "Cancel" : "Edit"}
            </button>
          </div>

          <div className="p-6 md:p-8">
            {saved && (
              <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 mb-5 text-xs font-bold text-emerald-800 animate-[fadeIn_0.2s_ease-out]">
                ✅ Profile updated successfully!
              </div>
            )}

            {!editing ? (
              <div className="border border-slate-200/80 rounded-3xl px-5 py-2 bg-slate-50/20">
                {[
                  { label: "State of Residence", value: stateName },
                  { label: "Gender Profile", value: profile.gender },
                  { label: "Social Category", value: profile.caste_category },
                  { label: "Age Verification", value: `${profile.age} years` },
                  { label: "Annual Household Income", value: incomeLabel },
                  { label: "Occupation Sector", value: occLabel },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between items-center py-4 border-b border-slate-100 last:border-b-0">
                    <span className="text-xs text-slate-400 font-extrabold uppercase tracking-wider">{label}</span>
                    <span className="text-xs font-bold text-slate-800 capitalize text-right">{value}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-6">
                
                <div className="space-y-2.5">
                  <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">State</label>
                  <select
                    value={form.state}
                    onChange={(e) => update("state", e.target.value)}
                    className="w-full py-3 px-4 rounded-2xl border border-slate-200 text-sm bg-white outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 font-semibold text-slate-700 cursor-pointer"
                  >
                    {STATES.map(([code, name]) => (
                      <option key={code} value={code}>{name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2.5">
                  <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Gender</label>
                  <div className="grid grid-cols-3 gap-2.5">
                    {["male", "female", "other"].map((g) => (
                      renderOptionBtn(form.gender === g, () => update("gender", g), g)
                    ))}
                  </div>
                </div>

                <div className="space-y-2.5">
                  <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Category</label>
                  <div className="grid grid-cols-5 gap-1.5">
                    {["SC", "ST", "OBC", "EWS", "GEN"].map((c) => (
                      renderOptionBtn(form.caste_category === c, () => update("caste_category", c), c)
                    ))}
                  </div>
                </div>

                <div className="space-y-2.5">
                  <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Age</label>
                  <input
                    type="number"
                    value={form.age}
                    onChange={(e) => update("age", e.target.value)}
                    min="1"
                    max="120"
                    className="w-full py-3 px-4 rounded-2xl border border-slate-200 text-sm outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 font-semibold text-slate-700 box-border"
                  />
                </div>

                <div className="space-y-2.5">
                  <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Annual Income</label>
                  <div className="flex flex-col gap-2.5">
                    {INCOME_RANGES.map((r) => (
                      <button
                        key={r.value}
                        type="button"
                        onClick={() => update("income_annual", r.value)}
                        className={`text-left px-4 py-3 rounded-2xl border transition-all duration-200 cursor-pointer text-xs font-bold shadow-sm active:scale-[0.99] ${
                          form.income_annual === r.value 
                            ? "border-indigo-900 bg-indigo-50/50 text-indigo-900" 
                            : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-800"
                        }`}
                      >
                        {r.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2.5">
                  <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Occupation</label>
                  <div className="flex flex-col gap-2.5">
                    {OCCUPATIONS.map((o) => (
                      <button
                        key={o.value}
                        type="button"
                        onClick={() => update("occupation_type", o.value)}
                        className={`text-left px-4 py-3 rounded-2xl border transition-all duration-200 cursor-pointer text-xs font-bold shadow-sm active:scale-[0.99] ${
                          form.occupation_type === o.value 
                            ? "border-indigo-900 bg-indigo-50/50 text-indigo-900" 
                            : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-800"
                        }`}
                      >
                        {o.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Save button inline in the edit form */}
                <div className="pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={handleSave}
                    className="w-full bg-indigo-900 hover:bg-indigo-800 text-white border-0 rounded-2xl py-4 text-xs font-bold cursor-pointer shadow-md transition-all duration-200 active:scale-98"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            )}

            {/* Profile Delete Action */}
            {!editing && (
              <div className="mt-6 border-t border-slate-200 pt-6">
                <button
                  type="button"
                  onClick={handleDelete}
                  className="w-full py-4 rounded-2xl border border-red-200 bg-white hover:bg-red-50/30 text-red-600 text-xs font-bold cursor-pointer transition-colors duration-200"
                >
                  Delete My Profile
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Floating chatbot bubble */}
      <ChatBot language={language} />
    </AppLayout>
  );
}