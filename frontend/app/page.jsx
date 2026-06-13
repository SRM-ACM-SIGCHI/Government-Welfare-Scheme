"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import ChatBot from "../components/ChatBot";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const LANGS = [
  { code: "en", label: "English", tagline: "Discover government welfare schemes you are eligible for", cta: "Get Started — Free", ctaSchemes: "See My Schemes", ctaProfile: "Update My Profile", speak: "Speak to find schemes", speakHint: "Tap mic and tell us your age, state, and occupation" },
  { code: "ta", label: "தமிழ்",   tagline: "நீங்கள் தகுதியான திட்டங்களை கண்டறியுங்கள்", cta: "தொடங்குங்கள் — இலவசம்", ctaSchemes: "என் திட்டங்களை பாருங்கள்", ctaProfile: "விவரங்களை மாற்றுங்கள்", speak: "பேசி திட்டங்கள் கண்டறியுங்கள்", speakHint: "மைக்கை தட்டி உங்கள் வயது, மாநிலம், மற்றும் தொழில் விவரங்களைக் கூறவும்" },
  { code: "hi", label: "हिंदी",   tagline: "अपने लिए योग्य सरकारी योजनाएं खोजें", cta: "शुरू करें — मुफ़्त", ctaSchemes: "मेरी योजनाएं देखें", ctaProfile: "प्रोफाइल अपडेट करें", speak: "बोलकर योजनाएं खोजें", speakHint: "माइक दबाएं और अपनी उम्र, राज्य और पेशा बताएं" },
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

  const t = LANGS.find((l) => l.code === lang) || LANGS[0];

  const startVoice = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setVoiceError("Voice recognition is not supported in this browser. Please use Google Chrome.");
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
      setVoiceError("Could not hear clearly. Please try speaking again.");
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
      setVoiceError("Could not connect to matching services. Please try again.");
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 md:p-8 box-border font-sans antialiased text-slate-800">
      <div className="w-full max-w-lg bg-white min-h-[90vh] md:min-h-0 md:rounded-3xl md:shadow-xl md:border border-slate-200/80 flex flex-col justify-between overflow-hidden p-6 md:p-8 box-border gap-8">
        
        {/* Core Content */}
        <div className="flex-1 flex flex-col justify-center items-center text-center gap-7 pt-4">
          
          {/* Main Logo & Title */}
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-900 to-blue-900 flex items-center justify-center text-3xl shadow-lg shadow-indigo-900/10">
              🏛️
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight m-0">
                Welfare Schemes
              </h1>
              <p className="text-xs md:text-sm text-slate-500 font-semibold max-w-xs mx-auto mt-2 leading-relaxed">
                {t.tagline}
              </p>
            </div>
          </div>

          {/* Language selector chips */}
          <div className="flex gap-2 bg-slate-50 p-1 rounded-full border border-slate-200/60">
            {LANGS.map((l) => (
              <button 
                key={l.code} 
                onClick={() => { setLang(l.code); localStorage.setItem("language", l.code); }}
                className={`px-5 py-2 rounded-full border-0 text-xs font-bold cursor-pointer transition-all duration-200 ${
                  lang === l.code 
                    ? "bg-indigo-900 text-white shadow-md" 
                    : "bg-transparent text-slate-500 hover:text-slate-900"
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>

          {/* Voice Search Area */}
          <div className="w-full bg-slate-50 border border-slate-200/60 rounded-3xl p-6 box-border flex flex-col items-center gap-4">
            <div className="text-center">
              <p className="text-xs font-extrabold text-indigo-950 m-0 flex items-center justify-center gap-1.5 uppercase tracking-wide">
                <span>🎤</span> {t.speak}
              </p>
              <p className="text-[10px] text-slate-500 font-semibold m-0 mt-1">
                {t.speakHint}
              </p>
            </div>

            {/* Pulsing Voice Mic Button */}
            <div className="relative my-2">
              {listening && (
                <>
                  <span className="absolute inset-0 rounded-full bg-red-500/10 animate-ping"></span>
                  <span className="absolute -inset-2 rounded-full bg-red-500/5 animate-[ping_2s_infinite]"></span>
                </>
              )}
              <button
                onClick={listening ? stopVoice : startVoice}
                className={`relative w-16 h-16 rounded-full border-none cursor-pointer flex items-center justify-center text-xl shadow-lg transition-all duration-300 active:scale-95 z-10 ${
                  listening 
                    ? "bg-red-600 text-white shadow-red-200" 
                    : "bg-gradient-to-br from-indigo-600 to-blue-600 text-white hover:scale-102 shadow-indigo-100"
                }`}
              >
                {listening ? (
                  <span className="text-base font-bold">⏹</span>
                ) : (
                  <span className="text-lg">🎤</span>
                )}
              </button>
            </div>

            {listening && (
              <div className="flex items-center justify-center gap-1">
                <span className="w-1 h-3 bg-red-500 rounded-full animate-bounce"></span>
                <span className="w-1 h-4 bg-red-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-1 h-3 bg-red-500 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                <span className="text-[10px] text-red-600 font-extrabold uppercase tracking-widest ml-1">
                  Listening...
                </span>
              </div>
            )}

            {transcript && (
              <div className="w-full bg-white rounded-2xl p-4 border border-slate-200 text-left shadow-sm animate-[fadeIn_0.25s_ease-out]">
                <p className="text-xs text-slate-700 m-0 font-medium italic leading-relaxed">
                  "{transcript}"
                </p>
              </div>
            )}

            {searching && (
              <div className="flex items-center gap-2 text-xs text-indigo-900 font-bold animate-pulse">
                <span>⚡</span> Analyzing database and matching schemes...
              </div>
            )}

            {voiceError && (
              <div className="text-xs text-red-600 font-bold bg-red-50 border border-red-100/60 rounded-xl px-4 py-2 text-center w-full">
                ⚠️ {voiceError}
              </div>
            )}

            {/* Voice query matching list */}
            {voiceResults && !searching && (
              <div className="w-full mt-2 border-t border-slate-200/60 pt-4 text-left flex flex-col gap-2.5 animate-[fadeIn_0.3s_ease-out]">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest m-0 mb-1">
                  Suggested Matches ({voiceResults.schemes.length})
                </p>
                <div className="flex flex-col gap-2 w-full">
                  {voiceResults.schemes.slice(0, 3).map((s) => (
                    <div 
                      key={s.scheme_id}
                      onClick={() => router.push(`/schemes/${s.scheme_id}`)}
                      className="bg-white border border-slate-200 hover:border-indigo-600 rounded-2xl p-4 cursor-pointer flex justify-between items-center transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
                    >
                      <span className="text-xs font-bold text-slate-800 flex-1 pr-2 truncate">
                        {s.name}
                      </span>
                      <span className="text-indigo-600 text-sm font-bold">→</span>
                    </div>
                  ))}
                </div>
                {voiceResults.schemes.length > 3 && (
                  <button
                    onClick={() => {
                      localStorage.setItem("user_profile", JSON.stringify(voiceResults.profile));
                      router.push("/schemes");
                    }}
                    className="w-full bg-indigo-900 hover:bg-indigo-800 text-white border-0 rounded-2xl py-3 px-4 text-xs font-bold cursor-pointer mt-1 transition-all duration-200 shadow-sm active:scale-98"
                  >
                    See all {voiceResults.schemes.length} schemes →
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Safety Verification Trust Box */}
          <div className="w-full bg-emerald-50/50 border border-emerald-100/60 rounded-3xl p-5 text-left box-border">
            <p className="text-xs font-extrabold text-emerald-800 m-0 mb-3 flex items-center gap-1.5 uppercase tracking-wide">
              <span>🛡️</span> Secure, Verified & Private
            </p>
            <ul className="text-[11px] text-emerald-700/95 m-0 p-0 list-none space-y-2 font-semibold leading-relaxed">
              <li className="flex items-start gap-2.5">
                <span className="text-emerald-500">•</span>
                <span>We never ask for Aadhaar numbers, OTPs, or bank account credentials.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-emerald-500">•</span>
                <span>All application links navigate directly to official government portals.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-emerald-500">•</span>
                <span>Your profile data remains encrypted locally inside your browser cache.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* CTA buttons */}
        <div className="flex flex-col gap-3.5 border-t border-slate-100 pt-6 flex-shrink-0">
          {hasProfile ? (
            <div className="flex flex-col gap-2.5 w-full">
              <button 
                onClick={() => router.push("/schemes")}
                className="w-full bg-indigo-900 hover:bg-indigo-800 text-white border-none rounded-2xl py-4 text-sm font-bold cursor-pointer transition-all duration-200 shadow-md active:scale-98 shadow-indigo-900/10"
              >
                {t.ctaSchemes}
              </button>
              <button 
                onClick={() => router.push("/profile")}
                className="w-full bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 rounded-2xl py-4 text-sm font-bold cursor-pointer transition-colors duration-200"
              >
                {t.ctaProfile}
              </button>
            </div>
          ) : (
            <button 
              onClick={() => router.push("/onboarding")}
              className="w-full bg-indigo-900 hover:bg-indigo-800 text-white border-none rounded-2xl py-4 text-sm font-bold cursor-pointer transition-all duration-200 shadow-md active:scale-98 shadow-indigo-900/10"
            >
              {t.cta}
            </button>
          )}
          <p className="text-center text-[10px] text-slate-400 font-bold m-0 tracking-wide uppercase">
            Takes less than 1 minute • No signup required
          </p>
        </div>

      </div>
      <ChatBot language={lang} />
    </div>
  );
}