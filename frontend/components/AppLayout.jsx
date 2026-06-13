"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import BottomNav from "./Bottomnav";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const NAV_ITEMS = [
  { name: "Matched Schemes", path: "/schemes", icon: "🏛️" },
  { name: "AI Search", path: "/search", icon: "🧠" },
  { name: "Nearby Centers", path: "/nearby", icon: "📍" },
  { name: "My Profile", path: "/profile", icon: "👤" },
];

export default function AppLayout({ children, activeTab }) {
  const router = useRouter();
  const pathname = usePathname();
  const [lang, setLang] = useState("en");
  const [syncLoading, setSyncLoading] = useState(false);
  const [syncStatus, setSyncStatus] = useState(""); // "", "success", "error"

  useEffect(() => {
    const savedLang = localStorage.getItem("language") || "en";
    setLang(savedLang);
  }, []);

  const changeLanguage = (newLang) => {
    setLang(newLang);
    localStorage.setItem("language", newLang);
    window.location.reload();
  };

  const handleSyncSchemes = async () => {
    setSyncLoading(true);
    setSyncStatus("");
    try {
      const res = await fetch(`${API_URL}/schemes/sync-scraped?max_schemes=5`, {
        method: "POST",
      });
      if (res.ok) {
        setSyncStatus("success");
        setTimeout(() => setSyncStatus(""), 4000);
      } else {
        setSyncStatus("error");
      }
    } catch (e) {
      setSyncStatus("error");
      setTimeout(() => setSyncStatus(""), 4000);
    } finally {
      setSyncLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#f8fafc] font-sans antialiased text-slate-800">
      
      {/* 1. Desktop Sidebar Navigation */}
      <aside className="hidden md:flex flex-col w-[280px] bg-white border-r border-slate-200/80 h-screen sticky top-0 z-50 p-6 box-border justify-between select-none shrink-0 shadow-[4px_0_24px_rgba(0,0,0,0.015)]">
        
        {/* Branding */}
        <div className="flex flex-col gap-8">
          <div className="flex items-center gap-3.5 cursor-pointer group" onClick={() => router.push("/")}>
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-900 to-blue-900 flex items-center justify-center text-xl text-white shadow-md shadow-indigo-900/10 group-hover:scale-105 transition-transform duration-200">
              🏛️
            </div>
            <div>
              <h1 className="text-base font-extrabold text-slate-900 m-0 tracking-tight leading-tight group-hover:text-blue-900 transition-colors">
                Welfare Info
              </h1>
              <span className="text-[10px] font-bold text-emerald-600 tracking-widest uppercase">
                India Platform
              </span>
            </div>
          </div>

          <hr className="border-slate-100/80 my-1" />

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1.5">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.path || activeTab === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => router.push(item.path)}
                  className={`w-full flex items-center gap-3.5 px-4.5 py-3 rounded-2xl border-0 text-sm font-semibold cursor-pointer transition-all duration-200 text-left ${
                    isActive
                      ? "bg-indigo-50/70 text-indigo-950 shadow-sm border-l-4 border-indigo-900"
                      : "bg-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <span className={`text-lg transition-transform duration-200 ${isActive ? "scale-110" : "opacity-80"}`}>
                    {item.icon}
                  </span>
                  <span>{item.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer (Language Swapper & Admin Tools) */}
        <div className="flex flex-col gap-5">
          
          {/* Admin Sync Tool */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4.5 flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">⚙️</span>
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                Database Admin
              </span>
            </div>
            <button
              onClick={handleSyncSchemes}
              disabled={syncLoading}
              className={`w-full py-2.5 px-4 rounded-xl border border-slate-200 text-xs font-bold cursor-pointer shadow-sm flex items-center justify-center gap-2 transition-all duration-200 active:scale-98 ${
                syncLoading
                  ? "bg-slate-100 text-slate-400 cursor-not-allowed border-transparent"
                  : "bg-white text-slate-700 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <span className={syncLoading ? "animate-spin" : ""}>🔄</span>
              <span>{syncLoading ? "Syncing..." : "Sync Fresh Schemes"}</span>
            </button>
            {syncStatus === "success" && (
              <span className="text-[10px] font-bold text-emerald-600 text-center animate-[fadeIn_0.2s_ease-out]">
                ✅ Sync started successfully!
              </span>
            )}
            {syncStatus === "error" && (
              <span className="text-[10px] font-bold text-red-500 text-center animate-[fadeIn_0.2s_ease-out]">
                ❌ Sync request failed.
              </span>
            )}
          </div>

          {/* Language Switcher */}
          <div className="flex justify-between items-center bg-slate-50 p-1.5 rounded-xl border border-slate-200/80">
            <button
              onClick={() => changeLanguage("en")}
              className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold border-0 cursor-pointer transition-all duration-200 ${
                lang === "en" ? "bg-white text-indigo-950 shadow-sm" : "bg-transparent text-slate-400 hover:text-slate-900"
              }`}
            >
              EN
            </button>
            <button
              onClick={() => changeLanguage("ta")}
              className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold border-0 cursor-pointer transition-all duration-200 ${
                lang === "ta" ? "bg-white text-indigo-950 shadow-sm" : "bg-transparent text-slate-400 hover:text-slate-900"
              }`}
            >
              தமிழ்
            </button>
            <button
              onClick={() => changeLanguage("hi")}
              className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold border-0 cursor-pointer transition-all duration-200 ${
                lang === "hi" ? "bg-white text-indigo-950 shadow-sm" : "bg-transparent text-slate-400 hover:text-slate-900"
              }`}
            >
              हिंदी
            </button>
          </div>

          <span className="text-[10px] text-slate-400 text-center block mt-1 font-medium">
            © 2026 Welfare Info Platform
          </span>
        </div>
      </aside>

      {/* 2. Main Responsive Content Container */}
      <main className="flex-1 min-w-0 flex flex-col">
        {/* Render child content */}
        <div className="flex-1 md:pb-6 md:pt-4 md:px-6 w-full box-border">
          {children}
        </div>
        
        {/* Mobile bottom navigation bar */}
        <BottomNav />
      </main>

      {/* Dynamic Keyframe Injection for sync transition */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin {
          animation: spin 1.5s linear infinite;
          display: inline-block;
        }
      `}</style>
    </div>
  );
}
