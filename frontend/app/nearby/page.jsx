"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import AppLayout from "../../components/AppLayout";
import ChatBot from "../../components/ChatBot";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// Dynamically import Leaflet MapComponent with SSR disabled to prevent Next.js window compilation errors
const MapComponent = dynamic(() => import("../../components/MapComponent"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[450px] bg-slate-100 rounded-3xl flex items-center justify-center text-slate-400 font-extrabold border border-slate-200 shadow-inner select-none">
      ⚡ Loading Interactive Map...
    </div>
  ),
});

const STATES = [
  { code: "TN", name: "Tamil Nadu" },
  { code: "MH", name: "Maharashtra" },
  { code: "KA", name: "Karnataka" },
  { code: "DL", name: "Delhi" },
  { code: "UP", name: "Uttar Pradesh" }
];

const DICT = {
  en: {
    title: "Nearby Assistance Centers",
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
    gpsError: "स्थान प्राप्त नहीं किया जा सका। कृपया मैन्युअल रूप से चुनें।",
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
    <div className="bg-white border border-slate-100 rounded-3xl p-5 mb-3.5 animate-pulse shadow-sm">
      <div className="flex justify-between items-start mb-3">
        <div className="h-5 w-3/5 bg-slate-100 rounded-md" />
        <div className="h-5 w-1/4 bg-slate-100 rounded-full" />
      </div>
      <div className="h-3 w-11/12 bg-slate-100 rounded-md mb-3" />
      <div className="h-3 w-2/5 bg-slate-100 rounded-md mb-4" />
      <div className="h-9 bg-slate-100 rounded-2xl w-full" />
    </div>
  );
}

function CenterCard({ center, dict, isActive, onSelect }) {
  const isCsc = center.type === "csc";
  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${center.latitude},${center.longitude}`;

  return (
    <div
      onClick={onSelect}
      className={`bg-white border rounded-3xl p-5 mb-3.5 cursor-pointer shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 select-none ${
        isActive ? "border-indigo-600 ring-2 ring-indigo-50" : "border-slate-200"
      }`}
    >
      <div className="flex justify-between items-start mb-2.5 gap-3">
        <h3 className="text-sm font-bold text-slate-900 leading-snug flex-1">
          {center.name}
        </h3>
        <span
          className={`text-[9px] font-extrabold px-2.5 py-0.5 rounded-full border whitespace-nowrap uppercase tracking-wider ${
            isCsc ? "bg-blue-50/70 text-blue-700 border-blue-100" : "bg-pink-50/70 text-pink-700 border-pink-100"
          }`}
        >
          {isCsc ? dict.csc : dict.postOffice}
        </span>
      </div>

      <p className="text-xs text-slate-500 mb-3.5 leading-relaxed">
        📍 {center.address}
      </p>

      <div className="flex flex-col gap-2 mb-4 border-t border-slate-50 pt-3.5">
        {center.working_hours && (
          <div className="flex justify-between text-[11px] text-slate-400 font-semibold">
            <span>🕒 {dict.hours}</span>
            <span className="font-bold text-slate-700">{center.working_hours}</span>
          </div>
        )}
        {center.phone_number && (
          <div className="flex justify-between text-[11px] text-slate-400 font-semibold">
            <span>📞 {dict.phone}</span>
            <a href={`tel:${center.phone_number}`} className="font-bold text-indigo-600 hover:text-indigo-900 no-underline transition-colors" onClick={e => e.stopPropagation()}>
              {center.phone_number}
            </a>
          </div>
        )}
      </div>

      <div className="flex justify-between items-center">
        {center.distance !== undefined ? (
          <span className="text-[11px] font-extrabold text-emerald-700 bg-emerald-50/80 px-2.5 py-1 rounded-md border border-emerald-100/40">
            🚀 {center.distance} {dict.kmAway}
          </span>
        ) : (
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{center.state}</span>
        )}

        <a
          href={googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={e => e.stopPropagation()}
          className="bg-indigo-900 hover:bg-indigo-800 text-white no-underline text-xs font-bold px-4 py-2.5 rounded-2xl inline-flex items-center gap-1.5 transition-transform duration-100 active:scale-95 shadow-sm"
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
  const [selectedCenterId, setSelectedCenterId] = useState(null);

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
    setSelectedCenterId(null);

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
      
      const localAddedRaw = localStorage.getItem("added_centers");
      if (localAddedRaw) {
        try {
          const localAdded = JSON.parse(localAddedRaw);
          localAdded.forEach(c => {
            const dist = haversineDistance(lat, lng, c.latitude, c.longitude);
            backendResults.push({
              ...c,
              distance: roundToTwo(dist)
            });
          });
          
          backendResults = backendResults.filter((value, index, self) =>
            index === self.findIndex((t) => (
              t.name === value.name && t.latitude === value.latitude && t.longitude === value.longitude
            ))
          );
          
          backendResults.sort((a, b) => a.distance - b.distance);
        } catch (e) {
          console.error("Failed parsing added centers:", e);
        }
      }

      setCenters(backendResults.slice(0, 5));
    } catch (err) {
      setStatusMsg("Failed to connect to online location services. Using offline fallback.");
      calculateOfflineCenters(lat, lng);
    } finally {
      setLoading(false);
    }
  };

  const roundToTwo = (num) => Math.round((num + Number.EPSILON) * 100) / 100;

  const calculateOfflineCenters = (lat, lng) => {
    const fallbackMock = [
      { center_id: 1, name: "Chennai GPO (India Post)", type: "post_office", address: "Rajaji Salai, George Town, Chennai", state: "TN", latitude: 13.0899, longitude: 80.2872, phone_number: "044-25220031", working_hours: "9:00 AM - 6:00 PM" },
      { center_id: 2, name: "CSC E-Sevai Centre George Town", type: "csc", address: "No 12, Armenian St, Chennai", state: "TN", latitude: 13.0885, longitude: 80.2835, phone_number: "9876543210", working_hours: "10:00 AM - 5:00 PM" },
      { center_id: 3, name: "CSC E-Sevai Centre Nungambakkam", type: "csc", address: "Corporation Building, College Rd, Nungambakkam, Chennai", state: "TN", latitude: 13.0612, longitude: 80.2461, phone_number: "9876543211", working_hours: "10:00 AM - 5:00 PM" },
      { center_id: 4, name: "Mumbai GPO (India Post)", type: "post_office", address: "Chhatrapati Shivaji Maharaj Terminus Area, Fort, Mumbai", state: "MH", latitude: 18.9401, longitude: 72.8358, phone_number: "022-22621671", working_hours: "9:00 AM - 6:00 PM" },
      { center_id: 5, name: "CSC Digital Seva Centre Andheri", type: "csc", address: "Shop 4, J.P. Road, Andheri West, Mumbai", state: "MH", latitude: 19.1202, longitude: 72.8465, phone_number: "9876543212", working_hours: "10:00 AM - 6:00 PM" }
    ];

    let results = [];
    
    fallbackMock.forEach(c => {
      results.push({ ...c, distance: roundToTwo(haversineDistance(lat, lng, c.latitude, c.longitude)) });
    });

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

    results.sort((a, b) => a.distance - b.distance);
    setCenters(results.slice(0, 5));
  };

  const handleStateChange = async (stateCode) => {
    if (!stateCode) return;
    setSelectedState(stateCode);
    setLoading(true);
    setStatusMsg("");
    setCoords(null);
    setSelectedCenterId(null);
    
    let lat = 13.0827, lng = 80.2707; 
    if (stateCode === "MH") { lat = 18.9220; lng = 72.8347; } 
    if (stateCode === "KA") { lat = 12.9716; lng = 77.5946; } 
    if (stateCode === "DL") { lat = 28.6139; lng = 77.2090; } 
    if (stateCode === "UP") { lat = 26.8467; lng = 80.9462; } 

    await fetchNearbyCenters(lat, lng);
  };

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
      
      // Save locally in all cases to guarantee offline fallback and immediate client-side listing
      const localAddedRaw = localStorage.getItem("added_centers") || "[]";
      let localAdded = [];
      try {
        localAdded = JSON.parse(localAddedRaw);
      } catch (e) {}
      
      payload.center_id = Date.now();
      localAdded.push(payload);
      localStorage.setItem("added_centers", JSON.stringify(localAdded));

      setFormMsg({ text: d.addSuccess, type: "success" });
      
      setFormName("");
      setFormAddress("");
      setFormLat("");
      setFormLng("");
      setFormPhone("");
      setFormHours("");

      setTimeout(() => {
        setFormMsg({ text: "", type: "" });
        setActiveTab("find");
        if (coords) {
          fetchNearbyCenters(coords.latitude, coords.longitude);
        } else {
          // reload state capital list if active
          handleStateChange(selectedState || "TN");
        }
      }, 1500);

    } catch (err) {
      setFormMsg({ text: d.addFailed, type: "error" });
    }
  };

  // Determine center coordinates of Leaflet map container
  const mapCenterLat = coords ? coords.latitude : (centers.length > 0 ? centers[0].latitude : 13.0827);
  const mapCenterLng = coords ? coords.longitude : (centers.length > 0 ? centers[0].longitude : 80.2707);

  const previewCenter = (formLat && formLng) ? {
    center_id: "preview",
    name: formName || "New Center Location",
    type: formType,
    latitude: parseFloat(formLat),
    longitude: parseFloat(formLng),
    address: formAddress || "Preview Location Address",
    state: formState
  } : null;

  return (
    <AppLayout activeTab="/nearby">
      <div className="w-full max-w-md mx-auto md:max-w-none md:mx-0 h-full flex flex-col md:flex-row gap-6 md:h-[calc(100vh-4rem)] box-border">
        
        {/* Left Column: Form and Centers list */}
        <div className="flex-1 flex flex-col min-w-0 bg-slate-50 md:bg-white md:border md:border-slate-200 md:rounded-3xl md:shadow-sm overflow-hidden h-full">
          
          {/* Banner */}
          <div className="bg-gradient-to-br from-indigo-900 to-blue-900 px-6 py-5 text-white flex-shrink-0 md:rounded-t-3xl shadow-sm">
            <h1 className="text-base font-extrabold m-0 flex items-center gap-2">📍 {d.title}</h1>
            <p className="text-[11px] text-indigo-200/90 mt-1.5 m-0 leading-relaxed font-semibold">{d.subtitle}</p>
          </div>

          {/* Tabs Selector */}
          <div className="flex bg-white border-b border-slate-100 px-3 flex-shrink-0 select-none">
            <button
              onClick={() => { setActiveTab("find"); setFormMsg({ text: "", type: "" }); }}
              className={`flex-1 py-4 bg-transparent border-0 border-b-2 font-bold text-xs transition-all duration-200 cursor-pointer ${
                activeTab === "find" 
                  ? "border-indigo-600 text-indigo-900" 
                  : "border-transparent text-slate-400 hover:text-slate-900"
              }`}
            >
              🔍 {d.tabFind}
            </button>
            <button
              onClick={() => { setActiveTab("add"); setStatusMsg(""); }}
              className={`flex-1 py-4 bg-transparent border-0 border-b-2 font-bold text-xs transition-all duration-200 cursor-pointer ${
                activeTab === "add" 
                  ? "border-indigo-600 text-indigo-900" 
                  : "border-transparent text-slate-400 hover:text-slate-900"
              }`}
            >
              ➕ {d.tabAdd}
            </button>
          </div>

          {/* Form Content Scroll Box */}
          <div className="flex-1 overflow-y-auto px-5 pb-24 md:pb-6 pt-4.5 custom-scrollbar bg-slate-50/30">
            
            {/* Tab 1: Find Centers */}
            {activeTab === "find" && (
              <div className="space-y-4 animate-[fadeIn_0.2s_ease-out]">
                
                {/* Geolocation Lock box */}
                <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-sm space-y-4">
                  <button
                    onClick={requestGPSLocation}
                    disabled={loading}
                    className="w-full bg-indigo-900 hover:bg-indigo-800 text-white border-none rounded-2xl py-3 text-xs font-bold cursor-pointer transition-all duration-200 active:scale-98 shadow-sm disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    🧭 {loading ? "Locating..." : d.useLocation}
                  </button>

                  {statusMsg && (
                    <p className="text-xs font-bold text-red-600 text-center m-0 leading-normal">
                      ⚠️ {statusMsg}
                    </p>
                  )}

                  {coords && (
                    <p className="text-xs text-emerald-600 font-bold text-center m-0">
                      ✅ GPS Connected: {coords.latitude.toFixed(4)}, {coords.longitude.toFixed(4)}
                    </p>
                  )}

                  <div className="flex items-center gap-3 py-1 select-none">
                    <hr className="flex-1 border-0 border-t border-slate-100" />
                    <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-widest">OR</span>
                    <hr className="flex-1 border-0 border-t border-slate-100" />
                  </div>

                  {/* State Select Fallback */}
                  <div className="space-y-2">
                    <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                      {d.manualSelect}
                    </label>
                    <select
                      value={selectedState}
                      onChange={(e) => handleStateChange(e.target.value)}
                      className="w-full py-3 px-4 rounded-2xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white outline-none focus:border-indigo-600 cursor-pointer"
                    >
                      <option value="">-- Choose State --</option>
                      {STATES.map(st => (
                        <option key={st.code} value={st.code}>{st.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Mobile Leaflet Map View: Renders interactively under coordinates picker */}
                <div className="md:hidden w-full h-64 flex-shrink-0 rounded-3xl overflow-hidden border border-slate-200/80 shadow-sm relative z-10">
                  <MapComponent 
                    centers={centers}
                    userCoords={coords}
                    centerLat={mapCenterLat}
                    centerLng={mapCenterLng}
                    selectedCenterId={selectedCenterId}
                    onSelectCenter={(center) => setSelectedCenterId(center.center_id)}
                    previewCenter={previewCenter}
                  />
                </div>

                {/* Centers Listings */}
                <div className="space-y-3 pt-1">
                  {loading && [1, 2, 3].map(i => <CenterSkeleton key={i} />)}

                  {!loading && centers.length > 0 && (
                    <div className="space-y-3">
                      {centers.map(center => (
                        <CenterCard 
                          key={center.center_id} 
                          center={center} 
                          dict={d} 
                          isActive={selectedCenterId === center.center_id}
                          onSelect={() => setSelectedCenterId(center.center_id)}
                        />
                      ))}
                    </div>
                  )}

                  {!loading && centers.length === 0 && !statusMsg && (
                    <div className="bg-white border border-slate-200 rounded-3xl p-8 text-center shadow-sm select-none">
                      <p className="text-4xl m-0 mb-3">🧭</p>
                      <p className="text-xs text-slate-400 leading-relaxed font-semibold m-0 max-w-[240px] mx-auto">
                        Connect your GPS coordinates or select a manual state fallback to discover nearby Post Offices and Common Service Centres.
                      </p>
                    </div>
                  )}
                </div>

              </div>
            )}

            {/* Tab 2: Add Center Form */}
            {activeTab === "add" && (
              <form onSubmit={handleAddCenter} className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-sm space-y-4 animate-[fadeIn_0.2s_ease-out]">
                
                {formMsg.text && (
                  <div className={`border rounded-2xl p-4 text-xs font-bold flex items-center gap-2 ${
                    formMsg.type === "success" 
                      ? "bg-emerald-50 text-emerald-800 border-emerald-100" 
                      : "bg-red-50 text-red-800 border-red-100"
                  }`}>
                    <span>{formMsg.type === "success" ? "✅" : "⚠️"}</span>
                    <span>{formMsg.text}</span>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                    {d.centerName} *
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. George Town Sub Post Office"
                    className="w-full py-3 px-4 rounded-2xl border border-slate-200 text-xs font-semibold text-slate-700 outline-none focus:border-indigo-600 box-border shadow-sm placeholder-slate-400"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                    {d.centerType} *
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setFormType("csc")}
                      className={`flex-1 py-3 rounded-2xl border font-bold text-xs cursor-pointer transition-colors active:scale-[0.99] ${
                        formType === "csc" 
                          ? "border-indigo-900 bg-indigo-50/50 text-indigo-900" 
                          : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                      }`}
                    >
                      💻 {d.csc}
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormType("post_office")}
                      className={`flex-1 py-3 rounded-2xl border font-bold text-xs cursor-pointer transition-colors active:scale-[0.99] ${
                        formType === "post_office" 
                          ? "border-indigo-900 bg-indigo-50/50 text-indigo-900" 
                          : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                      }`}
                    >
                      📮 {d.postOffice}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                    {d.address} *
                  </label>
                  <textarea
                    required
                    rows={2}
                    value={formAddress}
                    onChange={(e) => setFormAddress(e.target.value)}
                    placeholder="Complete street address details..."
                    className="w-full py-3 px-4 rounded-2xl border border-slate-200 text-xs font-semibold text-slate-700 outline-none resize-none box-border focus:border-indigo-600 font-sans leading-relaxed shadow-sm placeholder-slate-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3.5">
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                      {d.state} *
                    </label>
                    <select
                      value={formState}
                      onChange={(e) => setFormState(e.target.value)}
                      className="w-full py-3 px-3 rounded-2xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white outline-none focus:border-indigo-600 h-[45px] cursor-pointer"
                    >
                      {STATES.map(s => (
                        <option key={s.code} value={s.code}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={fillGPSInForm}
                      className="w-full h-[45px] bg-slate-100 border border-slate-200 rounded-2xl text-[10px] text-slate-700 font-extrabold cursor-pointer transition-colors hover:bg-slate-200 flex items-center justify-center gap-1.5 active:scale-98 uppercase tracking-wider"
                    >
                      🎯 {d.fillGps}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3.5">
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                      {d.latitude} *
                    </label>
                    <input
                      type="number"
                      step="0.000001"
                      required
                      value={formLat}
                      onChange={(e) => setFormLat(e.target.value)}
                      placeholder="e.g. 13.0899"
                      className="w-full py-3 px-4 rounded-2xl border border-slate-200 text-xs font-semibold text-slate-700 outline-none box-border focus:border-indigo-600 shadow-sm placeholder-slate-400"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                      {d.longitude} *
                    </label>
                    <input
                      type="number"
                      step="0.000001"
                      required
                      value={formLng}
                      onChange={(e) => setFormLng(e.target.value)}
                      placeholder="e.g. 80.2872"
                      className="w-full py-3 px-4 rounded-2xl border border-slate-200 text-xs font-semibold text-slate-700 outline-none box-border focus:border-indigo-600 shadow-sm placeholder-slate-400"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                    {d.phoneNum}
                  </label>
                  <input
                    type="text"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="e.g. 044-25220031"
                    className="w-full py-3 px-4 rounded-2xl border border-slate-200 text-xs font-semibold text-slate-700 outline-none box-border focus:border-indigo-600 shadow-sm placeholder-slate-400"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                    {d.hoursVal}
                  </label>
                  <input
                    type="text"
                    value={formHours}
                    onChange={(e) => setFormHours(e.target.value)}
                    placeholder="e.g. 9:00 AM - 5:00 PM"
                    className="w-full py-3 px-4 rounded-2xl border border-slate-200 text-xs font-semibold text-slate-700 outline-none box-border focus:border-indigo-600 shadow-sm placeholder-slate-400"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white border-0 rounded-2xl py-3.5 text-xs font-bold cursor-pointer transition-transform duration-100 active:scale-[0.99] shadow-sm"
                >
                  🚀 {d.submitBtn}
                </button>
              </form>
            )}

          </div>
        </div>

        {/* Right Column: Desktop Leaflet Map Pane */}
        <div className="hidden md:flex flex-1 bg-white border border-slate-200 rounded-3xl shadow-sm p-4 overflow-hidden h-full relative">
          <MapComponent 
            centers={centers}
            userCoords={coords}
            centerLat={mapCenterLat}
            centerLng={mapCenterLng}
            selectedCenterId={selectedCenterId}
            onSelectCenter={(center) => setSelectedCenterId(center.center_id)}
            previewCenter={previewCenter}
          />
        </div>
      </div>
      
      <div className="md:hidden">
        <ChatBot language={language} />
      </div>
    </AppLayout>
  );
}
