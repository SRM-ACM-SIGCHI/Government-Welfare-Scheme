"use client";

import { usePathname, useRouter } from "next/navigation";

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  const TABS = [
    { name: "Schemes", path: "/schemes", icon: "🏛️" },
    { name: "AI Search", path: "/search", icon: "🧠" },
    { name: "Tracker", path: "/tracker", icon: "📋" },
    { name: "Nearby", path: "/nearby", icon: "📍" },
    { name: "Profile", path: "/profile", icon: "👤" },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md h-16 bg-white/95 backdrop-blur-md border-t border-gray-200/80 flex justify-around items-center z-[990] shadow-[0_-4px_20px_rgba(0,0,0,0.03)] pb-[env(safe-area-inset-bottom,0px)] px-3 box-border">
      {TABS.map((tab) => {
        const isActive = pathname === tab.path;
        return (
          <button
            key={tab.path}
            onClick={() => router.push(tab.path)}
            className={`flex-1 h-full flex flex-col items-center justify-center bg-transparent border-0 cursor-pointer gap-1 transition-all duration-250 select-none ${
              isActive ? "text-blue-900" : "text-gray-400 hover:text-gray-600"
            }`}
          >
            <span
              className={`text-xl transition-all duration-300 ${
                isActive ? "scale-115 -translate-y-0.5" : "scale-100"
              }`}
            >
              {tab.icon}
            </span>
            <span
              className={`text-[10px] tracking-wide transition-all duration-200 ${
                isActive ? "font-bold" : "font-semibold"
              }`}
            >
              {tab.name}
            </span>
            {/* Active underline indicator */}
            {isActive && (
              <span className="w-5 h-0.5 bg-blue-900 rounded-full animate-[fadeIn_0.2s_ease-out]"></span>
            )}
          </button>
        );
      })}
    </div>
  );
}