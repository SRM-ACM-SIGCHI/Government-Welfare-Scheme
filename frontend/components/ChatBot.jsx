"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const DICT = {
  en: {
    title: "AI Scheme Assistant",
    subtitle: "Ask about welfare eligibility & rules",
    placeholder: "Type a question in English, தமிழ், or हिंदी...",
    safety: "Safe Chat: We never ask for Aadhaar or bank details.",
    suggestions: [
      "Am I eligible for PM-KISAN?",
      "Are there scholarships for students?",
      "Housing support for daily wage workers?",
      "SSY requirements for girls?"
    ],
    greeting: "Hello! I can explain the eligibility rules for all government schemes in Tamil, Hindi, or English. Ask me anything!",
    referenced: "Related schemes (click to view details):"
  },
  ta: {
    title: "AI திட்ட உதவியாளர்",
    subtitle: "தகுதி மற்றும் விதிகள் பற்றி கேளுங்கள்",
    placeholder: "தமிழ், English, அல்லது हिंदी-யில் கேளுங்கள்...",
    safety: "பாதுகாப்பான அரட்டை: ஆதார் அல்லது வங்கி எண்களை நாங்கள் கேட்பதில்லை.",
    suggestions: [
      "PM-KISAN தகுதி எனக்கு உண்டா?",
      "மாணவர்களுக்கான கல்வி உதவித்தொகை உள்ளதா?",
      "கூலித் தொழிலாளர்களுக்கு வீட்டு வசதி உள்ளதா?",
      "பெண் குழந்தைகளுக்கான SSY சேமிப்பு திட்டம்?"
    ],
    greeting: "வணக்கம்! நீங்கள் தகுதியான அரசு நலத்திட்டங்கள் மற்றும் அதன் விண்ணப்பிக்கும் தகுதிகளை தமிழ், இந்தி அல்லது ஆங்கிலத்தில் விளக்க முடியும். ஏதேனும் கேளுங்கள்!",
    referenced: "தொடர்புடைய திட்டங்கள் (விவரங்களைக் காண கிளிக் செய்யவும்):"
  },
  hi: {
    title: "AI योजना सहायक",
    subtitle: "पात्रता और नियमों के बारे में पूछें",
    placeholder: "हिंदी, English, या தமிழ் में पूछें...",
    safety: "सुरक्षित चैट: हम कभी भी आधार या बैंक विवरण नहीं मांगते हैं।",
    suggestions: [
      "क्या मैं PM-KISAN के लिए पात्र हूँ?",
      "क्या छात्रों के लिए कोई स्कॉलरशिप है?",
      "मजदूरों के लिए आवास सहायता?",
      "बालिकाओं के लिए SSY योजना नियम?"
    ],
    greeting: "नमस्ते! मैं सभी सरकारी योजनाओं की पात्रता नियमों को हिंदी, तमिल या अंग्रेजी में समझा सकता हूँ। कुछ भी पूछें!",
    referenced: "संबंधित योजनाएं (विवरण देखने के लिए क्लिक करें):"
  }
};

export default function ChatBot({ language = "en", isInline = false }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [schemesMap, setSchemesMap] = useState({});
  const messagesEndRef = useRef(null);

  const t = DICT[language] || DICT.en;

  // Initialize conversation history
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        { role: "assistant", content: t.greeting }
      ]);
    }
  }, [language]);

  // Autoscroll chat history
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, loading]);

  const handleSend = async (textToSend) => {
    const text = textToSend || input;
    if (!text.trim()) return;

    if (!textToSend) setInput("");
    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setLoading(true);

    // Retrieve local user profile from localStorage
    let userProfile = null;
    const rawProfile = localStorage.getItem("user_profile");
    if (rawProfile) {
      try {
        userProfile = JSON.parse(rawProfile);
      } catch (e) {
        console.error("Failed to parse local profile:", e);
      }
    }

    // Format message history (excluding greeting to save tokens)
    const formattedHistory = messages
      .slice(1)
      .map((msg) => ({
        role: msg.role === "assistant" ? "model" : "user",
        content: msg.content
      }));

    try {
      const res = await fetch(`${API_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          history: formattedHistory,
          user_profile: userProfile,
          language: language
        })
      });

      if (!res.ok) throw new Error("Chat service error");
      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.reply,
          references: data.matched_schemes || []
        }
      ]);

      // Fetch matching schemes names dynamically if they aren't loaded in schemesMap
      if (data.matched_schemes && data.matched_schemes.length > 0) {
        data.matched_schemes.forEach(async (sid) => {
          if (!schemesMap[sid]) {
            try {
              const sres = await fetch(`${API_URL}/schemes/${sid}`);
              if (sres.ok) {
                const sdata = await sres.json();
                setSchemesMap((prev) => ({
                  ...prev,
                  [sid]: sdata.name_ta && language === "ta" ? sdata.name_ta : (
                         sdata.name_hi && language === "hi" ? sdata.name_hi : sdata.name)
                }));
              }
            } catch (e) {
              console.error("Failed to load details for " + sid, e);
            }
          }
        });
      }

    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, I am having trouble connecting to my servers right now. Please try again later." }
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (isInline) {
    return (
      <div
        className="flex flex-col h-full bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm"
        style={{ height: "100%", width: "100%", display: "flex", flexDirection: "column", boxSizing: "border-box" }}
      >
        {/* Header */}
        <div
          style={{
            background: "linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)",
            padding: "20px 24px",
            color: "#fff",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}
        >
          <div>
            <h3 style={{ fontSize: 17, fontWeight: 700, margin: 0 }}>✨ {t.title}</h3>
            <p style={{ fontSize: 11, color: "#e0e7ff", margin: "2px 0 0" }}>{t.subtitle}</p>
          </div>
        </div>

        {/* Safety Reminder Banner */}
        <div
          style={{
            background: "#f0fdf4",
            borderBottom: "1px solid #dcfce7",
            padding: "8px 20px",
            display: "flex",
            alignItems: "center",
            gap: 8
          }}
        >
          <span style={{ fontSize: 12 }}>🔒</span>
          <span style={{ fontSize: 11, color: "#166534", fontWeight: 500 }}>{t.safety}</span>
        </div>

        {/* Conversation Window */}
        <div
          style={{
            flex: 1,
            padding: "20px",
            overflowY: "auto",
            background: "#f9fafb",
            display: "flex",
            flexDirection: "column",
            gap: 16
          }}
          className="custom-scrollbar"
        >
          {messages.map((msg, idx) => (
            <div
              key={idx}
              style={{
                alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
                maxWidth: "85%",
                display: "flex",
                flexDirection: "column",
                gap: 6
              }}
            >
              <div
                style={{
                  background: msg.role === "user" ? "#1e3a8a" : "#fff",
                  color: msg.role === "user" ? "#fff" : "#1f2937",
                  borderRadius: msg.role === "user" ? "18px 18px 2px 18px" : "18px 18px 18px 2px",
                  padding: "12px 16px",
                  fontSize: 14,
                  lineHeight: 1.5,
                  boxShadow: msg.role === "user" ? "0 4px 12px rgba(30,58,138,0.15)" : "0 4px 12px rgba(0,0,0,0.02)",
                  whiteSpace: "pre-line",
                  wordBreak: "break-word"
                }}
              >
                {msg.content}
              </div>

              {/* Related Schemes */}
              {msg.references && msg.references.length > 0 && (
                <div style={{ marginTop: 4, display: "flex", flexDirection: "column", gap: 6 }}>
                  <span style={{ fontSize: 11, color: "#9ca3af", fontWeight: 600 }}>{t.referenced}</span>
                  {msg.references.map((sid) => (
                    <button
                      key={sid}
                      onClick={() => router.push(`/schemes/${sid}`)}
                      style={{
                        background: "#fff",
                        border: "1px solid #e5e7eb",
                        borderRadius: 10,
                        padding: "8px 12px",
                        fontSize: 12,
                        fontWeight: 600,
                        color: "#2563eb",
                        textAlign: "left",
                        cursor: "pointer",
                        boxShadow: "0 2px 6px rgba(0,0,0,0.01)"
                      }}
                    >
                      🏛️ {schemesMap[sid] || sid}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div style={{ alignSelf: "flex-start", display: "flex", gap: 4, padding: "12px 16px", background: "#fff", borderRadius: "18px 18px 18px 2px", boxShadow: "0 4px 12px rgba(0,0,0,0.02)" }}>
              <div className="dot" style={{ width: 6, height: 6, background: "#9ca3af", borderRadius: "50%", animation: "bounce 1.4s infinite ease-in-out both" }} />
              <div className="dot" style={{ width: 6, height: 6, background: "#9ca3af", borderRadius: "50%", animation: "bounce 1.4s infinite ease-in-out both", animationDelay: "0.2s" }} />
              <div className="dot" style={{ width: 6, height: 6, background: "#9ca3af", borderRadius: "50%", animation: "bounce 1.4s infinite ease-in-out both", animationDelay: "0.4s" }} />
            </div>
          )}

          {/* Quick Suggestions */}
          {!loading && messages.length <= 1 && (
            <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {t.suggestions.map((s, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(s)}
                    style={{
                      textAlign: "left",
                      background: "#fff",
                      border: "1px solid #e5e7eb",
                      borderRadius: 14,
                      padding: "12px 16px",
                      fontSize: 13,
                      color: "#4b5563",
                      cursor: "pointer",
                      transition: "all 0.2s",
                      fontWeight: 500
                    }}
                  >
                    💡 {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          style={{
            background: "#fff",
            borderTop: "1px solid #f3f4f6",
            padding: "16px",
            display: "flex",
            gap: 8
          }}
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t.placeholder}
            disabled={loading}
            style={{
              flex: 1,
              border: "1px solid #e5e7eb",
              borderRadius: 14,
              padding: "12px 16px",
              fontSize: 14,
              outline: "none",
              boxSizing: "border-box"
            }}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            style={{
              background: "linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)",
              color: "#fff",
              border: "none",
              borderRadius: 14,
              padding: "0 20px",
              fontSize: 15,
              fontWeight: 600,
              cursor: "pointer",
              opacity: loading || !input.trim() ? 0.6 : 1
            }}
          >
            Send
          </button>
        </form>
        <style>{`
          @keyframes bounce {
            0%, 80%, 100% { transform: scale(0); }
            40% { transform: scale(1.0); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <>
      {/* Floating launcher button with pulsing rings */}
      <button
        onClick={() => setIsOpen(true)}
        style={{
          position: "fixed",
          bottom: 24,
          right: 24,
          zIndex: 998,
          width: 60,
          height: 60,
          borderRadius: "50%",
          background: "linear-gradient(135deg, #7c3aed 0%, #2563eb 100%)",
          color: "#fff",
          border: "none",
          cursor: "pointer",
          boxShadow: "0 8px 30px rgba(124, 58, 237, 0.4)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 28,
          transition: "transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)"
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.1) rotate(5deg)")}
        onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1) rotate(0deg)")}
      >
        💬
        {/* Pulsing micro-animation element */}
        <span
          style={{
            position: "absolute",
            top: -2,
            right: -2,
            width: 14,
            height: 14,
            background: "#22c55e",
            borderRadius: "50%",
            border: "2px solid #fff",
            boxShadow: "0 0 10px rgba(34, 197, 94, 0.8)"
          }}
        />
      </button>

      {/* RAG chat drawer / overlay */}
      {isOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(17, 24, 39, 0.4)",
            backdropFilter: "blur(4px)",
            zIndex: 999,
            display: "flex",
            justifyContent: "center",
            alignItems: "flex-end"
          }}
          onClick={() => setIsOpen(false)}
        >
          {/* Main Panel Content */}
          <div
            style={{
              width: "100%",
              maxWidth: 480,
              height: "85vh",
              background: "rgba(255, 255, 255, 0.95)",
              borderTopLeftRadius: 30,
              borderTopRightRadius: 30,
              boxShadow: "0 -10px 40px rgba(0,0,0,0.15)",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              animation: "slideUp 0.3s ease-out"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div
              style={{
                background: "linear-gradient(135deg, #7c3aed 0%, #2563eb 100%)",
                padding: "20px 24px",
                color: "#fff",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }}
            >
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>✨ {t.title}</h3>
                <p style={{ fontSize: 12, color: "#e0e7ff", margin: "2px 0 0" }}>{t.subtitle}</p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                style={{
                  background: "rgba(255,255,255,0.2)",
                  border: "none",
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  color: "#fff",
                  fontSize: 16,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                ✕
              </button>
            </div>

            {/* Safety Reminder Banner */}
            <div
              style={{
                background: "#f0fdf4",
                borderBottom: "1px solid #dcfce7",
                padding: "8px 20px",
                display: "flex",
                alignItems: "center",
                gap: 8
              }}
            >
              <span style={{ fontSize: 12 }}>🔒</span>
              <span style={{ fontSize: 11, color: "#166534", fontWeight: 500 }}>{t.safety}</span>
            </div>

            {/* Conversation Window */}
            <div
              style={{
                flex: 1,
                padding: "20px 20px",
                overflowY: "auto",
                background: "#f9fafb",
                display: "flex",
                flexDirection: "column",
                gap: 16
              }}
            >
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  style={{
                    alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
                    maxWidth: "80%",
                    display: "flex",
                    flexDirection: "column",
                    gap: 6
                  }}
                >
                  <div
                    style={{
                      background: msg.role === "user" ? "#7c3aed" : "#fff",
                      color: msg.role === "user" ? "#fff" : "#1f2937",
                      borderRadius: msg.role === "user" ? "18px 18px 2px 18px" : "18px 18px 18px 2px",
                      padding: "12px 16px",
                      fontSize: 14,
                      lineHeight: 1.5,
                      boxShadow: msg.role === "user" ? "0 4px 10px rgba(124,58,237,0.2)" : "0 4px 10px rgba(0,0,0,0.03)",
                      border: msg.role === "user" ? "none" : "1px solid #f3f4f6"
                    }}
                  >
                    {msg.content}
                  </div>

                  {/* Refered Matching Scheme Pill Buttons */}
                  {msg.references && msg.references.length > 0 && (
                    <div style={{ marginTop: 2, display: "flex", flexDirection: "column", gap: 6 }}>
                      <p style={{ fontSize: 11, color: "#6b7280", margin: "2px 0 0", fontWeight: 500 }}>
                        {t.referenced}
                      </p>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                        {msg.references.map((sid) => (
                          <button
                            key={sid}
                            onClick={() => {
                              setIsOpen(false);
                              router.push(`/schemes/${sid}`);
                            }}
                            style={{
                              background: "#eff6ff",
                              color: "#2563eb",
                              border: "1px solid #bfdbfe",
                              borderRadius: 10,
                              padding: "6px 12px",
                              fontSize: 12,
                              fontWeight: 500,
                              cursor: "pointer",
                              textAlign: "left",
                              transition: "all 0.2s"
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = "#2563eb";
                              e.currentTarget.style.color = "#fff";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = "#eff6ff";
                              e.currentTarget.style.color = "#2563eb";
                            }}
                          >
                            🏛️ {schemesMap[sid] || sid.replace(/_/g, " ")} →
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {/* Wave typing loading indicator */}
              {loading && (
                <div
                  style={{
                    alignSelf: "flex-start",
                    background: "#fff",
                    borderRadius: "18px 18px 18px 2px",
                    padding: "16px 20px",
                    display: "flex",
                    gap: 4,
                    alignItems: "center",
                    boxShadow: "0 4px 10px rgba(0,0,0,0.03)",
                    border: "1px solid #f3f4f6"
                  }}
                >
                  <div className="dot" style={{ width: 6, height: 6, background: "#9ca3af", borderRadius: "50%", animation: "bounce 1.4s infinite ease-in-out both" }} />
                  <div className="dot" style={{ width: 6, height: 6, background: "#9ca3af", borderRadius: "50%", animation: "bounce 1.4s infinite ease-in-out both 0.2s" }} />
                  <div className="dot" style={{ width: 6, height: 6, background: "#9ca3af", borderRadius: "50%", animation: "bounce 1.4s infinite ease-in-out both 0.4s" }} />
                </div>
              )}

              {/* Suggestions Panel for starting chat */}
              {messages.length === 1 && !loading && (
                <div style={{ marginTop: 10 }}>
                  <p style={{ fontSize: 12, color: "#9ca3af", fontWeight: 600, margin: "0 0 10px" }}>⚡ POPULAR SUGGESTIONS</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {t.suggestions.map((s, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSend(s)}
                        style={{
                          textAlign: "left",
                          background: "#fff",
                          border: "1px solid #e5e7eb",
                          borderRadius: 14,
                          padding: "12px 16px",
                          fontSize: 13,
                          color: "#4b5563",
                          cursor: "pointer",
                          transition: "all 0.2s",
                          fontWeight: 500
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = "#7c3aed";
                          e.currentTarget.style.color = "#7c3aed";
                          e.currentTarget.style.background = "#fdfaff";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = "#e5e7eb";
                          e.currentTarget.style.color = "#4b5563";
                          e.currentTarget.style.background = "#fff";
                        }}
                      >
                        💡 {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              style={{
                background: "#fff",
                borderTop: "1px solid #f3f4f6",
                padding: "16px 16px 32px",
                display: "flex",
                gap: 8
              }}
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={t.placeholder}
                disabled={loading}
                style={{
                  flex: 1,
                  border: "1px solid #e5e7eb",
                  borderRadius: 14,
                  padding: "12px 16px",
                  fontSize: 14,
                  outline: "none",
                  boxSizing: "border-box"
                }}
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                style={{
                  background: "linear-gradient(135deg, #7c3aed 0%, #2563eb 100%)",
                  color: "#fff",
                  border: "none",
                  borderRadius: 14,
                  padding: "0 20px",
                  fontSize: 15,
                  fontWeight: 600,
                  cursor: "pointer",
                  opacity: loading || !input.trim() ? 0.6 : 1
                }}
              >
                Send
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Embedded Animations Stylesheet */}
      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0); }
          40% { transform: scale(1.0); }
        }
      `}</style>
    </>
  );
}
