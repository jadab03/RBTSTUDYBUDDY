import { useState } from "react";
import { C, SKILL_LEVELS, DOMAINS } from "../data/constants.js";
import { ROADMAP_SYS } from "../data/prompts.js";
import { safeJSON } from "../utils/helpers.js";
import { callClaude } from "../utils/api.js";
import { Card } from "./ui.jsx";

export default function Roadmap({ ud, onSave, onBE }) {
  const [phase, setPhase] = useState(ud.roadmap ? "view" : "setup");
  const [examDate, setExamDate] = useState(ud.examDate || "");
  const [gen, setGen] = useState(false);
  const [rm, setRm] = useState(ud.roadmap || null);
  const [aw, setAw] = useState(0);

  const dL = (id) => DOMAINS.find((d) => d.id === id)?.label || id;
  const dC = (id) => DOMAINS.find((d) => d.id === id)?.color || C.teal;
  const aI = { flashcards: "\u{1F0CF}", scenarios: "\u{1F3AF}", chat: "\u{1F4AC}", reflect: "\u{1FA9E}" };

  const generate = async () => {
    setGen(true);
    try {
      const lvl = SKILL_LEVELS.find((s) => s.id === ud.skillLevel)?.label || "";
      const ms = DOMAINS.map((d) => `${d.label}:${ud.mastery[d.id]}%`).join(", ");
      const prompt = `Username: ${ud.username}\nLevel: ${lvl}\nMastery: ${ms}\nExam date: ${examDate || "not set"}\nSessions: ${ud.totalSessions}\nScenarios: ${ud.scenariosCompleted.length}/${15}`;
      const raw = await callClaude(ROADMAP_SYS, [{ role: "user", content: prompt }], 2000);
      const p = safeJSON(raw);
      if (p) { setRm(p); onSave(p, examDate); onBE("roadmap_done"); setAw(0); setPhase("view"); }
    } catch (e) { console.error(e); }
    setGen(false);
  };

  // ── SETUP ─────────────────────────────────────────────────────────────────
  if (phase === "setup")
    return (
      <div className="pg" style={{ padding: "24px 28px", maxWidth: "560px" }}>
        <div style={{ marginBottom: "20px" }}>
          <div style={{ fontSize: "22px", fontWeight: "800", color: C.charcoal, fontFamily: "'Lora',serif", marginBottom: "3px" }}>Study Roadmap</div>
          <div style={{ fontSize: "13px", color: C.sandDark }}>Get a personalized week-by-week plan based on your mastery</div>
        </div>
        <Card style={{ marginBottom: "18px" }}>
          <div style={{ fontSize: "13px", fontWeight: "800", color: C.charcoal, marginBottom: "12px" }}>Your Current Mastery</div>
          {DOMAINS.map((d) => (
            <div key={d.id} style={{ marginBottom: "9px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "3px", fontSize: "12px" }}>
                <span style={{ color: C.sandDeep, fontWeight: "600" }}>{d.label}</span>
                <span style={{ color: C.sandDark, fontWeight: "700" }}>{ud.mastery[d.id]}%</span>
              </div>
              <div style={{ height: "5px", background: C.cream, borderRadius: "999px", overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${ud.mastery[d.id]}%`, background: d.color, borderRadius: "999px" }} />
              </div>
            </div>
          ))}
        </Card>
        <Card style={{ marginBottom: "20px" }}>
          <label style={{ fontSize: "13px", fontWeight: "700", color: C.charcoal, display: "block", marginBottom: "8px" }}>
            {"\u{1F4C5}"} Target Exam Date <span style={{ color: C.sandDark, fontWeight: "400" }}>(optional)</span>
          </label>
          <input type="date" value={examDate} onChange={(e) => setExamDate(e.target.value)} style={{ width: "100%", padding: "10px 13px", borderRadius: "9px", border: `1.5px solid ${C.border}`, fontSize: "14px", fontFamily: "'Nunito',sans-serif", color: C.charcoal, background: C.alt }} />
          <div style={{ fontSize: "12px", color: C.sandDark, marginTop: "6px" }}>Adding a date helps calibrate the pace of your plan.</div>
        </Card>
        <button className="bt" style={{ width: "100%", padding: "13px", fontSize: "15px", opacity: gen ? 0.6 : 1 }} onClick={generate} disabled={gen}>
          {gen ? "Building your roadmap\u2026" : "Generate My Roadmap \u2192"}
        </button>
        {gen && <div style={{ textAlign: "center", fontSize: "13px", color: C.sandDark, marginTop: "12px", fontStyle: "italic" }}>Analyzing your mastery and crafting a personalized plan\u2026</div>}
      </div>
    );

  // ── VIEW ──────────────────────────────────────────────────────────────────
  if (!rm) return null;
  const w = rm.weeks?.[aw];
  return (
    <div className="pg" style={{ padding: "24px 28px" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "20px", gap: "12px", flexWrap: "wrap" }}>
        <div>
          <div style={{ fontSize: "22px", fontWeight: "800", color: C.charcoal, fontFamily: "'Lora',serif", marginBottom: "3px" }}>Your Study Roadmap</div>
          <div style={{ fontSize: "13px", color: C.sandDark }}>{rm.estimatedWeeks}-week personalized plan</div>
        </div>
        <button className="bg" style={{ padding: "8px 16px", fontSize: "12px" }} onClick={() => setPhase("setup")}>Regenerate</button>
      </div>

      <div style={{ background: `linear-gradient(135deg,${C.mint}40,${C.blush}40)`, borderRadius: "14px", padding: "16px 20px", marginBottom: "18px", border: `1px solid ${C.border}` }}>
        <div style={{ fontSize: "15px", fontWeight: "600", color: C.charcoal, fontFamily: "'Lora',serif", fontStyle: "italic", lineHeight: "1.5" }}>"{rm.headline}"</div>
      </div>

      {rm.priorityDomains?.length > 0 && (
        <Card style={{ marginBottom: "16px" }}>
          <div style={{ fontSize: "13px", fontWeight: "800", color: C.charcoal, marginBottom: "10px" }}>{"\u{1F3AF}"} Priority Focus Areas</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {rm.priorityDomains.map((id) => (
              <span key={id} style={{ padding: "5px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "700", background: `${dC(id)}18`, color: dC(id), border: `1px solid ${dC(id)}40` }}>
                {dL(id)} \u2014 {ud.mastery[id]}%
              </span>
            ))}
          </div>
        </Card>
      )}

      <div style={{ display: "flex", gap: "6px", marginBottom: "14px", flexWrap: "wrap" }}>
        {rm.weeks?.map((wk, i) => (
          <button key={i} onClick={() => setAw(i)} style={{ padding: "7px 14px", borderRadius: "20px", border: `1.5px solid ${aw === i ? C.teal : C.border}`, background: aw === i ? C.teal : "transparent", color: aw === i ? "#fff" : C.sandDeep, fontSize: "12px", fontWeight: "700", cursor: "pointer", fontFamily: "'Nunito',sans-serif", transition: "all .14s" }}>
            Week {wk.week}
          </button>
        ))}
      </div>

      {w && (
        <Card style={{ marginBottom: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: C.teal, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: "800", fontSize: "15px", flexShrink: 0 }}>{w.week}</div>
            <div>
              <div style={{ fontSize: "16px", fontWeight: "800", color: C.charcoal, fontFamily: "'Lora',serif" }}>{w.theme}</div>
              <div style={{ display: "flex", gap: "6px", marginTop: "4px", flexWrap: "wrap" }}>
                {w.focus?.map((id) => <span key={id} style={{ fontSize: "11px", fontWeight: "700", padding: "2px 8px", borderRadius: "20px", background: `${dC(id)}15`, color: dC(id), border: `1px solid ${dC(id)}30` }}>{dL(id)}</span>)}
              </div>
            </div>
          </div>

          <div style={{ marginBottom: "16px" }}>
            <div style={{ fontSize: "12px", fontWeight: "800", color: C.charcoal, textTransform: "uppercase", letterSpacing: "0.4px", marginBottom: "8px" }}>Weekly Goals</div>
            {w.goals?.map((g, i) => (
              <div key={i} style={{ display: "flex", gap: "9px", marginBottom: "7px", alignItems: "flex-start" }}>
                <div style={{ width: "20px", height: "20px", borderRadius: "50%", background: C.mint, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: "800", color: C.teal, flexShrink: 0, marginTop: "1px" }}>{i + 1}</div>
                <div style={{ fontSize: "14px", color: C.sandDeep, lineHeight: "1.5" }}>{g}</div>
              </div>
            ))}
          </div>

          <div style={{ marginBottom: "16px" }}>
            <div style={{ fontSize: "12px", fontWeight: "800", color: C.charcoal, textTransform: "uppercase", letterSpacing: "0.4px", marginBottom: "8px" }}>Daily Activities</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
              {w.activities?.map((a, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 13px", borderRadius: "10px", background: C.alt, border: `1px solid ${C.border}` }}>
                  <span style={{ fontSize: "18px", flexShrink: 0 }}>{aI[a.type] || "\u{1F4CC}"}</span>
                  <div style={{ flex: 1 }}><div style={{ fontSize: "13px", fontWeight: "600", color: C.charcoal }}>{a.description}</div></div>
                  <span style={{ fontSize: "11px", color: C.sandDark, fontWeight: "700", flexShrink: 0, background: C.cream, padding: "3px 8px", borderRadius: "6px" }}>{a.duration}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: `${C.mint}40`, borderRadius: "10px", padding: "12px 14px", borderLeft: `3px solid ${C.teal}` }}>
            <div style={{ fontSize: "12px", fontWeight: "800", color: C.tealDark, marginBottom: "3px" }}>{"\u{1F3C1}"} End of Week Goal</div>
            <div style={{ fontSize: "13px", color: C.sandDeep, lineHeight: "1.5" }}>{w.milestone}</div>
          </div>
        </Card>
      )}

      {rm.examTips?.length > 0 && (
        <Card>
          <div style={{ fontSize: "13px", fontWeight: "800", color: C.charcoal, marginBottom: "12px" }}>{"\u{1F4A1}"} Exam Tips</div>
          {rm.examTips.map((t, i) => (
            <div key={i} style={{ display: "flex", gap: "9px", marginBottom: i < rm.examTips.length - 1 ? "10px" : 0, paddingBottom: i < rm.examTips.length - 1 ? "10px" : 0, borderBottom: i < rm.examTips.length - 1 ? `1px solid ${C.cream}` : 0 }}>
              <span style={{ color: C.rose, fontWeight: "800", flexShrink: 0 }}>{"\u2726"}</span>
              <span style={{ fontSize: "13px", color: C.sandDeep, lineHeight: "1.6" }}>{t}</span>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}
