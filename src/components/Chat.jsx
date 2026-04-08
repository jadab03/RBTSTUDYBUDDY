import { useState, useRef, useEffect } from "react";
import { C, SKILL_LEVELS, DOMAINS } from "../data/constants.js";
import { CHAT_SYS } from "../data/prompts.js";
import { parseMeta, stripMeta, mdToHtml, today } from "../utils/helpers.js";
import { callClaude } from "../utils/api.js";
import ReflectModal from "./ReflectModal.jsx";

export default function Chat({ ud, onMU, onBE, onSE }) {
  const lvl = SKILL_LEVELS.find((s) => s.id === ud.skillLevel)?.label || "";
  const [msgs, setMsgs] = useState([
    { role: "assistant", content: `Hi ${ud.username}! \u{1F44B} I'm your RBT study buddy.\n\nYou're **${lvl}** \u2014 let's build on that! Your domain mastery grows as we chat. After a few exchanges I'll offer a reflection prompt.\n\nWhat would you like to work on today?` },
  ]);
  const [input, setInput] = useState("");
  const [load, setLoad] = useState(false);
  const [topics, setTopics] = useState([]);
  const [showR, setShowR] = useState(false);
  const [count, setCount] = useState(0);
  const bot = useRef(null);

  useEffect(() => { bot.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs]);

  const send = async () => {
    const t = input.trim();
    if (!t || load) return;
    setInput("");
    const next = [...msgs, { role: "user", content: t }];
    setMsgs(next);
    setLoad(true);
    try {
      const raw = await callClaude(CHAT_SYS(ud.username, lvl), next.map((m) => ({ role: m.role, content: m.content })));
      const deltas = parseMeta(raw);
      const clean = stripMeta(raw);
      if (deltas) {
        onMU(deltas, 1.8);
        setTopics((p) => {
          const nt = [...new Set([...p, ...Object.entries(deltas).filter(([, v]) => v > 0).map(([k]) => k)])];
          if (nt.length >= 6) onBE("all_domains");
          return nt;
        });
      }
      const nc = count + 1;
      setCount(nc);
      if (nc === 1) onBE("first_chat");
      setMsgs((p) => [...p, { role: "assistant", content: clean }]);
    } catch {
      setMsgs((p) => [...p, { role: "assistant", content: "Something went wrong. Please try again." }]);
    }
    setLoad(false);
  };

  const endSession = () => {
    onSE({
      type: "chat",
      date: today(),
      summary: `Studied ${topics.length} domain${topics.length !== 1 ? "s" : ""}: ${topics.map((t) => DOMAINS.find((d) => d.id === t)?.label || t).join(", ") || "general RBT concepts"}`,
      xpGained: Math.min(30, count * 3),
    });
  };

  return (
    <>
      {showR && <ReflectModal topics={topics} onClose={() => setShowR(false)} onMU={onMU} onBE={onBE} />}
      <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 57px)" }}>
        {count >= 3 && !showR && (
          <div style={{ background: C.blush, borderBottom: `1px solid ${C.rose}`, padding: "9px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", flexShrink: 0 }}>
            <span style={{ fontSize: "13px", color: C.roseDeep, fontWeight: "600" }}>{"\u{1FA9E}"} Ready to deepen your learning with a reflection?</span>
            <div style={{ display: "flex", gap: "8px" }}>
              <button className="br" style={{ padding: "6px 14px", fontSize: "12px", flexShrink: 0 }} onClick={() => setShowR(true)}>Reflect</button>
              <button className="bg" style={{ padding: "6px 14px", fontSize: "12px", flexShrink: 0 }} onClick={endSession}>End Session</button>
            </div>
          </div>
        )}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px", display: "flex", flexDirection: "column", gap: "13px" }}>
          {msgs.map((m, i) => (
            <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: m.role === "user" ? "flex-end" : "flex-start" }}>
              {m.role === "assistant" && (
                <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "5px" }}>
                  <div style={{ width: "26px", height: "26px", borderRadius: "50%", background: C.teal, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px" }}>{"\u{1F9E0}"}</div>
                  <span style={{ fontSize: "12px", color: C.sandDark, fontWeight: "700" }}>Study Buddy</span>
                </div>
              )}
              <div
                dangerouslySetInnerHTML={{ __html: mdToHtml(m.content) }}
                style={{ maxWidth: "74%", padding: "11px 15px", borderRadius: m.role === "user" ? "14px 14px 3px 14px" : "14px 14px 14px 3px", fontSize: "14px", lineHeight: "1.65", background: m.role === "user" ? C.teal : C.surface, color: m.role === "user" ? "#fff" : C.charcoal, boxShadow: m.role === "user" ? "none" : "0 2px 10px rgba(61,84,80,.08)" }}
              />
            </div>
          ))}
          {load && <div style={{ alignSelf: "flex-start", background: C.surface, borderRadius: "14px 14px 14px 3px", padding: "11px 15px", boxShadow: "0 2px 10px rgba(61,84,80,.08)", color: C.sandDark, fontStyle: "italic", fontSize: "14px" }}>Thinking\u2026</div>}
          <div ref={bot} />
        </div>
        <div style={{ padding: "11px 24px 14px", background: C.surface, borderTop: `1px solid ${C.border}`, display: "flex", gap: "9px", alignItems: "flex-end" }}>
          <textarea
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
            placeholder="Ask a question or say 'quiz me on reinforcement'\u2026"
            style={{ flex: 1, padding: "10px 13px", borderRadius: "10px", border: `1.5px solid ${C.border}`, fontSize: "14px", fontFamily: "'Nunito',sans-serif", color: C.charcoal, background: C.alt, resize: "none", maxHeight: "120px", lineHeight: "1.5" }}
          />
          <button
            onClick={send}
            disabled={load}
            style={{ width: "42px", height: "42px", borderRadius: "10px", border: "none", background: C.teal, color: "#fff", fontSize: "17px", cursor: "pointer", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", transition: "background .14s" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = C.tealDark)}
            onMouseLeave={(e) => (e.currentTarget.style.background = C.teal)}
          >
            {"\u27A4"}
          </button>
        </div>
      </div>
    </>
  );
}
