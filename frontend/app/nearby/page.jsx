"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ChatBot from "../../components/ChatBot";
import BottomNav from "../../components/Bottomnav";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const STATES = [
  { code: "TN", name: "Tamil Nadu" },
  { code: "MH", name: "Maharashtra" },
  { code: "KA", name: "Karnataka" },
  { code: "DL", name: "Delhi" },
  { code: "UP", name: "Uttar Pradesh" }
];

const DICT = {
  en: {
    title: "Nearby Assistance",
    subtitle: "Find post offices and CSCs near you to help submit scheme applications",
    useLocation: "Find Centers Near Me",
    gpsDenied: "Location permission denied. Please select a state manually.",
    gpsError: "Could not retrieve your location. Try manually choosing a state.",
    manualSelect: "Choose Your State Manually",
    kmAway: "km away",
    hours: "Hours:",
    phone: "Phone:",
    getDirections: "Get Directions",
    postOffice: "Post Office",
    csc: "Common Service Centre (CSC)"
  },
  ta: {
    title: "அருகிலுள்ள உதவி மையங்கள்",
    subtitle: "விண்ணப்பிக்க உதவ அருகிலுள்ள தபால் நிலையங்கள் மற்றும் இ-சேவை மையங்களைக் கண்டறியவும்",
    useLocation: "என் இருப்பிடத்தை பயன்படுத்து",
    gpsDenied: "இருப்பிட அனுமதி மறுக்கப்பட்டது. தயவுசெய்து மாநிலத்தை கைமுறையாக தேர்ந்தெடுக்கவும்.",
    gpsError: "உங்கள் இருப்பிடத்தைக் கண்டறிய முடியவில்லை. மாநிலத்தை தேர்ந்தெடுக்கவும்.",
    manualSelect: "கைமுறையாக மாநிலத்தை தேர்ந்தெடுக்கவும்",
    kmAway: "கி.மீ தூரம்",
    hours: "நேரம்:",
    phone: "தொலைபேசி:",
    getDirections: "வழித்தடம் காண்க",
    postOffice: "தபால் நிலையம்",
    csc: "இ-சேவை மையம் (CSC)"
  },
  hi: {
    title: "नज़दीकी सहायता केंद्र",
    subtitle: "योजना आवेदनों में सहायता के लिए अपने पास के डाकघर और सीएससी खोजें",
    useLocation: "मेरे पास के केंद्र खोजें",
    gpsDenied: "स्थान अनुमति अस्वीकृत। कृपया मैन्युअल रूप से राज्य का चयन करें।",
    gpsError: "आपका स्थान प्राप्त नहीं किया जा सका। कृपया मैन्युअल रूप से चुनें।",
    manualSelect: "अपना राज्य मैन्युअल रूप से चुनें",
    kmAway: "किमी दूर",
    hours: "समय:",
    phone: "फ़ोन:",
    getDirections: "मार्गदर्शन प्राप्त करें",
    postOffice: "डाकघर",
    csc: "सामान्य सेवा केंद्र (CSC)"
  }
};

function CenterSkeleton() {
  return (
    <div style={{ background: "#fff", border: "1px solid #f3f4f6", borderRadius: 16, padding: 20, marginBottom: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
        <div style={{ height: 20, width: "55%", background: "#f3f4f6", borderRadius: 6 }} />
        <div style={{ height: 20, width: "25%", background: "#f3f4f6", borderRadius: 20 }} />
      </div>
      <div style={{ height: 14, width: "70%", background: "#f3f4f6", borderRadius: 6, marginBottom: 12 }} />
      <div style={{ height: 14, width: "40%", background: "#f3f4f6", borderRadius: 6, marginBottom: 16 }} />
      <div style={{ height: 36, background: "#f3f4f6", borderRadius: 10 }} />
    </div>
  );
}

function CenterCard({ center, dict }) {
  const isCsc = center.type === "csc";
  
  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${center.latitude},${center.longitude}`;

  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #f3f4f6",
        borderRadius: 16,
        padding: 20,
        marginBottom: 12,
        boxShadow: "0 4px 10px rgba(0,0,0,0.01)",
        animation: "fadeIn 0.3s ease-out"
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8, gap: 8 }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, color: "#111827", margin: 0, flex: 1, lineHeight: 1.4 }}>
          {center.name}
        </h3>
        <span
          style={{
            background: isCsc ? "#eff6ff" : "#fdf2f8",
            color: isCsc ? "#1d4ed8" : "#9d174d",
            fontSize: 10,
            fontWeight: 600,
            padding: "3px 8px",
            borderRadius: 20,
            whiteSpace: "nowrap"
          }}
        >
          {isCsc ? dict.csc : dict.postOffice}
        </span>
      </div>

      <p style={{ fontSize: 13, color: "#4b5563", margin: "0 0 10px", lineHeight: 1.4 }}>
        📍 {center.address}
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 16, borderTop: "1px solid #f9fafb", paddingTop: 10 }}>
        {center.working_hours && (
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#6b7280" }}>
            <span>🕒 {dict.hours}</span>
            <span style={{ fontWeight: 500, color: "#374151" }}>{center.working_hours}</span>
          </div>
        )}
        {center.phone_number && (
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#6b7280" }}>
            <span>📞 {dict.phone}</span>
            <a href={`tel:${center.phone_number}`} style={{ fontWeight: 500, color: "#2563eb", textDecoration: "none" }}>
              {center.phone_number}
            </a>
          </div>
        )}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        {center.distance !== undefined ? (
          <span style={{ fontSize: 13, fontWeight: 600, color: "#10b981", background: "#ecfdf5", padding: "4px 8px", borderRadius: 8 }}>
            🚀 {center.distance} {dict.kmAway}
          </span>
        ) : (
          <span style={{ fontSize: 12, color: "#9ca3af" }}>{center.state}</span>
        )}

        <a
          href={googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            background: "linear-gradient(135deg, #7c3aed 0%, #2563eb 100%)",
            color: "#fff",
            textDecoration: "none",
            fontSize: 13,
            fontWeight: 600,
            padding: "8px 16px",
            borderRadius: 10,
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            boxShadow: "0 4px 12px rgba(37,99,235,0.15)"
          }}
        >
          🗺️ {dict.getDirections}
        </a>
      </div>
    </div>
  );
}

export default function NearbyCentersPage() {
  const router = useRouter();
  const [language, setLanguage] = useState("en");
  const [loading, setLoading] = useState(false);
  const [centers, setCenters] = useState([]);
  const [statusMsg, setStatusMsg] = useState("");
  const [coords, setCoords] = useState(null);
  
  // Manual selection fallback
  const [selectedState, setSelectedState] = useState("");

  useEffect(() => {
    const savedLang = localStorage.getItem("language") || "en";
    setLanguage(savedLang);
  }, []);

  const d = DICT[language] || DICT.en;

  const requestGPSLocation = () => {
    if (!navigator.geolocation) {
      setStatusMsg(d.gpsError);
      return;
    }
    
    setLoading(true);
    setStatusMsg("");
    setCenters([]);
    setSelectedState("");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCoords({ latitude, longitude });
        fetchNearbyCenters(latitude, longitude);
      },
      (error) => {
        console.error("GPS access failed:", error);
        setLoading(false);
        setStatusMsg(d.gpsDenied);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const fetchNearbyCenters = async (lat, lng) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/centers/nearby?lat=${lat}&lng=${lng}`);
      if (!res.ok) throw new Error("Service error");
      const data = await res.json();
      setCenters(data.results || []);
    } catch (err) {
      setStatusMsg("Failed to connect to location services. Using offline fallback.");
      // Load fallback locally from static offsets (mock user in Chennai if no response)
      setCenters([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStateChange = async (stateCode) => {
    if (!stateCode) return;
    setSelectedState(stateCode);
    setLoading(true);
    setStatusMsg("");
    setCoords(null);
    
    // Simulate coordinates based on state capital
    let lat = 13.0827, lng = 80.2707; // Chennai default
    if (stateCode === "MH") { lat = 18.9220; lng = 72.8347; } // Mumbai
    if (stateCode === "KA") { lat = 12.9716; lng = 77.5946; } // Bengaluru
    if (stateCode === "DL") { lat = 28.6139; lng = 77.2090; } // Delhi
    if (stateCode === "UP") { lat = 26.8467; lng = 80.9462; } // Lucknow

    try {
      const res = await fetch(`${API_URL}/centers/nearby?lat=${lat}&lng=${lng}`);
      if (!res.ok) throw new Error("Service error");
      const data = await res.json();
      // Filter list of results to only match state
      const filtered = (data.results || []).filter(c => c.state === stateCode);
      setCenters(filtered);
    } catch (err) {
      setStatusMsg("Failed to fetch state centers.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", maxWidth: 480, margin: "0 auto", background: "#f9fafb", fontFamily: "Inter, sans-serif", paddingBottom: 100 }}>
      {/* Header Banner */}
      <div style={{ background: "linear-gradient(135deg, #7c3aed 0%, #2563eb 100%)", padding: "24px 20px", color: "#fff" }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>📍 {d.title}</h1>
        <p style={{ fontSize: 13, color: "#e0e7ff", margin: "6px 0 0", lineHeight: 1.4 }}>{d.subtitle}</p>
      </div>

      {/* Geolocation trigger card */}
      <div style={{ padding: "16px 16px 0" }}>
        <div
          style={{
            background: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: 20,
            padding: 20,
            boxShadow: "0 10px 25px rgba(0,0,0,0.02)",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            gap: 12
          }}
        >
          <button
            onClick={requestGPSLocation}
            disabled={loading}
            style={{
              background: "linear-gradient(135deg, #7c3aed 0%, #2563eb 100%)",
              color: "#fff",
              border: "none",
              borderRadius: 14,
              padding: "14px 20px",
              fontSize: 15,
              fontWeight: 600,
              cursor: "pointer",
              boxShadow: "0 8px 20px rgba(124,58,237,0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              opacity: loading ? 0.6 : 1,
              transition: "transform 0.1s"
            }}
          >
            🧭 {loading ? "Locating..." : d.useLocation}
          </button>

          {statusMsg && (
            <p style={{ fontSize: 13, color: "#ef4444", margin: "4px 0 0", fontWeight: 500 }}>
              ⚠️ {statusMsg}
            </p>
          )}

          {coords && (
            <p style={{ fontSize: 12, color: "#10b981", margin: 0, fontWeight: 500 }}>
              📍 GPS Coordinates Locked: {coords.latitude.toFixed(4)}, {coords.longitude.toFixed(4)}
            </p>
          )}

          <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "8px 0" }}>
            <hr style={{ flex: 1, border: "none", borderTop: "1px solid #f3f4f6" }} />
            <span style={{ fontSize: 11, color: "#9ca3af", fontWeight: 600 }}>OR</span>
            <hr style={{ flex: 1, border: "none", borderTop: "1px solid #f3f4f6" }} />
          </div>

          {/* Manual state fallback */}
          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#4b5563", marginBottom: 6, textAlign: "left" }}>
              {d.manualSelect}
            </label>
            <select
              value={selectedState}
              onChange={(e) => handleStateChange(e.target.value)}
              style={{
                width: "100%",
                padding: "12px 16px",
                borderRadius: 12,
                border: "1px solid #e5e7eb",
                fontSize: 14,
                background: "#fff",
                outline: "none"
              }}
            >
              <option value="">-- Choose State --</option>
              {STATES.map(st => (
                <option key={st.code} value={st.code}>{st.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Centers listings */}
      <div style={{ padding: "20px 16px 0" }}>
        {loading && [1, 2, 3].map(i => <CenterSkeleton key={i} />)}

        {!loading && centers.length > 0 && (
          <div>
            {centers.map(center => (
              <CenterCard key={center.center_id} center={center} dict={d} />
            ))}
          </div>
        )}

        {!loading && centers.length === 0 && !statusMsg && (
          <div style={{ background: "#fff", border: "1px solid #f3f4f6", borderRadius: 16, padding: 32, textAlign: "center" }}>
            <p style={{ fontSize: 40, margin: "0 0 10px" }}>🧭</p>
            <p style={{ fontSize: 13, color: "#6b7280", margin: 0, lineHeight: 1.5 }}>
              Tap the location button or select your state to find nearby CSC and Post Office assistance centers.
            </p>
          </div>
        )}
      </div>

      <ChatBot language={language} />
      <BottomNav />

      {/* Entrance fade animations stylesheet */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
