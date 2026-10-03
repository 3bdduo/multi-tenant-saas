"use client";

import { useState, FormEvent, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { chatWithAssistant } from "@/lib/api/assistant";

interface ChatEntry {
  from: "user" | "ai";
  text: string;
  route?: string | null;
}

const QUICK_SUGGESTIONS = [
  { label: "🏥 احجز كشف عند طبيب", message: "عايز احجز كشف عند طبيب" },
  { label: "🚨 إرسال بلاغ طوارئ", message: "عايز أبعت بلاغ طوارئ" },
  { label: "👨‍⚕️ أنا طبيب وعايز أسجّل", message: "أنا طبيب وعايز أسجل وأدير عيادتي" },
  { label: "🏨 تسجيل مستشفى", message: "عايز أسجّل مستشفى في المنصة" },
  { label: "📋 متابعة حالة طوارئ", message: "عايز أتابع حالة طوارئ بعتها" },
  { label: "🔐 نسيت كلمة السر", message: "نسيت كلمة السر بتاعتي" },
];

export function AssistantChatModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const auth = useAuth();
  const [entries, setEntries] = useState<ChatEntry[]>([
    {
      from: "ai",
      text: "أهلًا! أنا مساعدك الذكي في منصة نبض 👋\nاختار من الاقتراحات أو اكتب سؤالك وهوديك للمكان الصح.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Trigger slide-in animation
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 10);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [entries, loading]);

  function handleClose() {
    setVisible(false);
    setTimeout(onClose, 300);
  }

  async function sendMessage(message: string) {
    if (!message.trim() || loading) return;
    setEntries((prev) => [...prev, { from: "user", text: message }]);
    setInput("");
    setLoading(true);
    try {
      const res = await chatWithAssistant(message, auth?.role || undefined);
      setEntries((prev) => [
        ...prev,
        { from: "ai", text: res.data.reply, route: res.data.route },
      ]);
    } catch {
      setEntries((prev) => [
        ...prev,
        { from: "ai", text: "معلش، حصل خطأ. جرب تاني بعد شوية." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    await sendMessage(input.trim());
  }

  const showSuggestions = entries.length === 1;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={handleClose}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 999998,
          background: "rgba(0,0,0,0.5)",
          backdropFilter: "blur(3px)",
          opacity: visible ? 1 : 0,
          transition: "opacity 0.3s ease",
        }}
      />

      {/* Side Panel */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          width: "min(440px, 100vw)",
          zIndex: 999999,
          display: "flex",
          flexDirection: "column",
          background: "var(--color-surface, #0d1117)",
          borderLeft: "1px solid var(--color-border, rgba(255,255,255,0.1))",
          boxShadow: "-12px 0 48px rgba(0,0,0,0.5)",
          transform: visible ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.32s cubic-bezier(0.32,0.72,0,1)",
        }}
      >
        {/* Header */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "16px 20px",
          borderBottom: "1px solid var(--color-border, rgba(255,255,255,0.1))",
          background: "var(--color-surface-raised, rgba(255,255,255,0.03))",
          flexShrink: 0,
        }}>
          <div style={{
            width: 44, height: 44, borderRadius: "50%",
            background: "linear-gradient(135deg, var(--color-primary,#2EC4B6), var(--color-accent,#FF8B45))",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
            boxShadow: "0 0 18px rgba(46,196,182,0.4)",
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 8V4H8" />
              <rect width="16" height="12" x="4" y="8" rx="2" />
              <path d="M2 14h2" /><path d="M20 14h2" />
              <path d="M15 13v2" /><path d="M9 13v2" />
            </svg>
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "var(--color-text-primary,#fff)" }}>
              المساعد الذكي
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
              <span style={{
                width: 7, height: 7, borderRadius: "50%",
                background: "#22c55e", boxShadow: "0 0 6px #22c55e",
                display: "inline-block",
              }} />
              <span style={{ fontSize: 12, color: "var(--color-text-secondary,#888)" }}>متاح دايمًا</span>
            </div>
          </div>
          <button
            onClick={handleClose}
            aria-label="إغلاق"
            style={{
              width: 36, height: 36, borderRadius: "50%",
              border: "1px solid var(--color-border,rgba(255,255,255,0.1))",
              background: "transparent",
              color: "var(--color-text-secondary,#888)",
              cursor: "pointer", fontSize: 16,
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "background 0.2s",
            }}
            onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.07)")}
            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
          >✕</button>
        </div>

        {/* Messages */}
        <div ref={scrollRef} style={{
          flex: 1, overflowY: "auto",
          padding: "20px 16px",
          display: "flex", flexDirection: "column", gap: 12,
        }}>
          {entries.map((entry, i) => (
            <div key={i} style={{ display: "flex", justifyContent: entry.from === "user" ? "flex-start" : "flex-end" }}>
              <div style={{
                maxWidth: "82%",
                borderRadius: entry.from === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                padding: "12px 16px",
                fontSize: 14, lineHeight: 1.65,
                ...(entry.from === "user"
                  ? {
                      background: "var(--color-surface-raised,rgba(255,255,255,0.07))",
                      border: "1px solid var(--color-border,rgba(255,255,255,0.1))",
                      color: "var(--color-text-primary,#fff)",
                    }
                  : {
                      background: "linear-gradient(135deg,rgba(46,196,182,0.14),rgba(46,196,182,0.07))",
                      border: "1px solid rgba(46,196,182,0.25)",
                      color: "var(--color-text-primary,#fff)",
                    }),
              }}>
                <p style={{ margin: 0, whiteSpace: "pre-wrap" }}>{entry.text}</p>
                {entry.route && (
                  <button
                    onClick={() => { router.push(entry.route!); handleClose(); }}
                    style={{
                      marginTop: 10, width: "100%", borderRadius: 10,
                      border: "none", background: "var(--color-primary,#2EC4B6)",
                      color: "#fff", fontSize: 13, fontWeight: 700,
                      padding: "9px 14px", cursor: "pointer", transition: "opacity 0.2s",
                    }}
                    onMouseEnter={e => (e.currentTarget.style.opacity = "0.85")}
                    onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
                  >خدني هناك ←</button>
                )}
              </div>
            </div>
          ))}

          {/* Typing dots */}
          {loading && (
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <div style={{
                borderRadius: "18px 18px 18px 4px", padding: "14px 18px",
                background: "linear-gradient(135deg,rgba(46,196,182,0.14),rgba(46,196,182,0.07))",
                border: "1px solid rgba(46,196,182,0.25)",
                display: "flex", gap: 5, alignItems: "center",
              }}>
                {[0, 0.18, 0.36].map((d, i) => (
                  <span key={i} style={{
                    width: 7, height: 7, borderRadius: "50%",
                    background: "var(--color-primary,#2EC4B6)", display: "inline-block",
                    animation: "chat-bounce 1.2s infinite", animationDelay: `${d}s`,
                  }} />
                ))}
              </div>
            </div>
          )}

          {/* Quick suggestions — only shown before first user message */}
          {showSuggestions && (
            <div style={{ marginTop: 4 }}>
              <p style={{
                fontSize: 11, fontWeight: 600, letterSpacing: "0.05em",
                color: "var(--color-text-secondary,#888)",
                textAlign: "center", marginBottom: 10, textTransform: "uppercase",
              }}>اقتراحات سريعة</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {QUICK_SUGGESTIONS.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(s.message)}
                    style={{
                      width: "100%", textAlign: "right",
                      padding: "11px 14px", borderRadius: 12,
                      border: "1px solid var(--color-border,rgba(255,255,255,0.1))",
                      background: "var(--color-surface-raised,rgba(255,255,255,0.04))",
                      color: "var(--color-text-primary,#fff)",
                      fontSize: 13, fontWeight: 500,
                      cursor: "pointer", transition: "all 0.18s",
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = "rgba(46,196,182,0.12)";
                      e.currentTarget.style.borderColor = "rgba(46,196,182,0.4)";
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = "var(--color-surface-raised,rgba(255,255,255,0.04))";
                      e.currentTarget.style.borderColor = "var(--color-border,rgba(255,255,255,0.1))";
                    }}
                  >{s.label}</button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} style={{
          display: "flex", alignItems: "center", gap: 10,
          padding: "14px 16px",
          borderTop: "1px solid var(--color-border,rgba(255,255,255,0.1))",
          background: "var(--color-surface-raised,rgba(255,255,255,0.03))",
          flexShrink: 0,
        }}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="اكتب سؤالك هنا..."
            autoFocus
            style={{
              flex: 1, borderRadius: 12,
              border: "1px solid var(--color-border,rgba(255,255,255,0.12))",
              background: "transparent",
              color: "var(--color-text-primary,#fff)",
              fontSize: 14, padding: "11px 14px",
              outline: "none", minHeight: 44, transition: "border-color 0.2s",
            }}
            onFocus={e => (e.currentTarget.style.borderColor = "var(--color-primary,#2EC4B6)")}
            onBlur={e => (e.currentTarget.style.borderColor = "var(--color-border,rgba(255,255,255,0.12))")}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            aria-label="إرسال"
            style={{
              width: 44, height: 44, borderRadius: 12,
              border: "none", background: "var(--color-primary,#2EC4B6)",
              color: "#fff", cursor: loading || !input.trim() ? "not-allowed" : "pointer",
              opacity: loading || !input.trim() ? 0.4 : 1,
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0, transition: "opacity 0.2s",
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </form>
      </div>

      <style>{`
        @keyframes chat-bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-5px); }
        }
      `}</style>
    </>
  );
}
