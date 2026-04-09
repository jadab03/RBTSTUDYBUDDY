import { useState, useEffect } from "react";
import { C, SKILL_LEVELS, DOMAINS, QUESTIONNAIRE } from "../data/constants.js";
import { getQuiz } from "../data/quizzes.js";
import { INTAKE_SYS } from "../data/prompts.js";
import { safeJSON } from "../utils/helpers.js";
import { callClaude } from "../utils/api.js";
import { wrapStyle, boxStyle, Card } from "./ui.jsx";

export default function Onboarding({ user, onComplete }) {
  const [phase, setPhase] = useState("level");
  const [skillLevel, setSL] = useState(null);
  const [qIdx, setQIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [quizIdx, setQuizIdx] = useState(0);
  const [quizAnswers, setQA] = useState({});
  const [plan, setPlan] = useState(null);

  const box = (maxW = "510px") => boxStyle(maxW);

  const defaultPlan = () => ({
    welcome: `Welcome, ${user.username}! We're excited to have you here.`,
    masteryBaseline: Object.fromEntries(DOMAINS.map((d) => [d.id, 10])),
    strengths: ["You showed up \u2014 that's step one"],
    gaps: ["Review all six RBT domains systematically"],
    priorityDomains: ["measurement", "behavior_reduction"],
    day1: [
      { activity: "Review Measurement flashcards", type: "flashcards", duration: "15 min", reason: "Foundation for everything else" },
      { activity: "Answer a beginner scenario", type: "scenarios", duration: "10 min", reason: "See how knowledge applies in practice" },
      { activity: "Chat with your study buddy", type: "chat", duration: "10 min", reason: "Ask questions about anything unclear" },
    ],
    weeklyGoal: "Build familiarity with all 6 domains and identify your top 2 focus areas",
    encouragement: "Every expert started exactly where you are \u2014 let's build from here!",
  });

  const analyze = async () => {
    setPhase("analyzing");
    try {
      const lvlLabel = SKILL_LEVELS.find((s) => s.id === skillLevel)?.label || skillLevel;
      const quizPool = getQuiz(skillLevel);
      const quizSummary = quizPool
        .map((q) => {
          const ua = quizAnswers[q.id] || "skipped";
          const domLabel = DOMAINS.find((d) => d.id === q.domain)?.label || q.domain;
          return `${q.id} [${domLabel}|${q.difficulty}]: ${ua === q.answer ? "CORRECT" : "WRONG"} (selected:${ua} correct:${q.answer})`;
        })
        .join("; ");
      const qSummary = QUESTIONNAIRE.map((q) => {
        const a = answers[q.id];
        const aStr = Array.isArray(a) ? a.join("+") : a || "skipped";
        return `${q.id}:${aStr}`;
      }).join("; ");
      const prompt = `Student: ${user.username}\nLevel: ${lvlLabel}\nQuestionnaire: ${qSummary}\nQuiz: ${quizSummary}`;
      const raw = await callClaude(INTAKE_SYS, [{ role: "user", content: prompt }], 1000);
      const p = safeJSON(raw);
      setPlan(p || defaultPlan());
    } catch (e) {
      console.error(e);
      setPlan(defaultPlan());
    }
    setPhase("plan");
  };

  // ── LEVEL SELECT ──────────────────────────────────────────────────────────
  if (phase === "level")
    return (
      <div style={wrapStyle}>
        <div style={box()}>
          <div style={{ fontSize: "12px", color: C.roseDark, fontWeight: "800", letterSpacing: "0.6px", textTransform: "uppercase", marginBottom: "8px" }}>
            Hey, {user.username} {"\u{1F44B}"}
          </div>
          <div style={{ fontSize: "24px", fontWeight: "800", color: C.charcoal, marginBottom: "5px", fontFamily: "'Lora',serif" }}>Where are you in your journey?</div>
          <div style={{ fontSize: "13px", color: C.sandDark, marginBottom: "22px" }}>This is the first step in building your personalized study experience.</div>
          {SKILL_LEVELS.map((lvl) => (
            <div
              key={lvl.id}
              className="so"
              onClick={() => setSL(lvl.id)}
              style={{ display: "flex", alignItems: "center", gap: "13px", padding: "13px 15px", borderRadius: "13px", marginBottom: "9px", border: `1.5px solid ${skillLevel === lvl.id ? C.teal : C.border}`, background: skillLevel === lvl.id ? `${C.mint}50` : C.surface }}
            >
              <div style={{ fontSize: "22px", flexShrink: 0 }}>{lvl.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "14px", fontWeight: "700", color: C.charcoal }}>{lvl.label}</div>
                <div style={{ fontSize: "12px", color: C.sandDark, marginTop: "2px" }}>{lvl.desc}</div>
              </div>
              {skillLevel === lvl.id && <div style={{ color: C.teal, fontWeight: "800", fontSize: "16px" }}>{"\u2713"}</div>}
            </div>
          ))}
          <button className="bt" style={{ width: "100%", padding: "13px", fontSize: "15px", marginTop: "10px", opacity: skillLevel ? 1 : 0.45 }} onClick={() => { if (skillLevel) setPhase("questionnaire"); }}>
            Next: Quick Questionnaire {"\u2192"}
          </button>
        </div>
      </div>
    );

  // ── QUESTIONNAIRE ─────────────────────────────────────────────────────────
  if (phase === "questionnaire") {
    const q = QUESTIONNAIRE[qIdx];
    const isMulti = q.type === "multi";
    const cur = answers[q.id];
    const canAdvance = isMulti ? cur && cur.length > 0 : !!cur;
    const prog = Math.round((qIdx / QUESTIONNAIRE.length) * 100);
    const toggleMulti = (oid) => {
      const prev = answers[q.id] || [];
      const next = prev.includes(oid) ? prev.filter((x) => x !== oid) : [...prev, oid];
      setAnswers((a) => ({ ...a, [q.id]: next }));
    };
    return (
      <div style={wrapStyle}>
        <div style={box("580px")}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <div style={{ fontSize: "12px", color: C.sandDark, fontWeight: "700" }}>{qIdx + 1} of {QUESTIONNAIRE.length}</div>
            <div style={{ fontSize: "12px", color: C.tealDark, fontWeight: "700" }}>Questionnaire</div>
          </div>
          <div style={{ height: "4px", background: C.cream, borderRadius: "999px", overflow: "hidden", marginBottom: "28px" }}>
            <div style={{ height: "100%", width: `${prog}%`, background: C.teal, borderRadius: "999px", transition: "width .3s" }} />
          </div>
          <div style={{ fontSize: "18px", fontWeight: "800", color: C.charcoal, fontFamily: "'Lora',serif", lineHeight: "1.4", marginBottom: "6px" }}>{q.question}</div>
          {isMulti && <div style={{ fontSize: "12px", color: C.sandDark, marginBottom: "14px" }}>Select all that apply</div>}
          {!isMulti && <div style={{ height: "14px" }} />}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "24px" }}>
            {q.options.map((opt) => {
              const selected = isMulti ? (answers[q.id] || []).includes(opt.id) : answers[q.id] === opt.id;
              return (
                <div key={opt.id} className="so" onClick={() => (isMulti ? toggleMulti(opt.id) : setAnswers((a) => ({ ...a, [q.id]: opt.id })))} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 15px", borderRadius: "12px", border: `1.5px solid ${selected ? C.teal : C.border}`, background: selected ? `${C.mint}50` : C.surface }}>
                  {opt.icon && <span style={{ fontSize: "18px", flexShrink: 0 }}>{opt.icon}</span>}
                  <span style={{ fontSize: "14px", fontWeight: selected ? "700" : "500", color: C.charcoal, flex: 1 }}>{opt.label}</span>
                  {selected && <div style={{ color: C.teal, fontWeight: "800", flexShrink: 0 }}>{"\u2713"}</div>}
                </div>
              );
            })}
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            {qIdx > 0 && <button className="bg" style={{ padding: "12px 20px", fontSize: "14px" }} onClick={() => setQIdx((i) => i - 1)}>{"\u2190"} Back</button>}
            <button className="bt" style={{ flex: 1, padding: "12px", fontSize: "14px", opacity: canAdvance ? 1 : 0.4 }} onClick={() => { if (!canAdvance) return; if (qIdx < QUESTIONNAIRE.length - 1) setQIdx((i) => i + 1); else setPhase("quiz"); }}>
              {qIdx < QUESTIONNAIRE.length - 1 ? "Next \u2192" : "Start Knowledge Check \u2192"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── BASELINE QUIZ ─────────────────────────────────────────────────────────
  if (phase === "quiz") {
    const quizPool = getQuiz(skillLevel);
    const q = quizPool[quizIdx];
    const selected = quizAnswers[q?.id];
    const answered = !!selected;
    const correct = selected === q?.answer;
    const prog = Math.round((quizIdx / quizPool.length) * 100);
    const pickAnswer = (opt) => { if (!quizAnswers[q.id]) setQA((a) => ({ ...a, [q.id]: opt })); };
    const goNext = () => { if (quizIdx < quizPool.length - 1) setQuizIdx((i) => i + 1); else analyze(); };
    return (
      <div style={wrapStyle}>
        <div style={box("600px")}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <div style={{ fontSize: "12px", color: C.sandDark, fontWeight: "700" }}>{quizIdx + 1} of {quizPool.length}</div>
            <div style={{ fontSize: "12px", color: C.roseDark, fontWeight: "700" }}>Knowledge Check</div>
          </div>
          <div style={{ height: "4px", background: C.cream, borderRadius: "999px", overflow: "hidden", marginBottom: "28px" }}>
            <div style={{ height: "100%", width: `${prog}%`, background: C.rose, borderRadius: "999px", transition: "width .3s" }} />
          </div>
          <div style={{ display: "inline-block", padding: "3px 10px", borderRadius: "6px", fontSize: "11px", fontWeight: "700", letterSpacing: "0.4px", textTransform: "uppercase", background: C.blush, color: C.roseDark, border: `1px solid ${C.rose}`, marginBottom: "12px" }}>
            {DOMAINS.find((d) => d.id === q.domain)?.label || q.domain}
          </div>
          <div style={{ fontSize: "16px", fontWeight: "700", color: C.charcoal, fontFamily: "'Lora',serif", lineHeight: "1.5", marginBottom: "20px" }}>{q.question}</div>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "20px" }}>
            {q.options.map((opt) => {
              const letter = opt.split(")")[0];
              const isSel = selected === letter;
              const isCorr = letter === q.answer;
              let bg = C.surface, border = C.border, color = C.charcoal, fw = "400";
              if (answered) {
                if (isCorr) { bg = "#F0FDF4"; border = "#86EFAC"; color = "#15803D"; fw = "700"; }
                else if (isSel) { bg = "#FEF2F2"; border = "#FCA5A5"; color = "#B91C1C"; fw = "700"; }
              } else if (isSel) { bg = `${C.mint}50`; border = C.teal; fw = "700"; }
              return (
                <div key={opt} onClick={() => pickAnswer(letter)} style={{ padding: "12px 15px", borderRadius: "11px", border: `1.5px solid ${border}`, background: bg, cursor: answered ? "default" : "pointer", fontSize: "14px", color, fontWeight: fw, transition: "all .14s" }}>
                  {opt}
                </div>
              );
            })}
          </div>
          {answered && (
            <div style={{ background: correct ? "#F0FDF4" : C.blush, borderRadius: "10px", padding: "12px 14px", marginBottom: "16px", borderLeft: `3px solid ${correct ? "#86EFAC" : C.rose}` }}>
              <div style={{ fontSize: "13px", color: correct ? "#15803D" : C.roseDeep, fontWeight: "700", marginBottom: "3px" }}>
                {correct ? "\u2713 Correct!" : "\u2717 Not quite"}
              </div>
              <div style={{ fontSize: "13px", color: C.sandDeep, lineHeight: "1.5" }}>{q.explanation}</div>
            </div>
          )}
          <button className="bt" style={{ width: "100%", padding: "12px", fontSize: "14px", opacity: answered ? 1 : 0.35 }} onClick={() => { if (answered) goNext(); }}>
            {quizIdx < quizPool.length - 1 ? "Next Question \u2192" : "See My Results \u2192"}
          </button>
        </div>
      </div>
    );
  }

  // ── ANALYZING ─────────────────────────────────────────────────────────────
  if (phase === "analyzing")
    return (
      <div style={wrapStyle}>
        <div style={box()}>
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>{"\u{1F9E0}"}</div>
            <div style={{ fontSize: "20px", fontWeight: "800", color: C.charcoal, fontFamily: "'Lora',serif", marginBottom: "8px" }}>Analyzing your results…</div>
            <div style={{ fontSize: "14px", color: C.sandDark, lineHeight: "1.6", marginBottom: "20px" }}>Building your personalized study profile from your questionnaire and quiz results</div>
            <div style={{ display: "flex", justifyContent: "center", gap: "6px", flexWrap: "wrap" }}>
              {["Scoring quiz", "Reviewing preferences", "Setting baselines", "Crafting your plan"].map((s, i) => (
                <div key={i} style={{ fontSize: "11px", color: C.sandDark, background: C.cream, padding: "4px 10px", borderRadius: "20px" }}>{s}</div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );

  // ── PLAN ──────────────────────────────────────────────────────────────────
  if (phase === "plan" && plan) {
    const dColor = (id) => DOMAINS.find((d) => d.id === id)?.color || C.teal;
    const dLabel = (id) => DOMAINS.find((d) => d.id === id)?.label || id;
    const aIcon = { flashcards: "\u{1F0CF}", scenarios: "\u{1F3AF}", chat: "\u{1F4AC}", reflect: "\u{1FA9E}" };
    return (
      <div style={wrapStyle}>
        <div style={{ ...box("600px"), overflowY: "auto", maxHeight: "95vh" }}>
          <div style={{ fontSize: "12px", color: C.tealDark, fontWeight: "800", letterSpacing: "0.6px", textTransform: "uppercase", marginBottom: "10px" }}>{"\u{1F389}"} Your Personalized Study Profile</div>
          <div style={{ fontSize: "20px", fontWeight: "800", color: C.charcoal, fontFamily: "'Lora',serif", lineHeight: "1.4", marginBottom: "20px" }}>{plan.welcome}</div>

          {/* Baseline mastery */}
          <div style={{ background: C.alt, borderRadius: "13px", padding: "16px 18px", marginBottom: "16px", border: `1px solid ${C.border}` }}>
            <div style={{ fontSize: "12px", fontWeight: "800", color: C.charcoal, textTransform: "uppercase", letterSpacing: "0.4px", marginBottom: "12px" }}>Your Starting Mastery</div>
            {DOMAINS.map((d) => {
              const pct = plan.masteryBaseline?.[d.id] || 5;
              return (
                <div key={d.id} style={{ marginBottom: "10px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px", fontSize: "13px" }}>
                    <span style={{ color: C.sandDeep, fontWeight: "600" }}>{d.label}</span>
                    <span style={{ color: C.sandDark, fontWeight: "700" }}>{pct}%</span>
                  </div>
                  <div style={{ height: "6px", background: C.cream, borderRadius: "999px", overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${pct}%`, background: d.color, borderRadius: "999px" }} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Strengths & Gaps */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
            <div style={{ background: `${C.mint}40`, borderRadius: "12px", padding: "13px 15px", borderLeft: `3px solid ${C.teal}` }}>
              <div style={{ fontSize: "12px", fontWeight: "800", color: C.tealDark, marginBottom: "8px" }}>{"\u{1F4AA}"} Strengths</div>
              {plan.strengths?.map((s, i) => <div key={i} style={{ fontSize: "13px", color: C.sandDeep, marginBottom: "4px", lineHeight: "1.4" }}>{"\u2022"} {s}</div>)}
            </div>
            <div style={{ background: C.blush, borderRadius: "12px", padding: "13px 15px", borderLeft: `3px solid ${C.rose}` }}>
              <div style={{ fontSize: "12px", fontWeight: "800", color: C.roseDeep, marginBottom: "8px" }}>{"\u{1F3AF}"} Focus Areas</div>
              {plan.gaps?.map((g, i) => <div key={i} style={{ fontSize: "13px", color: C.sandDeep, marginBottom: "4px", lineHeight: "1.4" }}>{"\u2022"} {g}</div>)}
            </div>
          </div>

          {/* Priority domains */}
          {plan.priorityDomains?.length > 0 && (
            <div style={{ marginBottom: "16px" }}>
              <div style={{ fontSize: "12px", fontWeight: "800", color: C.charcoal, textTransform: "uppercase", letterSpacing: "0.4px", marginBottom: "8px" }}>Priority Domains</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "7px" }}>
                {plan.priorityDomains.map((id) => (
                  <span key={id} style={{ padding: "5px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "700", background: `${dColor(id)}18`, color: dColor(id), border: `1px solid ${dColor(id)}40` }}>
                    {dLabel(id)}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Day 1 activities */}
          <div style={{ marginBottom: "16px" }}>
            <div style={{ fontSize: "12px", fontWeight: "800", color: C.charcoal, textTransform: "uppercase", letterSpacing: "0.4px", marginBottom: "10px" }}>Your Day 1 Plan</div>
            {plan.day1?.map((a, i) => (
              <div key={i} style={{ display: "flex", gap: "12px", marginBottom: "10px", padding: "12px 14px", borderRadius: "11px", background: C.alt, border: `1px solid ${C.border}` }}>
                <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: C.teal, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", flexShrink: 0, marginTop: "1px" }}>
                  {aIcon[a.type] || "\u{1F4CC}"}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "13px", fontWeight: "700", color: C.charcoal }}>{a.activity}</div>
                  <div style={{ fontSize: "12px", color: C.sandDark, marginTop: "2px" }}>{a.reason}</div>
                </div>
                <div style={{ fontSize: "11px", color: C.sandDark, fontWeight: "700", flexShrink: 0, background: C.cream, padding: "3px 8px", borderRadius: "6px", alignSelf: "flex-start" }}>{a.duration}</div>
              </div>
            ))}
          </div>

          {/* Weekly goal */}
          <div style={{ background: `${C.mint}40`, borderRadius: "12px", padding: "13px 15px", marginBottom: "16px", borderLeft: `3px solid ${C.teal}` }}>
            <div style={{ fontSize: "12px", fontWeight: "800", color: C.tealDark, marginBottom: "4px" }}>{"\u{1F5D3}\uFE0F"} This Week's Goal</div>
            <div style={{ fontSize: "14px", color: C.charcoal, lineHeight: "1.5" }}>{plan.weeklyGoal}</div>
          </div>

          <div style={{ background: C.blush, borderRadius: "12px", padding: "12px 14px", marginBottom: "22px", borderLeft: `3px solid ${C.rose}` }}>
            <div style={{ fontSize: "13px", color: C.roseDeep, fontWeight: "600", fontStyle: "italic" }}>{plan.encouragement}</div>
          </div>

          <button className="bt" style={{ width: "100%", padding: "13px", fontSize: "15px" }} onClick={() => onComplete(skillLevel, plan.masteryBaseline)}>
            Let's Go! {"\u2192"}
          </button>
        </div>
      </div>
    );
  }

  return null;
}
