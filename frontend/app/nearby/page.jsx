"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AppLayout from "../../components/AppLayout";
import ChatBot from "../../components/ChatBot";

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
    <div className="bg-white border border-gray-100 rounded-2xl p-5 mb-3 animate-pulse">
      <div className="flex justify-between mb-3">
        <div className="h-5 w-3/5 bg-gray-100 rounded-md" />
        <div className="h-5 w-1/4 bg-gray-100 rounded-full" />
      </div>
      <div className="h-3.5 w-11/12 bg-gray-100 rounded-md mb-3" />
      <div className="h-3.5 w-2/5 bg-gray-100 rounded-md mb-4" />
      <div className="h-9 bg-gray-100 rounded-lg" />
    </div>
  );
}

function CenterCard({ center, dict, isActive, onSelect }) {
  const isCsc = center.type === "csc";
  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${center.latitude},${center.longitude}`;

  return (
    <div
      onClick={onSelect}
      className={`bg-white border rounded-2xl p-5 mb-3 cursor-pointer shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 ${
        isActive ? "border-blue-600 ring-2 ring-blue-50" : "border-gray-100"
      }`}
    >
      <div className="flex justify-between items-start mb-2 gap-2">
        <h3 className="text-[15px] font-semibold text-gray-900 leading-snug flex-1">
          {center.name}
        </h3>
        <span
          className={`text-[9px] font-bold px-2.5 py-0.5 rounded-full whitespace-nowrap ${
            isCsc ? "bg-blue-50 text-blue-700" : "bg-pink-50 text-pink-700"
          }`}
        >
          {isCsc ? dict.csc : dict.postOffice}
        </span>
      </div>

      <p className="text-xs text-gray-600 mb-2.5 leading-relaxed">
        📍 {center.address}
      </p>

      <div className="flex flex-col gap-1.5 mb-4 border-t border-gray-50 pt-2.5">
        {center.working_hours && (
          <div className="flex justify-between text-[11px] text-gray-500">
            <span>🕒 {dict.hours}</span>
            <span className="font-medium text-gray-700">{center.working_hours}</span>
          </div>
        )}
        {center.phone_number && (
          <div className="flex justify-between text-[11px] text-gray-500">
            <span>📞 {dict.phone}</span>
            <a href={`tel:${center.phone_number}`} className="font-medium text-blue-600 no-underline" onClick={e => e.stopPropagation()}>
              {center.phone_number}
            </a>
          </div>
        )}
      </div>

      <div className="flex justify-between items-center">
        {center.distance !== undefined ? (
          <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md">
            🚀 {center.distance} {dict.kmAway}
          </span>
        ) : (
          <span className="text-[11px] text-gray-400">{center.state}</span>
        )}

        <a
          href={googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={e => e.stopPropagation()}
          className="bg-blue-900 text-white no-underline text-xs font-bold px-4 py-2 rounded-xl inline-flex items-center gap-1.5 transition-transform duration-100 active:scale-95 shadow-sm"
        >
          🗺️ {dict.getDirections}
        </a>
      </div>
    </div>
  );
}

function MockMap({ centers, userCoords, centerLat, centerLng, selectedCenterId, onSelectCenter, previewCenter }) {
  let range = 0.08; 
  const activeCenters = previewCenter ? [...centers, previewCenter] : centers;
  
  if (activeCenters.length > 0) {
    let maxDelta = 0.01;
    activeCenters.forEach(c => {
      const dLat = Math.abs(c.latitude - centerLat);
      const dLng = Math.abs(c.longitude - centerLng);
      if (dLat > maxDelta) maxDelta = dLat;
      if (dLng > maxDelta) maxDelta = dLng;
    });
    range = Math.max(0.04, maxDelta * 2.2);
  }

  const getSvgCoords = (lat, lng) => {
    const pctX = 50 + ((lng - centerLng) / range) * 50;
    const pctY = 50 - ((lat - centerLat) / range) * 50;
    return { x: pctX, y: pctY };
  };

  const [hoveredCenter, setHoveredCenter] = useState(null);

  return (
    <div className="relative w-full h-full bg-slate-50 rounded-3xl overflow-hidden shadow-inner border border-gray-200/80 min-h-[450px]">
      
      {/* SVG Canvas */}
      <svg className="w-full h-full" viewBox="0 0 400 400" preserveAspectRatio="none">
        
        {/* Background Grid Patterns */}
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e2e8f0" strokeWidth="1" />
          </pattern>
          <pattern id="dotGrid" width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1" fill="#cbd5e1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dotGrid)" />
        <rect width="100%" height="100%" fill="url(#grid)" opacity="0.4" />

        {/* Concentric Range Rings */}
        <circle cx="200" cy="200" r="55" fill="none" stroke="#3b82f6" strokeWidth="1" strokeDasharray="3,4" opacity="0.25" />
        <circle cx="200" cy="200" r="110" fill="none" stroke="#3b82f6" strokeWidth="1" strokeDasharray="3,4" opacity="0.2" />
        <circle cx="200" cy="200" r="165" fill="none" stroke="#3b82f6" strokeWidth="1" strokeDasharray="3,4" opacity="0.15" />

        {/* Mock Streets/Roads */}
        <path d="M 0,200 Q 150,185 200,200 T 400,200" fill="none" stroke="#e2e8f0" strokeWidth="6" opacity="0.8" />
        <path d="M 200,0 Q 215,150 200,200 T 200,400" fill="none" stroke="#e2e8f0" strokeWidth="6" opacity="0.8" />
        <path d="M 40,40 L 360,360" fill="none" stroke="#e2e8f0" strokeWidth="3" opacity="0.4" />
        <path d="M 40,360 L 360,40" fill="none" stroke="#e2e8f0" strokeWidth="3" opacity="0.4" />

        {/* Legend Radar Title */}
        <text x="16" y="28" fill="#94a3b8" fontSize="9" fontWeight="bold" letterSpacing="1.2">COORDINATE MONITOR</text>

        {/* User GPS Location Beacon */}
        {userCoords && (() => {
          const { x, y } = getSvgCoords(userCoords.latitude, userCoords.longitude);
          if (x >= 0 && x <= 100 && y >= 0 && y <= 100) {
            return (
              <g className="cursor-pointer">
                {/* Pulsing Outer Ring */}
                <circle cx={`${x}%`} cy={`${y}%`} r="18" fill="#10b981" opacity="0.2">
                  <animate attributeName="r" values="8;24;8" dur="3s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.3;0;0.3" dur="3s" repeatCount="indefinite" />
                </circle>
                <circle cx={`${x}%`} cy={`${y}%`} r="10" fill="#10b981" opacity="0.3">
                  <animate attributeName="r" values="4;14;4" dur="2s" repeatCount="indefinite" />
                </circle>
                {/* Core Beacon */}
                <circle cx={`${x}%`} cy={`${y}%`} r="6" fill="#10b981" stroke="#fff" strokeWidth="2" />
              </g>
            );
          }
        })()}

        {/* Center Markers */}
        {centers.map(center => {
          const { x, y } = getSvgCoords(center.latitude, center.longitude);
          const isCsc = center.type === "csc";
          const isHovered = hoveredCenter?.center_id === center.center_id;
          const isSelected = selectedCenterId === center.center_id;

          if (x < 0 || x > 100 || y < 0 || y > 100) return null;

          return (
            <g
              key={center.center_id}
              className="cursor-pointer"
              onMouseEnter={() => setHoveredCenter(center)}
              onMouseLeave={() => setHoveredCenter(null)}
              onClick={() => onSelectCenter(center)}
            >
              {/* Highlight Circle */}
              {(isHovered || isSelected) && (
                <circle
                  cx={`${x}%`}
                  cy={`${y}%`}
                  r={isSelected ? "18" : "14"}
                  fill={isCsc ? "#3b82f6" : "#ec4899"}
                  opacity="0.18"
                />
              )}

              {/* Pin Base Pointer */}
              <path
                d={`M ${x}%,${y}% l -6,-12 a 7,7 0 1,1 12,0 z`}
                fill={isCsc ? "#2563eb" : "#db2777"}
                stroke="#fff"
                strokeWidth="1.5"
                transform="translate(0, -6)"
              />
              
              {/* Emoji Icon inside Pin */}
              <text
                x={`${x}%`}
                y={`${y}%`}
                dy="-12"
                textAnchor="middle"
                fontSize="7"
                fill="#fff"
              >
                {isCsc ? "💻" : "📮"}
              </text>
            </g>
          );
        })}

        {/* Form Preview Center Marker */}
        {previewCenter && (() => {
          const { x, y } = getSvgCoords(previewCenter.latitude, previewCenter.longitude);
          if (x >= 0 && x <= 100 && y >= 0 && y <= 100) {
            return (
              <g className="cursor-pointer">
                <circle cx={`${x}%`} cy={`${y}%`} r="16" fill="#f59e0b" opacity="0.2">
                  <animate attributeName="r" values="10;20;10" dur="2s" repeatCount="indefinite" />
                </circle>
                <path
                  d={`M ${x}%,${y}% l -6,-12 a 7,7 0 1,1 12,0 z`}
                  fill="#d97706"
                  stroke="#fff"
                  strokeWidth="1.5"
                  transform="translate(0, -6)"
                />
                <text x={`${x}%`} y={`${y}%`} dy="-12" textAnchor="middle" fontSize="7" fill="#fff">⭐</text>
              </g>
            );
          }
        })()}
      </svg>

      {/* Floating Info Tooltip */}
      {hoveredCenter && (() => {
        const isCsc = hoveredCenter.type === "csc";
        return (
          <div className="absolute bottom-5 left-5 right-5 bg-white/95 backdrop-blur-md border border-gray-100 rounded-2xl p-4 shadow-xl flex flex-col gap-1 transition-all duration-300 animate-slide-up">
            <div className="flex justify-between items-center">
              <span className="text-[9px] font-bold uppercase tracking-wider text-gray-400">
                {isCsc ? "Common Service Centre" : "India Post Office"}
              </span>
              {hoveredCenter.distance !== undefined && (
                <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded">
                  🚀 {hoveredCenter.distance} km away
                </span>
              )}
            </div>
            <h4 className="text-xs font-bold text-gray-900 m-0">{hoveredCenter.name}</h4>
            <p className="text-[11px] text-gray-500 m-0 truncate">📍 {hoveredCenter.address}</p>
          </div>
        );
      })()}
      
      {/* Legend Card Overlay */}
      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3.5 py-2.5 rounded-2xl border border-gray-200/60 shadow-sm flex flex-col gap-1.5 text-[9px] font-bold text-gray-600">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block border border-white" />
          <span>Your Location</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block border border-white" />
          <span>E-Sevai / CSC Center</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-pink-500 inline-block border border-white" />
          <span>Post Office</span>
        </div>
        {previewCenter && (
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block border border-white" />
            <span>Form Preview</span>
          </div>
        )}
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
      setStatusMsg("Failed to connect to location services. Using offline fallback.");
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

  // Determine center coordinates of mock radar map grid
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
      <div className="w-full max-w-md mx-auto md:max-w-none md:mx-0 h-full flex flex-col md:flex-row gap-6 md:h-[calc(100vh-4rem)]">
        
        {/* Left Column: Form and Centers list */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#f9fafb] md:bg-white md:border md:border-gray-200 md:rounded-3xl md:shadow-sm overflow-hidden h-full">
          
          {/* Banner */}
          <div className="bg-gradient-to-br from-blue-900 to-indigo-950 px-6 py-5 text-white flex-shrink-0 md:rounded-t-3xl shadow-sm">
            <h1 className="text-lg font-bold m-0 flex items-center gap-2">📍 {d.title}</h1>
            <p className="text-xs text-blue-200/90 mt-1 m-0 leading-relaxed">{d.subtitle}</p>
          </div>

          {/* Tabs Selector */}
          <div className="flex bg-white border-b border-gray-100 px-3 flex-shrink-0">
            <button
              onClick={() => { setActiveTab("find"); setFormMsg({ text: "", type: "" }); }}
              className={`flex-1 py-4 bg-transparent border-0 border-b-2 font-semibold text-xs transition-colors duration-200 cursor-pointer ${
                activeTab === "find" 
                  ? "border-blue-600 text-blue-600" 
                  : "border-transparent text-gray-500 hover:text-gray-900"
              }`}
            >
              🔍 {d.tabFind}
            </button>
            <button
              onClick={() => { setActiveTab("add"); setStatusMsg(""); }}
              className={`flex-1 py-4 bg-transparent border-0 border-b-2 font-semibold text-xs transition-colors duration-200 cursor-pointer ${
                activeTab === "add" 
                  ? "border-blue-600 text-blue-600" 
                  : "border-transparent text-gray-500 hover:text-gray-900"
              }`}
            >
              ➕ {d.tabAdd}
            </button>
          </div>

          {/* Form Content Scroll Box */}
          <div className="flex-1 overflow-y-auto px-5 pb-24 md:pb-6 pt-4 custom-scrollbar bg-gray-50/20">
            
            {/* Tab 1: Find Centers */}
            {activeTab === "find" && (
              <div className="space-y-4">
                
                {/* Geolocation Lock box */}
                <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-sm space-y-4">
                  <button
                    onClick={requestGPSLocation}
                    disabled={loading}
                    className="w-full bg-blue-900 text-white border-0 rounded-xl py-3 text-xs font-bold cursor-pointer transition-transform duration-100 active:scale-95 shadow-sm disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    🧭 {loading ? "Locating..." : d.useLocation}
                  </button>

                  {statusMsg && (
                    <p className="text-xs font-semibold text-red-600 text-center m-0">
                      ⚠️ {statusMsg}
                    </p>
                  )}

                  {coords && (
                    <p className="text-xs text-emerald-600 font-semibold text-center m-0">
                      ✅ GPS Connected: {coords.latitude.toFixed(4)}, {coords.longitude.toFixed(4)}
                    </p>
                  )}

                  <div className="flex items-center gap-3 py-1">
                    <hr className="flex-1 border-0 border-t border-gray-100" />
                    <span className="text-[10px] text-gray-400 font-bold uppercase">OR</span>
                    <hr className="flex-1 border-0 border-t border-gray-100" />
                  </div>

                  {/* State Select Fallback */}
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                      {d.manualSelect}
                    </label>
                    <select
                      value={selectedState}
                      onChange={(e) => handleStateChange(e.target.value)}
                      className="w-full py-2.5 px-4 rounded-xl border border-gray-200 text-sm bg-white outline-none focus:border-blue-500"
                    >
                      <option value="">-- Choose State --</option>
                      {STATES.map(st => (
                        <option key={st.code} value={st.code}>{st.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Centers Listings */}
                <div className="space-y-3 pt-2">
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
                    <div className="bg-white border border-gray-100 rounded-2xl p-8 text-center shadow-sm">
                      <p className="text-4xl m-0 mb-3">🧭</p>
                      <p className="text-xs text-gray-500 m-0 leading-relaxed">
                        Query your geolocation or choose a manual state to load nearby common service centres (CSC) and Post Offices.
                      </p>
                    </div>
                  )}
                </div>

              </div>
            )}

            {/* Tab 2: Add Center Form */}
            {activeTab === "add" && (
              <form onSubmit={handleAddCenter} className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-sm space-y-4">
                
                {formMsg.text && (
                  <div className={`border rounded-xl p-3.5 text-xs font-semibold flex items-center gap-2 ${
                    formMsg.type === "success" 
                      ? "bg-emerald-50 text-emerald-800 border-emerald-100" 
                      : "bg-red-50 text-red-800 border-red-100"
                  }`}>
                    <span>{formMsg.type === "success" ? "✅" : "⚠️"}</span>
                    <span>{formMsg.text}</span>
                  </div>
                )}

                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                    {d.centerName} *
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. George Town Sub Post Office"
                    className="w-full py-2.5 px-4 rounded-xl border border-gray-200 text-sm outline-none box-border focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                    {d.centerType} *
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setFormType("csc")}
                      className={`flex-1 py-2.5 rounded-xl border font-bold text-xs cursor-pointer transition-colors ${
                        formType === "csc" 
                          ? "border-blue-600 bg-blue-50 text-blue-700" 
                          : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      💻 {d.csc}
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormType("post_office")}
                      className={`flex-1 py-2.5 rounded-xl border font-bold text-xs cursor-pointer transition-colors ${
                        formType === "post_office" 
                          ? "border-blue-600 bg-blue-50 text-blue-700" 
                          : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      📮 {d.postOffice}
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                    {d.address} *
                  </label>
                  <textarea
                    required
                    rows={2}
                    value={formAddress}
                    onChange={(e) => setFormAddress(e.target.value)}
                    placeholder="Complete street address details..."
                    className="w-full py-2.5 px-4 rounded-xl border border-gray-200 text-sm outline-none resize-none box-border focus:border-blue-500 font-sans leading-relaxed"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3.5">
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                      {d.state} *
                    </label>
                    <select
                      value={formState}
                      onChange={(e) => setFormState(e.target.value)}
                      className="w-full py-2.5 px-3 rounded-xl border border-gray-200 text-sm bg-white outline-none focus:border-blue-500 h-[42px]"
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
                      className="w-full h-[42px] bg-gray-100 border border-gray-200 rounded-xl text-[11px] text-gray-700 font-bold cursor-pointer transition-colors hover:bg-gray-200 flex items-center justify-center gap-1.5"
                    >
                      🎯 {d.fillGps}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3.5">
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                      {d.latitude} *
                    </label>
                    <input
                      type="number"
                      step="0.000001"
                      required
                      value={formLat}
                      onChange={(e) => setFormLat(e.target.value)}
                      placeholder="e.g. 13.0899"
                      className="w-full py-2.5 px-4 rounded-xl border border-gray-200 text-sm outline-none box-border focus:border-blue-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                      {d.longitude} *
                    </label>
                    <input
                      type="number"
                      step="0.000001"
                      required
                      value={formLng}
                      onChange={(e) => setFormLng(e.target.value)}
                      placeholder="e.g. 80.2872"
                      className="w-full py-2.5 px-4 rounded-xl border border-gray-200 text-sm outline-none box-border focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                    {d.phoneNum}
                  </label>
                  <input
                    type="text"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="e.g. 044-25220031"
                    className="w-full py-2.5 px-4 rounded-xl border border-gray-200 text-sm outline-none box-border focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                    {d.hoursVal}
                  </label>
                  <input
                    type="text"
                    value={formHours}
                    onChange={(e) => setFormHours(e.target.value)}
                    placeholder="e.g. 9:00 AM - 5:00 PM"
                    className="w-full py-2.5 px-4 rounded-xl border border-gray-200 text-sm outline-none box-border focus:border-blue-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-emerald-600 text-white border-0 rounded-xl py-3 text-xs font-bold cursor-pointer transition-transform duration-100 active:scale-[0.99] shadow-sm hover:bg-emerald-700"
                >
                  🚀 {d.submitBtn}
                </button>
              </form>
            )}

          </div>
        </div>

        {/* Right Column: Desktop Mock Map */}
        <div className="hidden md:flex flex-1 bg-white border border-gray-200 rounded-3xl shadow-sm p-4 overflow-hidden h-full">
          <MockMap 
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
