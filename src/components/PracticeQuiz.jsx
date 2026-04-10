import { useState, useMemo } from "react";
import { C, SKILL_LEVELS, DOMAINS } from "../data/constants.js";
import { getQuiz } from "../data/quizzes.js";
import { Card } from "./ui.jsx";

const QUIZ_SIZE = 10;

const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

export default function PracticeQuiz({ ud, onMU, onBE }) {
  const pool = useMemo(() => getQuiz(ud.skillLevel) || [], [ud.skillLevel]);
  const levelLabel = SKILL_LEVELS.find((s) => s.id === ud.skillLevel)?.label || "";

  const [mode, setMode] = useState("menu");
  const [deck, setDeck] = useState([]);
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState(null);
  const [answers, setAnswers] = useState({});

  const start = () => {
    const picked = shuffle(pool).slice(0, Math.min(QUIZ_SIZE, pool.length));
    setDeck(picked);
    setIdx(0);
    setPicked(null);
    setAnswers({});
    setMode("quiz");
  };

  const selectAnswer = (letter) => {
    if (picked) return;
    setPicked(letter);
    const q = deck[idx];
    const correct = letter === q.answer;
    setAnswers((a) => ({ ...a, [q.id]: { picked: letter, correct } }));
    if (onMU) onMU({ [q.domain]: correct ? 3 : 1 }, 1.0);
  };

  const next = () => {
    if (idx + 1 >= deck.length) {
      if (onBE) onBE("first_chat"); // harmless badge nudge; we don't have a dedicated quiz badge
      setMode("done");
    } else {
      setIdx((i) => i + 1);
      setPicked(null);
    }
  };

  // ── MENU ───────────────────────────────────────────────────────────────────
  if (mode === "menu") {
    return (
      <div className="pg" style={{ padding: "24px 28px", maxWidth: "680px", margin: "0 auto" }}>
        <div style={{ marginBottom: "20px" }}>
          <div style={{ fontSize: "22px", fontWeight: "800", color: C.charcoal, fontFamily: "'Lora',serif", marginBottom: "3px" }}>Practice Quiz</div>
          <div style={{ fontSize: "13px", color: C.sandDark }}>Test your knowledge with multiple-choice questions</div>
        </div>

        <Card style={{ marginBottom: "16px", borderLeft: `4px solid ${C.teal}` }}>
          <div style={{ fontSize: "12px", fontWeight: "700", color: C.tealDark, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "6px" }}>Your Level</div>
          <div style={{ fontSize: "17px", fontWeight: "800", color: C.charcoal, fontFamily: "'Lora',serif", marginBottom: "10px" }}>{levelLabel}</div>
          <div style={{ fontSize: "13px", color: C.sandDeep, lineHeight: "1.6", marginBottom: "14px" }}>
            A quick {Math.min(QUIZ_SIZE, pool.length)}-question quiz drawn at random from {pool.length} questions in your level. Each correct answer nudges your mastery in that domain.
          </div>
          <button className="bt" style={{ padding: "11px 22px", fontSize: "14px" }} onClick={start} disabled={pool.length === 0}>
            {pool.length === 0 ? "No questions available" : `Start Quiz \u2192`}
          </button>
        </Card>

        <Card>
          <div style={{ fontSize: "14px", fontWeight: "800", color: C.charcoal, marginBottom: "10px" }}>How it works</div>
          <ul style={{ margin: 0, paddingLeft: "18px", fontSize: "13px", color: C.sandDeep, lineHeight: "1.7" }}>
            <li>Pick one answer per question. You'll see the result immediately.</li>
            <li>Each question has a short explanation to lock in the concept.</li>
            <li>Your domain mastery updates automatically based on performance.</li>
            <li>Retake as often as you like — questions are shuffled each time.</li>
          </ul>
        </Card>
      </div>
    );
  }

  // ── QUIZ ───────────────────────────────────────────────────────────────────
  if (mode === "quiz") {
    const q = deck[idx];
    const prog = ((idx + (picked ? 1 : 0)) / deck.length) * 100;
    const result = picked ? (picked === q.answer ? "correct" : "incorrect") : null;
    const domLabel = DOMAINS.find((d) => d.id === q.domain)?.label || q.domain;

    return (
      <div className="pg" style={{ padding: "24px 28px", maxWidth: "640px", margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
          <div style={{ fontSize: "13px", color: C.sandDark, fontWeight: "700" }}>{idx + 1} / {deck.length}</div>
          <button className="bg" style={{ padding: "6px 14px", fontSize: "12px" }} onClick={() => setMode("menu")}>Exit</button>
        </div>
        <div style={{ height: "5px", background: C.cream, borderRadius: "999px", overflow: "hidden", marginBottom: "20px" }}>
          <div style={{ height: "100%", width: `${prog}%`, background: C.teal, borderRadius: "999px", transition: "width .3s ease" }} />
        </div>

        <div style={{ background: C.surface, borderRadius: "14px", padding: "22px 22px 18px", boxShadow: "0 2px 14px rgba(61,84,80,.07)", marginBottom: "14px" }}>
          <div style={{ fontSize: "11px", fontWeight: "700", color: C.roseDark, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "10px" }}>{domLabel}</div>
          <div style={{ fontSize: "16px", fontWeight: "700", color: C.charcoal, fontFamily: "'Lora',serif", lineHeight: "1.55", marginBottom: "18px" }}>{q.question}</div>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {q.options.map((opt) => {
              const letter = opt.trim().charAt(0).toUpperCase();
              const isPicked = picked === letter;
              const isCorrect = letter === q.answer;
              let bg = C.alt, border = C.border, color = C.sandDeep;
              if (picked) {
                if (isCorrect) { bg = "#F0FDF4"; border = "#86EFAC"; color = "#15803D"; }
                else if (isPicked) { bg = "#FEF2F2"; border = "#FCA5A5"; color = "#B91C1C"; }
              }
              return (
                <button
                  key={opt}
                  onClick={() => selectAnswer(letter)}
                  disabled={!!picked}
                  style={{
                    textAlign: "left",
                    padding: "11px 14px",
                    borderRadius: "10px",
                    border: `1.5px solid ${border}`,
                    background: bg,
                    color,
                    fontSize: "13px",
                    fontWeight: "600",
                    fontFamily: "'Nunito',sans-serif",
                    cursor: picked ? "default" : "pointer",
                    lineHeight: "1.5",
                    transition: "all .14s",
                  }}
                >
                  {opt}
                </button>
              );
            })}
          </div>

          {picked && (
            <div style={{ marginTop: "16px" }}>
              <div style={{ display: "inline-flex", alignItems: "center", padding: "5px 12px", borderRadius: "7px", background: result === "correct" ? "#F0FDF4" : "#FEF2F2", border: `1.5px solid ${result === "correct" ? "#86EFAC" : "#FCA5A5"}`, marginBottom: "10px" }}>
                <span style={{ fontSize: "13px", fontWeight: "700", color: result === "correct" ? "#15803D" : "#B91C1C" }}>
                  {result === "correct" ? "Correct" : "Incorrect"}
                </span>
              </div>
              <div style={{ background: C.blush, borderRadius: "10px", padding: "11px 13px", borderLeft: `3px solid ${C.rose}` }}>
                <div style={{ fontSize: "13px", color: C.sandDeep, lineHeight: "1.65" }}>{q.explanation}</div>
              </div>
            </div>
          )}
        </div>

        {picked && (
          <button className="bt" style={{ width: "100%", padding: "12px", fontSize: "14px" }} onClick={next}>
            {idx + 1 >= deck.length ? "See Results" : "Next Question \u2192"}
          </button>
        )}
      </div>
    );
  }

  // ── DONE ───────────────────────────────────────────────────────────────────
  const correctCount = Object.values(answers).filter((a) => a.correct).length;
  const pct = deck.length ? Math.round((correctCount / deck.length) * 100) : 0;
  const tone = pct >= 80 ? "great" : pct >= 60 ? "good" : "practice";
  const toneText = {
    great:    { title: "Excellent work!", msg: "You really know your stuff. Consider stepping up to the next level.", color: "#15803D", bg: "#F0FDF4" },
    good:     { title: "Solid effort!",   msg: "You're getting there. Review the misses and try again.",              color: "#B45309", bg: "#FFFBEB" },
    practice: { title: "Keep practicing", msg: "No stress — every miss is a chance to learn. Review and retake.",     color: "#B91C1C", bg: "#FEF2F2" },
  }[tone];

  return (
    <div className="pg" style={{ padding: "24px 28px", maxWidth: "560px", margin: "0 auto", textAlign: "center" }}>
      <div style={{ fontSize: "48px", marginBottom: "12px" }}>
        {pct >= 80 ? "\u{1F389}" : pct >= 60 ? "\u{1F44D}" : "\u{1F4AA}"}
      </div>
      <div style={{ fontSize: "24px", fontWeight: "800", color: C.charcoal, fontFamily: "'Lora',serif", marginBottom: "4px" }}>{toneText.title}</div>
      <div style={{ fontSize: "14px", color: C.sandDark, marginBottom: "20px" }}>
        {correctCount} / {deck.length} correct {"\u00B7"} {pct}%
      </div>

      <div style={{ background: toneText.bg, borderRadius: "12px", padding: "14px 16px", marginBottom: "20px", border: `1px solid ${toneText.color}30` }}>
        <div style={{ fontSize: "13px", color: toneText.color, fontWeight: "600", lineHeight: "1.6" }}>{toneText.msg}</div>
      </div>

      <div style={{ background: C.surface, borderRadius: "12px", padding: "16px", marginBottom: "16px", boxShadow: "0 2px 10px rgba(61,84,80,.06)", textAlign: "left" }}>
        <div style={{ fontSize: "13px", fontWeight: "800", color: C.charcoal, marginBottom: "10px" }}>By domain</div>
        {DOMAINS.map((d) => {
          const dQs = deck.filter((q) => q.domain === d.id);
          if (dQs.length === 0) return null;
          const dCorrect = dQs.filter((q) => answers[q.id]?.correct).length;
          return (
            <div key={d.id} style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: C.sandDeep, padding: "5px 0", borderBottom: `1px solid ${C.cream}` }}>
              <span>{d.label}</span>
              <span style={{ fontWeight: "700", color: C.sandDark }}>{dCorrect} / {dQs.length}</span>
            </div>
          );
        })}
      </div>

      <button className="bt" style={{ width: "100%", padding: "12px", fontSize: "15px", marginBottom: "10px" }} onClick={start}>Retake Quiz</button>
      <button className="bg" style={{ width: "100%", padding: "12px", fontSize: "14px" }} onClick={() => setMode("menu")}>Back to Practice Menu</button>
    </div>
  );
}
