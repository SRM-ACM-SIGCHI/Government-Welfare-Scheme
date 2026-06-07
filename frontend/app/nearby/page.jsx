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
    csc: "Common Service Centre (CSC)",
    tabFind: "Find Centers",
    tabAdd: "Add New Center",
    addSuccess: "Center added successfully!",
    addFailed: "Failed to add center. Try again.",
    fillGps: "Use Current GPS",
    centerName: "Center Name",
    centerType: "Center Type",
    address: "Address",
    state: "State",
    latitude: "Latitude",
    longitude: "Longitude",
    phoneNum: "Phone Number (Optional)",
    hoursVal: "Working Hours (e.g. 9:00 AM - 5:00 PM)",
    submitBtn: "Add Assistance Center"
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
    csc: "இ-சேவை மையம் (CSC)",
    tabFind: "மையங்களை தேடு",
    tabAdd: "புதிய மையம் சேர்",
    addSuccess: "மையம் வெற்றிகரமாக சேர்க்கப்பட்டது!",
    addFailed: "சேர்க்க முடியவில்லை. மீண்டும் முயற்சிக்கவும்.",
    fillGps: "இருப்பிடத்தை நிரப்பு",
    centerName: "மையத்தின் பெயர்",
    centerType: "மையத்தின் வகை",
    address: "முகவரி",
    state: "மாநிலம்",
    latitude: "அட்சரேகை (Latitude)",
    longitude: "தீர்க்கரேகை (Longitude)",
    phoneNum: "தொலைபேசி எண் (விருப்பத்தேர்வு)",
    hoursVal: "வேலை நேரம் (எ.கா. 9:00 AM - 5:00 PM)",
    submitBtn: "உதவி மையத்தை சேர்"
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
    csc: "सामान्य सेवा केंद्र (CSC)",
    tabFind: "केंद्र खोजें",
    tabAdd: "नया केंद्र जोड़ें",
    addSuccess: "केंद्र सफलतापूर्वक जोड़ा गया!",
    addFailed: "जोड़ने में विफल। पुनः प्रयास करें।",
    fillGps: "जीपीएस का उपयोग करें",
    centerName: "केंद्र का नाम",
    centerType: "केंद्र का प्रकार",
    address: "पता",
    state: "राज्य",
    latitude: "अक्षांश (Latitude)",
    longitude: "देशांतर (Longitude)",
    phoneNum: "फ़ोन नंबर (वैकल्पिक)",
    hoursVal: "कार्य समय (जैसे 9:00 AM - 5:00 PM)",
    submitBtn: "सहायता केंद्र जोड़ें"
  }
};

function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of Earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

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
  const [activeTab, setActiveTab] = useState("find"); // "find" or "add"
  const [language, setLanguage] = useState("en");
  const [loading, setLoading] = useState(false);
  const [centers, setCenters] = useState([]);
  const [statusMsg, setStatusMsg] = useState("");
  const [coords, setCoords] = useState(null);
  const [selectedState, setSelectedState] = useState("");

  // Add Center Form State
  const [formName, setFormName] = useState("");
  const [formType, setFormType] = useState("csc");
  const [formAddress, setFormAddress] = useState("");
  const [formState, setFormState] = useState("TN");
  const [formLat, setFormLat] = useState("");
  const [formLng, setFormLng] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formHours, setFormHours] = useState("");
  const [formMsg, setFormMsg] = useState({ text: "", type: "" }); // text, type: 'success' | 'error'

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
      
      let backendResults = data.results || [];
      
      // Load any locally added centers from localStorage to support client-side updates
      const localAddedRaw = localStorage.getItem("added_centers");
      if (localAddedRaw) {
        try {
          const localAdded = JSON.parse(localAddedRaw);
          // Map distance and push
          localAdded.forEach(c => {
            const dist = haversineDistance(lat, lng, c.latitude, c.longitude);
            backendResults.push({
              ...c,
              distance: roundToTwo(dist)
            });
          });
          
          // Remove duplicates (by name and location)
          backendResults = backendResults.filter((value, index, self) =>
            index === self.findIndex((t) => (
              t.name === value.name && t.latitude === value.latitude && t.longitude === value.longitude
            ))
          );
          
          // Sort by distance
          backendResults.sort((a, b) => a.distance - b.distance);
        } catch (e) {
          console.error("Failed parsing added centers:", e);
        }
      }

      setCenters(backendResults.slice(0, 5));
    } catch (err) {
      setStatusMsg("Failed to connect to location services. Using offline fallback.");
      // Offline fallback: use mock + local added centers
      calculateOfflineCenters(lat, lng);
    } finally {
      setLoading(false);
    }
  };

  const roundToTwo = (num) => Math.round((num + Number.EPSILON) * 100) / 100;

  const calculateOfflineCenters = (lat, lng) => {
    // We will simulate the offline calculation locally
    const fallbackMock = [
      { center_id: 1, name: "Chennai GPO (India Post)", type: "post_office", address: "Rajaji Salai, George Town, Chennai", state: "TN", latitude: 13.0899, longitude: 80.2872, phone_number: "044-25220031", working_hours: "9:00 AM - 6:00 PM" },
      { center_id: 2, name: "CSC E-Sevai Centre George Town", type: "csc", address: "No 12, Armenian St, Chennai", state: "TN", latitude: 13.0885, longitude: 80.2835, phone_number: "9876543210", working_hours: "10:00 AM - 5:00 PM" },
      { center_id: 3, name: "CSC E-Sevai Centre Nungambakkam", type: "csc", address: "Corporation Building, College Rd, Nungambakkam, Chennai", state: "TN", latitude: 13.0612, longitude: 80.2461, phone_number: "9876543211", working_hours: "10:00 AM - 5:00 PM" },
      { center_id: 4, name: "Mumbai GPO (India Post)", type: "post_office", address: "Chhatrapati Shivaji Maharaj Terminus Area, Fort, Mumbai", state: "MH", latitude: 18.9401, longitude: 72.8358, phone_number: "022-22621671", working_hours: "9:00 AM - 6:00 PM" },
      { center_id: 5, name: "CSC Digital Seva Centre Andheri", type: "csc", address: "Shop 4, J.P. Road, Andheri West, Mumbai", state: "MH", latitude: 19.1202, longitude: 72.8465, phone_number: "9876543212", working_hours: "10:00 AM - 6:00 PM" }
    ];

    let results = [];
    
    // Add mock
    fallbackMock.forEach(c => {
      results.push({ ...c, distance: roundToTwo(haversineDistance(lat, lng, c.latitude, c.longitude)) });
    });

    // Add local added
    const localAddedRaw = localStorage.getItem("added_centers");
    if (localAddedRaw) {
      try {
        const localAdded = JSON.parse(localAddedRaw);
        localAdded.forEach(c => {
          results.push({ ...c, distance: roundToTwo(haversineDistance(lat, lng, c.latitude, c.longitude)) });
        });
      } catch (e) {
        console.error(e);
      }
    }

    // Sort and limit
    results.sort((a, b) => a.distance - b.distance);
    setCenters(results.slice(0, 5));
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

    await fetchNearbyCenters(lat, lng);
  };

  // Auto-fill form coordinates using GPS
  const fillGPSInForm = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormLat(position.coords.latitude.toFixed(6));
        setFormLng(position.coords.longitude.toFixed(6));
      },
      (err) => {
        console.error("GPS fetch failed for form:", err);
      }
    );
  };

  // Submit new center
  const handleAddCenter = async (e) => {
    e.preventDefault();
    if (!formName.trim() || !formAddress.trim() || !formLat || !formLng) {
      setFormMsg({ text: "Please fill in all required fields.", type: "error" });
      return;
    }

    const payload = {
      name: formName,
      type: formType,
      address: formAddress,
      state: formState,
      latitude: parseFloat(formLat),
      longitude: parseFloat(formLng),
      phone_number: formPhone.trim() || null,
      working_hours: formHours.trim() || null
    };

    try {
      const res = await fetch(`${API_URL}/centers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      
      // Save locally in all cases to guarantee offline fallback and immediate client-side listing
      const localAddedRaw = localStorage.getItem("added_centers") || "[]";
      let localAdded = [];
      try {
        localAdded = JSON.parse(localAddedRaw);
      } catch (e) {}
      
      // Assign fake ID if offline
      payload.center_id = Date.now();
      localAdded.push(payload);
      localStorage.setItem("added_centers", JSON.stringify(localAdded));

      setFormMsg({ text: d.addSuccess, type: "success" });
      
      // Reset form fields
      setFormName("");
      setFormAddress("");
      setFormLat("");
      setFormLng("");
      setFormPhone("");
      setFormHours("");

      // Automatically switch back to Find Tab after 1.5s
      setTimeout(() => {
        setFormMsg({ text: "", type: "" });
        setActiveTab("find");
        // Trigger GPS match reload if coordinates are active
        if (coords) {
          fetchNearbyCenters(coords.latitude, coords.longitude);
        }
      }, 1500);

    } catch (err) {
      setFormMsg({ text: d.addFailed, type: "error" });
    }
  };

  return (
    <div style={{ minHeight: "100vh", maxWidth: 480, margin: "0 auto", background: "#f9fafb", fontFamily: "Inter, sans-serif", paddingBottom: 100 }}>
      {/* Header Banner */}
      <div style={{ background: "linear-gradient(135deg, #7c3aed 0%, #2563eb 100%)", padding: "24px 20px", color: "#fff" }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>📍 {d.title}</h1>
        <p style={{ fontSize: 13, color: "#e0e7ff", margin: "6px 0 0", lineHeight: 1.4 }}>{d.subtitle}</p>
      </div>

      {/* Tabs Selector */}
      <div style={{ display: "flex", background: "#fff", borderBottom: "1px solid #f3f4f6", padding: "0 10px" }}>
        <button
          onClick={() => { setActiveTab("find"); setFormMsg({ text: "", type: "" }); }}
          style={{
            flex: 1,
            padding: "16px 0",
            background: "none",
            border: "none",
            borderBottom: activeTab === "find" ? "3px solid #2563eb" : "3px solid transparent",
            color: activeTab === "find" ? "#2563eb" : "#6b7280",
            fontWeight: 600,
            fontSize: 14,
            cursor: "pointer",
            transition: "all 0.2s"
          }}
        >
          🔍 {d.tabFind}
        </button>
        <button
          onClick={() => { setActiveTab("add"); setStatusMsg(""); }}
          style={{
            flex: 1,
            padding: "16px 0",
            background: "none",
            border: "none",
            borderBottom: activeTab === "add" ? "3px solid #2563eb" : "3px solid transparent",
            color: activeTab === "add" ? "#2563eb" : "#6b7280",
            fontWeight: 600,
            fontSize: 14,
            cursor: "pointer",
            transition: "all 0.2s"
          }}
        >
          ➕ {d.tabAdd}
        </button>
      </div>

      {/* Tab 1: Find Centers Content */}
      {activeTab === "find" && (
        <>
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
        </>
      )}

      {/* Tab 2: Add Center Form */}
      {activeTab === "add" && (
        <div style={{ padding: "16px 16px 40px" }}>
          <form
            onSubmit={handleAddCenter}
            style={{
              background: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: 20,
              padding: 20,
              boxShadow: "0 10px 25px rgba(0,0,0,0.02)",
              display: "flex",
              flexDirection: "column",
              gap: 14
            }}
          >
            {formMsg.text && (
              <div
                style={{
                  background: formMsg.type === "success" ? "#f0fdf4" : "#fef2f2",
                  border: `1px solid ${formMsg.type === "success" ? "#bbf7d0" : "#fca5a5"}`,
                  borderRadius: 12,
                  padding: "12px 16px",
                  color: formMsg.type === "success" ? "#166534" : "#991b1b",
                  fontSize: 14,
                  fontWeight: 500
                }}
              >
                {formMsg.type === "success" ? "✅" : "⚠️"} {formMsg.text}
              </div>
            )}

            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>
                {d.centerName} *
              </label>
              <input
                type="text"
                required
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="e.g. George Town Sub Post Office"
                style={{ width: "100%", padding: "12px 16px", borderRadius: 12, border: "1px solid #e5e7eb", fontSize: 14, boxSizing: "border-box" }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>
                {d.centerType} *
              </label>
              <div style={{ display: "flex", gap: 10 }}>
                <button
                  type="button"
                  onClick={() => setFormType("csc")}
                  style={{
                    flex: 1,
                    padding: "12px 10px",
                    borderRadius: 12,
                    border: `1px solid ${formType === "csc" ? "#2563eb" : "#e5e7eb"}`,
                    background: formType === "csc" ? "#eff6ff" : "#fff",
                    color: formType === "csc" ? "#1d4ed8" : "#374151",
                    fontSize: 14,
                    fontWeight: 500,
                    cursor: "pointer"
                  }}
                >
                  💻 {d.csc}
                </button>
                <button
                  type="button"
                  onClick={() => setFormType("post_office")}
                  style={{
                    flex: 1,
                    padding: "12px 10px",
                    borderRadius: 12,
                    border: `1px solid ${formType === "post_office" ? "#2563eb" : "#e5e7eb"}`,
                    background: formType === "post_office" ? "#eff6ff" : "#fff",
                    color: formType === "post_office" ? "#1d4ed8" : "#374151",
                    fontSize: 14,
                    fontWeight: 500,
                    cursor: "pointer"
                  }}
                >
                  📮 {d.postOffice}
                </button>
              </div>
            </div>

            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>
                {d.address} *
              </label>
              <textarea
                required
                rows={2}
                value={formAddress}
                onChange={(e) => setFormAddress(e.target.value)}
                placeholder="Complete street address details..."
                style={{ width: "100%", padding: "12px 16px", borderRadius: 12, border: "1px solid #e5e7eb", fontSize: 14, boxSizing: "border-box", fontFamily: "inherit", resize: "none" }}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>
                  {d.state} *
                </label>
                <select
                  value={formState}
                  onChange={(e) => setFormState(e.target.value)}
                  style={{ width: "100%", padding: "12px 16px", borderRadius: 12, border: "1px solid #e5e7eb", fontSize: 14, background: "#fff", height: 45 }}
                >
                  {STATES.map(s => (
                    <option key={s.code} value={s.code}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div style={{ display: "flex", alignItems: "flex-end" }}>
                <button
                  type="button"
                  onClick={fillGPSInForm}
                  style={{
                    width: "100%",
                    height: 45,
                    background: "#f3f4f6",
                    border: "1px solid #e5e7eb",
                    borderRadius: 12,
                    fontSize: 13,
                    color: "#374151",
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6
                  }}
                >
                  🎯 {d.fillGps}
                </button>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>
                  {d.latitude} *
                </label>
                <input
                  type="number"
                  step="0.000001"
                  required
                  value={formLat}
                  onChange={(e) => setFormLat(e.target.value)}
                  placeholder="e.g. 13.0899"
                  style={{ width: "100%", padding: "12px 16px", borderRadius: 12, border: "1px solid #e5e7eb", fontSize: 14, boxSizing: "border-box" }}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>
                  {d.longitude} *
                </label>
                <input
                  type="number"
                  step="0.000001"
                  required
                  value={formLng}
                  onChange={(e) => setFormLng(e.target.value)}
                  placeholder="e.g. 80.2872"
                  style={{ width: "100%", padding: "12px 16px", borderRadius: 12, border: "1px solid #e5e7eb", fontSize: 14, boxSizing: "border-box" }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>
                {d.phoneNum}
              </label>
              <input
                type="text"
                value={formPhone}
                onChange={(e) => setFormPhone(e.target.value)}
                placeholder="e.g. 044-25220031"
                style={{ width: "100%", padding: "12px 16px", borderRadius: 12, border: "1px solid #e5e7eb", fontSize: 14, boxSizing: "border-box" }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>
                {d.hoursVal}
              </label>
              <input
                type="text"
                value={formHours}
                onChange={(e) => setFormHours(e.target.value)}
                placeholder="e.g. 9:00 AM - 5:00 PM"
                style={{ width: "100%", padding: "12px 16px", borderRadius: 12, border: "1px solid #e5e7eb", fontSize: 14, boxSizing: "border-box" }}
              />
            </div>

            <button
              type="submit"
              style={{
                background: "linear-gradient(135deg, #7c3aed 0%, #2563eb 100%)",
                color: "#fff",
                border: "none",
                borderRadius: 14,
                padding: "14px 20px",
                fontSize: 15,
                fontWeight: 600,
                cursor: "pointer",
                boxShadow: "0 8px 20px rgba(37,99,235,0.15)",
                marginTop: 8,
                transition: "transform 0.1s"
              }}
            >
              🚀 {d.submitBtn}
            </button>
          </form>
        </div>
      )}

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
