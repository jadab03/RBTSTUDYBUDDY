import { useState, useEffect } from "react";
import { C } from "../data/constants.js";
import { REFLECT_SYS, REFLECT_EVAL } from "../data/prompts.js";
import { safeJSON, parseDomainString } from "../utils/helpers.js";
import { callClaude } from "../utils/api.js";

export default function ReflectModal({ topics, onClose, onMU, onBE }) {
  const [ph, setPh] = useState("loading");
  const [q, setQ] = useState("");
  const [ans, setAns] = useState("");
  const [res, setRes] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const raw = await callClaude(REFLECT_SYS, [{ role: "user", content: `Topics: ${topics.join(", ")}` }], 120);
        setQ(raw || "How would you apply today's concepts in a real session?");
      } catch {
        setQ("How would you apply today's concepts in a real session?");
      }
      setPh("prompt");
    })();
  }, []);

  const submit = async () => {
    if (!ans.trim() || busy) return;
    setBusy(true);
    try {
      const raw = await callClaude(REFLECT_EVAL, [{ role: "user", content: `Q:${q}\nA:${ans}` }], 300);
      const p = safeJSON(raw);
      if (p?.domainDeltas) onMU(parseDomainString(p.domainDeltas), 1.2);
      onBE("reflected");
      setRes(p || { praise: "Great reflection!", insight: "Keep connecting theory to practice." });
      setPh("result");
    } catch {
      setRes({ praise: "Thoughtful!", insight: "Keep connecting theory to practice." });
      setPh("result");
    }
    setBusy(false);
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(42,36,32,.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: "24px" }}>
      <div style={{ background: C.surface, borderRadius: "19px", padding: "28px 24px", width: "100%", maxWidth: "440px", boxShadow: "0 20px 60px rgba(42,36,32,.18)" }}>
        <div style={{ height: "3px", background: `linear-gradient(90deg,${C.teal},${C.rose})`, borderRadius: "2px", marginBottom: "18px" }} />

        {ph === "loading" && <div style={{ textAlign: "center", color: C.sandDark, padding: "16px", fontStyle: "italic" }}>Crafting your reflection prompt…</div>}

        {(ph === "prompt" || ph === "answering") && (
          <>
            <div style={{ fontSize: "11px", color: C.roseDark, fontWeight: "800", letterSpacing: "0.6px", textTransform: "uppercase", marginBottom: "9px" }}>Reflection</div>
            <div style={{ fontSize: "15px", fontWeight: "600", color: C.charcoal, fontFamily: "'Lora',serif", lineHeight: "1.55", marginBottom: "14px" }}>{q}</div>
            <textarea
              value={ans}
              rows={4}
              placeholder="Take a moment to reflect…"
              onChange={(e) => { setAns(e.target.value); if (ph === "prompt") setPh("answering"); }}
              style={{ width: "100%", padding: "10px 12px", borderRadius: "10px", border: `1.5px solid ${C.border}`, fontSize: "14px", fontFamily: "'Nunito',sans-serif", color: C.charcoal, background: C.alt, resize: "vertical", lineHeight: "1.6", marginBottom: "11px" }}
            />
            <div style={{ display: "flex", gap: "8px" }}>
              <button className="bt" style={{ flex: 1, padding: "10px", fontSize: "14px", opacity: ans.trim() && !busy ? 1 : 0.45 }} onClick={submit}>
                {busy ? "Reflecting\u2026" : "Submit"}
              </button>
              <button className="bg" style={{ padding: "10px 15px", fontSize: "14px" }} onClick={onClose}>Skip</button>
            </div>
          </>
        )}

        {ph === "result" && (
          <>
            <div style={{ fontSize: "11px", color: C.roseDark, fontWeight: "800", letterSpacing: "0.6px", textTransform: "uppercase", marginBottom: "13px" }}>Reflection Complete</div>
            <div style={{ background: C.blush, borderRadius: "10px", padding: "11px 13px", marginBottom: "10px", borderLeft: `3px solid ${C.rose}` }}>
              <div style={{ fontSize: "14px", color: C.sandDeep, lineHeight: "1.65" }}>{res?.praise}</div>
            </div>
            <div style={{ background: `${C.mint}50`, borderRadius: "10px", padding: "11px 13px", marginBottom: "16px", borderLeft: `3px solid ${C.teal}` }}>
              <div style={{ fontSize: "12px", fontWeight: "800", color: C.tealDark, marginBottom: "3px" }}>Deeper insight</div>
              <div style={{ fontSize: "13px", color: C.sandDeep, lineHeight: "1.65" }}>{res?.insight}</div>
            </div>
            <button className="bt" style={{ width: "100%", padding: "10px", fontSize: "14px" }} onClick={onClose}>Done</button>
          </>
        )}
      </div>
    </div>
  );
}
