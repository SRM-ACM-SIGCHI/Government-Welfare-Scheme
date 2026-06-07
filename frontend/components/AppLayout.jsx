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
    // Reload page to propagate language change to all components
    window.location.reload();
  };

  const handleSyncSchemes = async () => {
    setSyncLoading(true);
    setSyncStatus("");
    try {
      const res = await fetch(`${API_URL}/schemes/sync-scraped?max_schemes=5`, {
        method: "POST"
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
    <div className="min-h-screen flex flex-col md:flex-row bg-[#f9fafb]">
      
      {/* 1. Desktop Sidebar Navigation */}
      <aside className="hidden md:flex flex-col w-[280px] bg-white border-r border-gray-200 h-screen sticky top-0 z-50 p-6 box-border justify-between select-none shrink-0">
        
        {/* Branding */}
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => router.push("/")}>
            <div className="w-10 h-10 rounded-xl bg-blue-900 flex items-center justify-center text-xl text-white shadow-md">
              🏛️
            </div>
            <div>
              <h1 className="text-base font-bold text-gray-900 m-0 tracking-tight leading-tight">Welfare Info</h1>
              <span className="text-[11px] font-semibold text-emerald-600 tracking-wider uppercase">Is Wealth</span>
            </div>
          </div>

          <hr className="border-gray-100 my-1" />

          {/* Navigation Links */}
          <nav className="flex flex-col gap-2">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.path || activeTab === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => router.push(item.path)}
                  className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl border-0 text-sm font-semibold cursor-pointer transition-all duration-200 text-left ${
                    isActive
                      ? "bg-blue-50 text-blue-900 shadow-sm"
                      : "bg-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <span className={`text-lg transition-transform duration-200 ${isActive ? "scale-110" : ""}`}>
                    {item.icon}
                  </span>
                  {item.name}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer (Language Swapper & Admin Tools) */}
        <div className="flex flex-col gap-4">
          
          {/* Admin Sync Tool */}
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs">⚙️</span>
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Admin Actions</span>
            </div>
            <button
              onClick={handleSyncSchemes}
              disabled={syncLoading}
              className={`w-full py-2.5 px-4 rounded-xl border border-gray-200 text-xs font-semibold cursor-pointer shadow-sm flex items-center justify-center gap-2 transition-all duration-200 ${
                syncLoading
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-white text-gray-700 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              <span className={syncLoading ? "animate-spin" : ""}>🔄</span>
              {syncLoading ? "Syncing..." : "Sync Fresh Schemes"}
            </button>
            {syncStatus === "success" && (
              <span className="text-[11px] font-semibold text-emerald-600 text-center animate-fade-in">
                ✅ Scraper Sync started in backend!
              </span>
            )}
            {syncStatus === "error" && (
              <span className="text-[11px] font-semibold text-red-500 text-center animate-fade-in">
                ❌ Sync request failed.
              </span>
            )}
          </div>

          {/* Language Switcher */}
          <div className="flex justify-between items-center bg-gray-50 p-1.5 rounded-xl border border-gray-200">
            <button
              onClick={() => changeLanguage("en")}
              className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold border-0 cursor-pointer transition-all duration-150 ${
                lang === "en" ? "bg-white text-gray-900 shadow-sm" : "bg-transparent text-gray-500 hover:text-gray-900"
              }`}
            >
              EN
            </button>
            <button
              onClick={() => changeLanguage("ta")}
              className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold border-0 cursor-pointer transition-all duration-150 ${
                lang === "ta" ? "bg-white text-gray-900 shadow-sm" : "bg-transparent text-gray-500 hover:text-gray-900"
              }`}
            >
              தமிழ்
            </button>
            <button
              onClick={() => changeLanguage("hi")}
              className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold border-0 cursor-pointer transition-all duration-150 ${
                lang === "hi" ? "bg-white text-gray-900 shadow-sm" : "bg-transparent text-gray-500 hover:text-gray-900"
              }`}
            >
              हिंदी
            </button>
          </div>

          <span className="text-[10px] text-gray-400 text-center block mt-1">
            © 2026 Government Welfare Schemes
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
