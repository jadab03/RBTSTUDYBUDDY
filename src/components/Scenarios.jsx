import { useState } from "react";
import { C, DOMAINS } from "../data/constants.js";
import { SCENARIOS } from "../data/scenarios.js";
import { SCENARIO_SYS } from "../data/prompts.js";
import { safeJSON, parseDomainString } from "../utils/helpers.js";
import { callClaude } from "../utils/api.js";

function ScenarioCard({ s, done, onMU, onBE, onDone }) {
  const [ans, setAns] = useState("");
  const [res, setRes] = useState(null);
  const [load, setLoad] = useState(false);
  const [open, setOpen] = useState(false);

  const submit = async () => {
    if (!ans.trim() || load) return;
    setLoad(true);
    try {
      const raw = await callClaude(SCENARIO_SYS, [{ role: "user", content: `Scenario:${s.scenario}\nRubric:${s.rubric}\nAnswer:${ans}` }], 400);
      const p = safeJSON(raw);
      if (p?.domainDeltas) onMU(parseDomainString(p.domainDeltas), 1.5);
      onBE("first_scenario");
      if (p?.score === "correct") onBE("scenario_perf");
      onDone(s.id, p?.score || "incorrect");
      setRes(p || { score: "incorrect", feedback: "Could not evaluate.", keyTakeaway: "" });
    } catch {
      setRes({ score: "incorrect", feedback: "Could not evaluate.", keyTakeaway: "" });
    }
    setLoad(false);
  };

  const bS = {
    correct:   { bg: "#F0FDF4", border: "#86EFAC", color: "#15803D", label: "Correct" },
    partial:   { bg: "#FFFBEB", border: "#FCD34D", color: "#B45309", label: "Partial" },
    incorrect: { bg: "#FEF2F2", border: "#FCA5A5", color: "#B91C1C", label: "Needs Review" },
  };
  const ds = {
    beginner:     { label: "Beginner",     bg: "#E8F4F0", color: "#3D7A6A", border: "#B2D8CC" },
    intermediate: { label: "Intermediate", bg: "#FEF9ED", color: "#8A6A1A", border: "#F0D888" },
    advanced:     { label: "Advanced",     bg: "#F5EAED", color: "#8A3A4A", border: "#E0A8B0" },
  }[s.difficulty] || { label: s.difficulty, bg: C.alt, color: C.sandDark, border: C.border };

  return (
    <div style={{ background: C.surface, borderRadius: "13px", marginBottom: "10px", boxShadow: "0 2px 10px rgba(61,84,80,.06)", overflow: "hidden", border: `1px solid ${done ? "#B2D8CC" : C.border}` }}>
      <div style={{ padding: "14px 18px", display: "flex", alignItems: "center", gap: "12px", cursor: "pointer", background: done ? `${C.mint}20` : C.surface }} onClick={() => setOpen((e) => !e)}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "7px", marginBottom: "4px", flexWrap: "wrap" }}>
            <span style={{ fontSize: "11px", fontWeight: "700", textTransform: "uppercase", padding: "2px 8px", borderRadius: "5px", background: C.blush, color: C.roseDark, border: `1px solid ${C.rose}` }}>{s.domain}</span>
            <span style={{ fontSize: "11px", fontWeight: "700", textTransform: "uppercase", padding: "2px 8px", borderRadius: "5px", background: ds.bg, color: ds.color, border: `1px solid ${ds.border}` }}>{ds.label}</span>
            {done && <span style={{ fontSize: "11px", fontWeight: "700", color: "#15803D", background: "#F0FDF4", padding: "2px 8px", borderRadius: "5px", border: "1px solid #86EFAC" }}>Done</span>}
          </div>
          <div style={{ fontSize: "14px", fontWeight: "700", color: C.charcoal, fontFamily: "'Lora',serif" }}>{s.title}</div>
        </div>
        <div style={{ fontSize: "18px", color: C.sandDark, transition: "transform .2s", transform: open ? "rotate(180deg)" : "none" }}>v</div>
      </div>
      {open && (
        <div style={{ padding: "0 18px 18px", borderTop: `1px solid ${C.cream}` }}>
          <div style={{ fontSize: "14px", color: C.sandDeep, lineHeight: "1.7", marginBottom: "14px", paddingTop: "14px" }}>{s.scenario}</div>
          {!res ? (
            <>
              <textarea value={ans} onChange={(e) => setAns(e.target.value)} placeholder="Type your answer here…" rows={3} style={{ width: "100%", padding: "10px 13px", borderRadius: "10px", border: `1.5px solid ${C.border}`, fontSize: "14px", fontFamily: "'Nunito',sans-serif", color: C.charcoal, background: C.alt, resize: "vertical", lineHeight: "1.6", marginBottom: "10px" }} />
              <button className="bt" style={{ padding: "9px 18px", fontSize: "13px", opacity: ans.trim() && !load ? 1 : 0.4 }} onClick={submit}>
                {load ? "Evaluating\u2026" : "Submit Answer"}
              </button>
            </>
          ) : (
            <>
              <div style={{ display: "inline-flex", alignItems: "center", padding: "5px 12px", borderRadius: "7px", background: bS[res.score]?.bg, border: `1.5px solid ${bS[res.score]?.border}`, marginBottom: "12px" }}>
                <span style={{ fontSize: "13px", fontWeight: "700", color: bS[res.score]?.color }}>{bS[res.score]?.label}</span>
              </div>
              <div style={{ background: C.alt, borderRadius: "9px", padding: "10px 12px", fontSize: "13px", color: C.sandDark, marginBottom: "10px", fontStyle: "italic", lineHeight: "1.6" }}>Your answer: "{ans}"</div>
              <div style={{ fontSize: "14px", color: C.sandDeep, lineHeight: "1.7", marginBottom: "10px" }}>{res.feedback}</div>
              {res.keyTakeaway && (
                <div style={{ background: C.blush, borderRadius: "9px", padding: "10px 12px", display: "flex", gap: "8px", alignItems: "flex-start", border: `1px solid ${C.rose}` }}>
                  <span style={{ fontSize: "14px", flexShrink: 0 }}>{"\u{1F4A1}"}</span>
                  <span style={{ fontSize: "13px", color: C.roseDeep, fontWeight: "700", lineHeight: "1.6" }}>{res.keyTakeaway}</span>
                </div>
              )}
              <button className="bg" style={{ marginTop: "12px", padding: "7px 14px", fontSize: "13px" }} onClick={() => { setRes(null); setAns(""); }}>Try Again</button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default function Scenarios({ ud, onMU, onBE, onDone }) {
  const [filter, setFilter] = useState("all");
  const [diff, setDiff] = useState("all");
  const domains = ["all", ...new Set(SCENARIOS.map((s) => s.domain))];
  const filtered = SCENARIOS.filter((s) => (filter === "all" || s.domain === filter) && (diff === "all" || s.difficulty === diff));
  const done = ud.scenariosCompleted || [];

  return (
    <div className="pg" style={{ padding: "24px 28px" }}>
      <div style={{ marginBottom: "16px" }}>
        <div style={{ fontSize: "22px", fontWeight: "800", color: C.charcoal, fontFamily: "'Lora',serif", marginBottom: "3px" }}>Real-World Scenarios</div>
        <div style={{ fontSize: "13px", color: C.sandDark }}>{done.length}/{SCENARIOS.length} completed {"\u00B7"} AI evaluates your responses</div>
      </div>
      <div style={{ marginBottom: "16px", display: "flex", flexDirection: "column", gap: "8px" }}>
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
          {domains.map((d) => (
            <button key={d} onClick={() => setFilter(d)} style={{ padding: "5px 12px", borderRadius: "20px", border: `1px solid ${filter === d ? C.teal : C.border}`, background: filter === d ? C.teal : "transparent", color: filter === d ? "#fff" : C.sandDeep, fontSize: "12px", fontWeight: "600", cursor: "pointer", fontFamily: "'Nunito',sans-serif" }}>
              {d === "all" ? "All Domains" : d}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", gap: "6px" }}>
          {["all", "beginner", "intermediate", "advanced"].map((d) => (
            <button key={d} onClick={() => setDiff(d)} style={{ padding: "4px 10px", borderRadius: "20px", border: `1px solid ${diff === d ? C.roseDark : C.border}`, background: diff === d ? C.roseDark : "transparent", color: diff === d ? "#fff" : C.sandDeep, fontSize: "11px", fontWeight: "600", cursor: "pointer", fontFamily: "'Nunito',sans-serif", textTransform: "capitalize" }}>
              {d === "all" ? "All Levels" : d}
            </button>
          ))}
        </div>
      </div>
      {filtered.map((s) => <ScenarioCard key={s.id} s={s} done={done.includes(s.id)} onMU={onMU} onBE={onBE} onDone={onDone} />)}
    </div>
  );
}
