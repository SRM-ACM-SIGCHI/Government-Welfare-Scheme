"use client";

import { usePathname, useRouter } from "next/navigation";

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  const TABS = [
    { name: "Schemes", path: "/schemes", icon: "🏛️" },
    { name: "AI Search", path: "/search", icon: "🧠" },
    { name: "Nearby", path: "/nearby", icon: "📍" },
    { name: "Profile", path: "/profile", icon: "👤" },
  ];

  return (
    <div
      className="flex md:hidden"
      style={{
        position: "fixed",
        bottom: 0,
        left: "50%",
        transform: "translateX(-50%)",
        width: "100%",
        maxWidth: 480,
        height: 68,
        background: "rgba(255, 255, 255, 0.95)",
        backdropFilter: "blur(10px)",
        borderTop: "1px solid #e5e7eb",
        justifyContent: "space-around",
        alignItems: "center",
        zIndex: 990,
        boxShadow: "0 -4px 16px rgba(0, 0, 0, 0.04)",
        boxSizing: "border-box",
        paddingBottom: "env(safe-area-inset-bottom, 0px)"
      }}
    >
      {TABS.map((tab) => {
        const isActive = pathname === tab.path;
        return (
          <button
            key={tab.path}
            onClick={() => router.push(tab.path)}
            style={{
              background: "none",
              border: "none",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              gap: 4,
              flex: 1,
              height: "100%",
              color: isActive ? "#2563eb" : "#6b7280",
              transition: "color 0.2s"
            }}
          >
            <span
              style={{
                fontSize: 20,
                transform: isActive ? "scale(1.15)" : "scale(1)",
                transition: "transform 0.2s"
              }}
            >
              {tab.icon}
            </span>
            <span
              style={{
                fontSize: 10,
                fontWeight: isActive ? 700 : 500,
                letterSpacing: "0.2px"
              }}
            >
              {tab.name}
            </span>
          </button>
        );
      })}
    </div>
  );
}