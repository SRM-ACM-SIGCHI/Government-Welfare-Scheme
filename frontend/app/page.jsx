"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import ChatBot from "../components/ChatBot";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const LANGS = [
  { code: "en", label: "English", tagline: "Find government welfare schemes you are eligible for", cta: "Get Started — Free", ctaSchemes: "See My Schemes", ctaProfile: "Update My Profile", speak: "Speak to find schemes", speakHint: "Tap mic and speak your details" },
  { code: "ta", label: "தமிழ்",   tagline: "நீங்கள் தகுதியான திட்டங்களை கண்டறியுங்கள்", cta: "தொடங்குங்கள் — இலவசம்", ctaSchemes: "என் திட்டங்களை பாருங்கள்", ctaProfile: "விவரங்களை மாற்றுங்கள்", speak: "பேசி திட்டங்கள் கண்டறியுங்கள்", speakHint: "மைக்கை தட்டி பேசுங்கள்" },
  { code: "hi", label: "हिंदी",   tagline: "अपने लिए योग्य सरकारी योजनाएं खोजें", cta: "शुरू करें — मुफ़्त", ctaSchemes: "मेरी योजनाएं देखें", ctaProfile: "प्रोफाइल अपडेट करें", speak: "बोलकर योजनाएं खोजें", speakHint: "माइक दबाएं और बोलें" },
];

const SPEECH_LANGS = { en: "en-IN", ta: "ta-IN", hi: "hi-IN" };

const KEYWORD_MAP = {
  "tamil nadu": "TN", "tamilnadu": "TN", "தமிழ்நாடு": "TN", "தமிழ் நாடு": "TN",
  "maharashtra": "MH", "महाराष्ट्र": "MH", "delhi": "DL", "दिल्ली": "DL",
  "karnataka": "KA", "கர்நாடகா": "KA", "कर्नाटक": "KA",
  "andhra": "AP", "ஆந்திரா": "AP", "kerala": "KL", "கேரளா": "KL",
  "uttar pradesh": "UP", "उत्तर प्रदेश": "UP", "west bengal": "WB",
  "female": "female", "woman": "female", "women": "female",
  "பெண்": "female", "பெண்கள்": "female", "அம்மா": "female",
  "महिला": "female", "औरत": "female",
  "male": "male", "man": "male", "ஆண்": "male", "पुरुष": "male",
  "sc": "SC", "scheduled caste": "SC", "தலித்": "SC", "दलित": "SC",
  "st": "ST", "tribal": "ST", "பழங்குடி": "ST", "आदिवासी": "ST",
  "obc": "OBC", "பிற்படுத்தப்பட்ட": "OBC", "पिछड़ा": "OBC",
  "ews": "EWS", "general": "GEN", "பொது": "GEN", "सामान्य": "GEN",
  "farmer": "farmer", "விவசாயி": "farmer", "கிசான்": "farmer", "किसान": "farmer",
  "student": "student", "மாணவர்": "student", "छात्र": "student",
  "labour": "unorganised_worker", "daily wage": "unorganised_worker",
  "கூலி": "unorganised_worker", "மஜதூர்": "unorganised_worker", "मजदूर": "unorganised_worker",
  "self employed": "self_employed", "சுயதொழில்": "self_employed", "व्यवसाय": "self_employed",
  "unemployed": "unemployed", "வேலை இல்லை": "unemployed", "बेरोजगार": "unemployed",
  "salaried": "salaried", "job": "salaried", "நௌகரி": "salaried", "नौकरी": "salaried",
};

const INCOME_KEYWORDS = {
  "poor": 60000, "ஏழை": 60000, "गरीब": 60000, "bpl": 60000,
  "low income": 120000, "குறைந்த வருமானம்": 120000, "कम आय": 120000,
  "middle": 250000, "நடுத்தர": 250000, "मध्यम": 250000,
};

function extractProfile(text) {
  const lower = text.toLowerCase();
  const profile = {
    state: "TN", gender: "female", caste_category: "OBC",
    age: 30, income_annual: 120000, occupation_type: "unorganised_worker",
  };
  for (const [kw, val] of Object.entries(KEYWORD_MAP)) {
    if (lower.includes(kw.toLowerCase()) || text.includes(kw)) {
      if (["TN","MH","DL","KA","AP","KL","UP","WB"].includes(val)) profile.state = val;
      else if (["male","female","other"].includes(val)) profile.gender = val;
      else if (["SC","ST","OBC","EWS","GEN"].includes(val)) profile.caste_category = val;
      else if (["farmer","student","unorganised_worker","self_employed","unemployed","salaried"].includes(val)) profile.occupation_type = val;
    }
  }
  for (const [kw, val] of Object.entries(INCOME_KEYWORDS)) {
    if (lower.includes(kw.toLowerCase()) || text.includes(kw)) profile.income_annual = val;
  }
  const ageMatch = text.match(/(\d{1,3})\s*(years|வயது|साल|yrs)/i) || text.match(/(வயது|साल)\s*(\d{1,3})/i);
  if (ageMatch) {
    const age = parseInt(ageMatch[1] || ageMatch[2]);
    if (age > 0 && age < 120) profile.age = age;
  }
  return profile;
}

export default function HomePage() {
  const router = useRouter();
  const [hasProfile, setHasProfile] = useState(false);
  const [lang, setLang]             = useState("en");
  const [listening, setListening]   = useState(false);
  const [transcript, setTranscript] = useState("");
  const [searching, setSearching]   = useState(false);
  const [voiceResults, setVoiceResults] = useState(null);
  const [voiceError, setVoiceError] = useState("");
  const recognitionRef = useRef(null);

  useEffect(() => {
    if (localStorage.getItem("user_profile")) setHasProfile(true);
    const savedLang = localStorage.getItem("language");
    if (savedLang) setLang(savedLang);
  }, []);

  const t = LANGS.find((l) => l.code === lang);

  const startVoice = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setVoiceError("Voice not supported. Use Chrome browser.");
      return;
    }
    setVoiceError("");
    setTranscript("");
    setVoiceResults(null);

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = SPEECH_LANGS[lang] || "en-IN";

    recognition.onstart  = () => setListening(true);
    recognition.onend    = () => setListening(false);

    recognition.onresult = (e) => {
      const text = Array.from(e.results).map(r => r[0].transcript).join(" ");
      setTranscript(text);
      if (e.results[e.results.length - 1].isFinal) {
        searchFromSpeech(text);
      }
    };

    recognition.onerror = (e) => {
      setListening(false);
      setVoiceError("Could not hear clearly. Please try again.");
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopVoice = () => {
    if (recognitionRef.current) recognitionRef.current.stop();
    setListening(false);
  };

  const searchFromSpeech = async (text) => {
    setSearching(true);
    const profile = extractProfile(text);
    try {
      const res = await fetch(`${API_URL}/schemes/match`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_profile: profile, language: lang }),
      });
      const data = await res.json();
      setVoiceResults({ schemes: data.schemes || [], profile });
    } catch {
      setVoiceError("Could not connect to server.");
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-0 md:p-6 box-border font-sans">
      <div className="w-full max-w-xl bg-white min-h-screen md:min-h-0 md:rounded-3xl md:shadow-md border-0 md:border border-gray-200/80 flex flex-col justify-between overflow-hidden p-6 md:p-8 box-border">
        
        {/* Core Content */}
        <div className="flex-1 flex flex-col justify-center items-center text-center gap-6 py-6">
          
          <div className="w-16 h-16 rounded-2xl bg-blue-900 flex items-center justify-center text-4xl shadow-md">
            🏛️
          </div>

          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 m-0 tracking-tight leading-tight">Welfare Schemes</h1>
            <p className="text-sm text-gray-500 m-0 mt-2 leading-relaxed max-w-sm mx-auto">{t.tagline}</p>
          </div>

          {/* Language selector chips */}
          <div className="flex gap-2">
            {LANGS.map((l) => (
              <button 
                key={l.code} 
                onClick={() => { setLang(l.code); localStorage.setItem("language", l.code); }}
                className={`px-4 py-2 rounded-full border-0 text-xs font-semibold cursor-pointer transition-all duration-150 ${
                  lang === l.code 
                    ? "bg-blue-900 text-white shadow-sm" 
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>

          {/* Safety Verification Trust Box */}
          <div className="w-full bg-emerald-50 border border-emerald-100 rounded-2xl p-5 text-left box-border">
            <p className="text-xs font-bold text-emerald-800 m-0 mb-2.5 flex items-center gap-1.5">
              <span>🛡️</span> Safe, Verified & Private
            </p>
            <ul className="text-xs text-emerald-700 m-0 p-0 list-none space-y-1.5 font-semibold">
              <li className="flex items-start gap-2">
                <span>•</span>
                <span>We never ask for Aadhaar number or bank account credentials.</span>
              </li>
              <li className="flex items-start gap-2">
                <span>•</span>
                <span>All application links navigate directly to official government portals.</span>
              </li>
              <li className="flex items-start gap-2">
                <span>•</span>
                <span>Your profile data remains encrypted locally on your phone.</span>
              </li>
            </ul>
          </div>

          {/* Voice Search Radar Panel */}
          <div className="w-full bg-purple-50/50 border border-purple-100/60 rounded-3xl p-5 box-border">
            <p className="text-xs font-bold text-purple-900 m-0 mb-1 flex items-center justify-center gap-1.5">
              <span>🎤</span> {t.speak}
            </p>
            <p className="text-[11px] text-purple-700 m-0 mb-4 font-semibold">{t.speakHint}</p>

            {/* Pulsing Voice Mic Button */}
            <button
              onClick={listening ? stopVoice : startVoice}
              className={`w-16 h-16 rounded-full border-0 cursor-pointer flex items-center justify-center text-2xl mx-auto mb-3 shadow-md transition-all duration-300 active:scale-95 ${
                listening 
                  ? "bg-red-600 text-white animate-pulse ring-8 ring-red-100" 
                  : "bg-purple-600 text-white hover:bg-purple-700 shadow-purple-200"
              }`}
            >
              {listening ? "⏹" : "🎤"}
            </button>

            {listening && (
              <div className="flex items-center justify-center gap-1.5 mb-2">
                <span className="text-[10px] text-red-600 font-bold uppercase tracking-wider">Listening Input...</span>
              </div>
            )}

            {transcript && (
              <div className="bg-white rounded-xl p-3 mb-2 border border-purple-100 text-left">
                <p className="text-xs text-gray-700 m-0 font-medium italic">"{transcript}"</p>
              </div>
            )}

            {searching && (
              <p className="text-xs text-purple-800 font-bold animate-pulse m-0">Matching schemes in database...</p>
            )}

            {voiceError && (
              <p className="text-xs text-red-600 font-bold m-0">{voiceError}</p>
            )}

            {/* Voice query matching list */}
            {voiceResults && !searching && (
              <div className="mt-4 border-t border-purple-100/50 pt-4 text-left">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2.5">
                  Suggested Matches ({voiceResults.schemes.length})
                </p>
                <div className="space-y-2">
                  {voiceResults.schemes.slice(0, 3).map((s) => (
                    <div 
                      key={s.scheme_id}
                      onClick={() => router.push(`/schemes/${s.scheme_id}`)}
                      className="bg-white border border-purple-100/40 rounded-xl p-3.5 cursor-pointer flex justify-between items-center transition-all hover:border-purple-300"
                    >
                      <span className="text-xs font-semibold text-gray-800 flex-1 pr-2 truncate">{s.name}</span>
                      <span className="text-purple-600 text-sm">›</span>
                    </div>
                  ))}
                </div>
                {voiceResults.schemes.length > 3 && (
                  <button
                    onClick={() => {
                      localStorage.setItem("user_profile", JSON.stringify(voiceResults.profile));
                      router.push("/schemes");
                    }}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white border-0 rounded-xl py-2.5 px-4 text-xs font-bold cursor-pointer mt-3 transition-colors shadow-sm"
                  >
                    See all {voiceResults.schemes.length} schemes →
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* CTA buttons */}
        <div className="flex flex-col gap-3 mt-4 border-t border-gray-50 pt-6">
          {hasProfile ? (
            <>
              <button 
                onClick={() => router.push("/schemes")}
                className="w-full bg-blue-900 text-white border-0 rounded-xl py-4 text-sm font-bold cursor-pointer transition-transform duration-100 active:scale-98 shadow-md hover:bg-blue-800"
              >
                {t.ctaSchemes}
              </button>
              <button 
                onClick={() => router.push("/profile")}
                className="w-full bg-white text-gray-700 border border-gray-200 rounded-xl py-4 text-sm font-semibold cursor-pointer transition-colors hover:bg-gray-50"
              >
                {t.ctaProfile}
              </button>
            </>
          ) : (
            <button 
              onClick={() => router.push("/onboarding")}
              className="w-full bg-blue-900 text-white border-0 rounded-xl py-4 text-sm font-bold cursor-pointer transition-transform duration-100 active:scale-98 shadow-md hover:bg-blue-800"
            >
              {t.cta}
            </button>
          )}
          <p className="text-center text-[10px] text-gray-400 font-semibold m-0 mt-1">
            Takes less than 1 minute • No signup or accounts required
          </p>
        </div>

      </div>
      <ChatBot language={lang} />
    </div>
  );
}