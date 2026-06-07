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

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem("user_profile");
    if (!raw) { router.push("/onboarding"); return; }
    const p = JSON.parse(raw);
    setProfile(p);
    setForm(p);
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
    if (confirm("Delete your profile? You will need to fill it in again.")) {
      localStorage.removeItem("user_profile");
      router.push("/");
    }
  };

  if (!profile) return null;

  const stateName    = STATES.find(([c]) => c === profile.state)?.[1] || profile.state;
  const occLabel     = OCCUPATIONS.find((o) => o.value === profile.occupation_type)?.label || profile.occupation_type;
  const incomeLabel  = INCOME_RANGES.find((r) => r.value === profile.income_annual)?.label || `₹${profile.income_annual}`;

  const btn = (active, onClick, children) => (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-2.5 rounded-xl border text-xs font-bold transition-all duration-150 cursor-pointer ${
        active 
          ? "border-blue-600 bg-blue-900 text-white shadow-sm" 
          : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
      }`}
    >
      {children}
    </button>
  );

  return (
    <AppLayout activeTab="/profile">
      <div className="w-full max-w-xl mx-auto pb-24 md:pb-6">
        
        {/* Profile Card Shell */}
        <div className="bg-white border border-gray-200 rounded-3xl shadow-sm overflow-hidden">
          
          {/* Header */}
          <div className="border-b border-gray-100 px-6 py-5 flex items-center justify-between bg-white">
            <button
              onClick={() => router.back()}
              className="bg-transparent border-0 text-gray-500 text-xs font-semibold cursor-pointer"
            >
              ← Back
            </button>
            <h1 className="text-sm font-bold text-gray-900 m-0">My Welfare Profile</h1>
            <button
              onClick={() => setEditing(!editing)}
              className="bg-transparent border-0 text-blue-600 text-xs font-bold cursor-pointer"
            >
              {editing ? "Cancel" : "Edit"}
            </button>
          </div>

          <div className="p-6">
            {saved && (
              <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3.5 mb-4 text-xs font-semibold text-emerald-800">
                ✅ Profile saved successfully!
              </div>
            )}

            {!editing ? (
              <div className="border border-gray-100 rounded-2xl px-5 py-1.5 space-y-1 bg-gray-50/10">
                {[
                  { label: "State of Residence", value: stateName },
                  { label: "Gender Profile", value: profile.gender },
                  { label: "Social Category", value: profile.caste_category },
                  { label: "Age Verification", value: `${profile.age} years` },
                  { label: "Annual Household Income", value: incomeLabel },
                  { label: "Occupation Type", value: occLabel },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between items-center py-3.5 border-b border-gray-50 last:border-b-0">
                    <span className="text-xs text-gray-400 font-semibold">{label}</span>
                    <span className="text-xs font-semibold text-gray-800 capitalize">{value}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-5">
                
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider">State</label>
                  <select
                    value={form.state}
                    onChange={(e) => update("state", e.target.value)}
                    className="w-full py-2.5 px-4 rounded-xl border border-gray-200 text-sm bg-white outline-none focus:border-blue-500"
                  >
                    {STATES.map(([code, name]) => (
                      <option key={code} value={code}>{name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider">Gender</label>
                  <div className="grid grid-cols-3 gap-2">
                    {["male", "female", "other"].map((g) => (
                      btn(form.gender === g, () => update("gender", g), g)
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider">Category</label>
                  <div className="grid grid-cols-5 gap-1.5">
                    {["SC", "ST", "OBC", "EWS", "GEN"].map((c) => (
                      btn(form.caste_category === c, () => update("caste_category", c), c)
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider">Age</label>
                  <input
                    type="number"
                    value={form.age}
                    onChange={(e) => update("age", e.target.value)}
                    min="1"
                    max="120"
                    className="w-full py-2.5 px-4 rounded-xl border border-gray-200 text-sm outline-none focus:border-blue-500 box-border"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider">Annual income</label>
                  <div className="flex flex-col gap-2">
                    {INCOME_RANGES.map((r) => (
                      <button
                        key={r.value}
                        type="button"
                        onClick={() => update("income_annual", r.value)}
                        className={`text-left px-4 py-3 rounded-xl border transition-colors cursor-pointer text-xs font-semibold ${
                          form.income_annual === r.value 
                            ? "border-blue-600 bg-blue-50/50 text-blue-700" 
                            : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        {r.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider">Occupation</label>
                  <div className="flex flex-col gap-2">
                    {OCCUPATIONS.map((o) => (
                      <button
                        key={o.value}
                        type="button"
                        onClick={() => update("occupation_type", o.value)}
                        className={`text-left px-4 py-3 rounded-xl border transition-colors cursor-pointer text-xs font-semibold ${
                          form.occupation_type === o.value 
                            ? "border-blue-600 bg-blue-50/50 text-blue-700" 
                            : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        {o.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Save button inline in the edit form */}
                <div className="pt-4 border-t border-gray-50">
                  <button
                    type="button"
                    onClick={handleSave}
                    className="w-full bg-blue-900 text-white border-0 rounded-xl py-3.5 text-xs font-bold cursor-pointer shadow-sm hover:bg-blue-800 transition-colors"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            )}

            {/* Profile Delete Action */}
            {!editing && (
              <div className="mt-5 border-t border-gray-50 pt-5">
                <button
                  type="button"
                  onClick={handleDelete}
                  className="w-full py-3 rounded-xl border border-red-200 bg-white text-red-600 text-xs font-semibold cursor-pointer transition-colors hover:bg-red-50/50"
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