import { useState } from "react";
import { C, DOMAINS, BATCH } from "../data/constants.js";
import { FLASHCARDS } from "../data/flashcards.js";
import { dueCards, getUnlocked, getActiveDeck, shouldUnlock } from "../utils/helpers.js";
import { Card } from "./ui.jsx";

const DC = { measurement: C.teal, assessment: "#7FA8C0", skill_acquisition: C.roseDark, behavior_reduction: "#9B8AA0", documentation: "#B8A882", professional: "#7A9E8A" };
const DL = { all: "All", measurement: "Measurement", assessment: "Assessment", skill_acquisition: "Skill Acquisition", behavior_reduction: "Behavior Reduction", documentation: "Documentation", professional: "Professional" };

export default function Flashcards({ ud, onRate, onBE }) {
  const { cardStates = {}, totalCardsReviewed = 0 } = ud;
  const [df, setDf] = useState("all");
  const [mode, setMode] = useState("menu");
  const [deck, setDeck] = useState([]);
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [results, setResults] = useState([]);

  const unlockedCount = getUnlocked(ud);
  const activeDeck = getActiveDeck(ud);
  const canUnlockMore = unlockedCount < FLASHCARDS.length;
  const nextUnlock = Math.min(unlockedCount + BATCH, FLASHCARDS.length);
  const due = dueCards(ud);
  const browseCards = df === "all" ? activeDeck : activeDeck.filter((c) => c.domain === df);
  const dueInDeck = df === "all" ? due : due.filter((c) => c.domain === df);

  const start = (cards) => { setDeck([...cards].sort(() => Math.random() - 0.5)); setIdx(0); setFlipped(false); setResults([]); setMode("study"); };
  const rate = (r) => { const card = deck[idx]; onRate(card.id, r); setResults((p) => [...p, { card, r }]); if (idx + 1 >= deck.length) setMode("done"); else { setIdx((i) => i + 1); setFlipped(false); } };

  // ── MENU ──────────────────────────────────────────────────────────────────
  if (mode === "menu")
    return (
      <div className="pg" style={{ padding: "24px 28px" }}>
        <div style={{ marginBottom: "20px" }}>
          <div style={{ fontSize: "22px", fontWeight: "800", color: C.charcoal, fontFamily: "'Lora',serif", marginBottom: "3px" }}>Flashcards</div>
          <div style={{ fontSize: "13px", color: C.sandDark }}>Complete your current set to unlock the next 5 cards</div>
        </div>

        {/* Unlock progress bar */}
        <div style={{ background: C.surface, borderRadius: "13px", padding: "16px 18px", marginBottom: "16px", boxShadow: "0 2px 10px rgba(61,84,80,.06)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <div style={{ fontSize: "13px", fontWeight: "800", color: C.charcoal }}>
              {unlockedCount === FLASHCARDS.length ? "\u{1F389} Full deck unlocked!" : `\u{1F513} ${unlockedCount} of ${FLASHCARDS.length} cards unlocked`}
            </div>
            {canUnlockMore && <div style={{ fontSize: "12px", color: C.sandDark }}>Next: {nextUnlock} cards</div>}
          </div>
          <div style={{ height: "8px", background: C.cream, borderRadius: "999px", overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${(unlockedCount / FLASHCARDS.length) * 100}%`, background: `linear-gradient(90deg,${C.teal},${C.roseDark})`, borderRadius: "999px", transition: "width .5s ease" }} />
          </div>
          {canUnlockMore && due.length === 0 && <div style={{ fontSize: "12px", color: C.tealDark, marginTop: "8px", fontWeight: "600" }}>{"\u2713"} All caught up \u2014 {BATCH} new cards will unlock soon!</div>}
          {canUnlockMore && due.length > 0 && <div style={{ fontSize: "12px", color: C.sandDark, marginTop: "8px" }}>Complete all {due.length} due card{due.length !== 1 ? "s" : ""} to unlock the next batch</div>}
        </div>

        {/* Due today */}
        <Card style={{ marginBottom: "16px", borderLeft: `4px solid ${C.teal}` }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: due.length > 0 ? "14px" : "0" }}>
            <div>
              <div style={{ fontSize: "16px", fontWeight: "800", color: C.charcoal }}>{"\u{1F4C5}"} Due Today</div>
              <div style={{ fontSize: "13px", color: C.sandDark, marginTop: "2px" }}>{due.length} card{due.length !== 1 ? "s" : ""} to review</div>
            </div>
            <button className="bt" style={{ padding: "10px 20px", fontSize: "14px", opacity: due.length > 0 ? 1 : 0.4 }} onClick={() => start(due)} disabled={due.length === 0}>
              {due.length === 0 ? "All caught up! \u{1F389}" : "Start Review \u2192"}
            </button>
          </div>
          {due.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "7px" }}>
              {DOMAINS.map((d) => { const c = due.filter((x) => x.domain === d.id).length; if (!c) return null; return <span key={d.id} style={{ fontSize: "11px", fontWeight: "700", padding: "3px 9px", borderRadius: "20px", background: `${d.color}18`, color: d.color, border: `1px solid ${d.color}40` }}>{d.label}: {c}</span>; })}
            </div>
          )}
        </Card>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "11px", marginBottom: "20px" }}>
          {[{ label: "Reviewed", val: totalCardsReviewed, color: C.teal }, { label: "Unlocked", val: unlockedCount, color: "#7FA8C0" }, { label: "Mastered", val: Object.values(cardStates).filter((s) => s.interval >= 21).length, color: "#7A9E8A" }].map((s, i) => (
            <div key={i} style={{ background: C.surface, borderRadius: "12px", padding: "14px 16px", boxShadow: "0 2px 10px rgba(61,84,80,.06)", textAlign: "center", borderTop: `3px solid ${s.color}` }}>
              <div style={{ fontSize: "22px", fontWeight: "800", color: s.color, fontFamily: "'Lora',serif" }}>{s.val}</div>
              <div style={{ fontSize: "11px", color: C.sandDark, fontWeight: "600", marginTop: "3px" }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Browse */}
        <div style={{ fontSize: "14px", fontWeight: "800", color: C.charcoal, marginBottom: "12px" }}>Browse Unlocked Cards</div>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "16px" }}>
          {["all", ...DOMAINS.map((d) => d.id)].map((d) => (
            <button key={d} onClick={() => setDf(d)} style={{ padding: "6px 13px", borderRadius: "20px", border: `1.5px solid ${df === d ? (DC[d] || C.teal) : C.border}`, background: df === d ? (DC[d] || C.teal) : "transparent", color: df === d ? "#fff" : C.sandDeep, fontSize: "12px", fontWeight: "700", cursor: "pointer", fontFamily: "'Nunito',sans-serif", transition: "all .14s" }}>
              {DL[d] || d}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button className="bt" style={{ flex: 1, padding: "11px", fontSize: "14px" }} onClick={() => start(browseCards)}>Study All {browseCards.length} Cards</button>
          {dueInDeck.length > 0 && df !== "all" && <button className="bg" style={{ flex: 1, padding: "11px", fontSize: "14px" }} onClick={() => start(dueInDeck)}>Due ({dueInDeck.length})</button>}
        </div>
      </div>
    );

  // ── STUDY ─────────────────────────────────────────────────────────────────
  if (mode === "study") {
    const card = deck[idx];
    const dc = DC[card.domain] || C.teal;
    const prog = (idx / deck.length) * 100;
    return (
      <div className="pg" style={{ padding: "24px 28px", maxWidth: "640px", margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
          <div style={{ fontSize: "13px", color: C.sandDark, fontWeight: "700" }}>{idx + 1} / {deck.length}</div>
          <button className="bg" style={{ padding: "6px 14px", fontSize: "12px" }} onClick={() => setMode("menu")}>Exit</button>
        </div>
        <div style={{ height: "5px", background: C.cream, borderRadius: "999px", overflow: "hidden", marginBottom: "28px" }}>
          <div style={{ height: "100%", width: `${prog}%`, background: C.teal, borderRadius: "999px", transition: "width .3s ease" }} />
        </div>
        <div className="flip-scene" style={{ marginBottom: "24px" }} onClick={() => setFlipped((f) => !f)}>
          <div className={`flip-card${flipped ? " flipped" : ""}`} style={{ height: "260px", cursor: "pointer" }}>
            <div className="flip-face" style={{ position: "absolute", inset: 0, background: C.surface, borderRadius: "18px", padding: "32px 28px", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", boxShadow: "0 4px 24px rgba(61,84,80,.10)", border: `1.5px solid ${C.border}` }}>
              <div style={{ fontSize: "11px", fontWeight: "700", color: dc, textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: "20px", padding: "3px 10px", borderRadius: "20px", background: `${dc}15`, border: `1px solid ${dc}30` }}>{DL[card.domain] || card.domain}</div>
              <div style={{ fontSize: "18px", fontWeight: "700", color: C.charcoal, textAlign: "center", lineHeight: "1.5", fontFamily: "'Lora',serif" }}>{card.front}</div>
              <div style={{ fontSize: "12px", color: C.sandDark, marginTop: "24px", fontWeight: "600" }}>Tap to reveal answer</div>
            </div>
            <div className="flip-face flip-back" style={{ position: "absolute", inset: 0, background: `linear-gradient(135deg,${C.mint}30,${C.surface})`, borderRadius: "18px", padding: "28px", display: "flex", flexDirection: "column", justifyContent: "center", boxShadow: "0 4px 24px rgba(61,84,80,.10)", border: `1.5px solid ${C.teal}50` }}>
              <div style={{ fontSize: "11px", fontWeight: "700", color: dc, textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: "16px" }}>Answer</div>
              <div style={{ fontSize: "15px", color: C.sandDeep, lineHeight: "1.7", overflowY: "auto" }}>{card.back}</div>
            </div>
          </div>
        </div>
        {flipped && (
          <div>
            <div style={{ fontSize: "12px", color: C.sandDark, textAlign: "center", marginBottom: "12px", fontWeight: "600" }}>How well did you know this?</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "8px" }}>
              {[
                { r: 1, label: "Again", sub: "< 1 min", bg: "#FEF2F2", color: "#B91C1C", border: "#FCA5A5" },
                { r: 2, label: "Hard", sub: "~1 day", bg: "#FFF7ED", color: "#C2410C", border: "#FED7AA" },
                { r: 3, label: "Good", sub: "~3 days", bg: "#F0FDF4", color: "#15803D", border: "#86EFAC" },
                { r: 4, label: "Easy", sub: "~1 week", bg: `${C.mint}50`, color: C.tealDark, border: C.teal },
              ].map((b) => (
                <button key={b.r} onClick={() => rate(b.r)} style={{ padding: "10px 6px", borderRadius: "10px", border: `1.5px solid ${b.border}`, background: b.bg, cursor: "pointer", fontFamily: "'Nunito',sans-serif", transition: "all .14s" }}>
                  <div style={{ fontSize: "13px", fontWeight: "800", color: b.color }}>{b.label}</div>
                  <div style={{ fontSize: "10px", color: b.color, opacity: 0.8, marginTop: "2px" }}>{b.sub}</div>
                </button>
              ))}
            </div>
          </div>
        )}
        {!flipped && <div style={{ textAlign: "center", fontSize: "13px", color: C.sandDark, fontStyle: "italic" }}>Think about it, then tap to reveal</div>}
      </div>
    );
  }

  // ── DONE ──────────────────────────────────────────────────────────────────
  const correct = results.filter((r) => r.r >= 3).length;
  return (
    <div className="pg" style={{ padding: "24px 28px", maxWidth: "540px", margin: "0 auto", textAlign: "center" }}>
      <div style={{ fontSize: "48px", marginBottom: "16px" }}>{"\u{1F389}"}</div>
      <div style={{ fontSize: "22px", fontWeight: "800", color: C.charcoal, fontFamily: "'Lora',serif", marginBottom: "6px" }}>Session Complete!</div>
      <div style={{ fontSize: "14px", color: C.sandDark, marginBottom: "28px" }}>{deck.length} cards {"\u00B7"} {correct} known {"\u00B7"} {deck.length - correct} to practice</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "10px", marginBottom: "28px" }}>
        {[
          { label: "Again", count: results.filter((r) => r.r === 1).length, color: "#B91C1C", bg: "#FEF2F2" },
          { label: "Hard", count: results.filter((r) => r.r === 2).length, color: "#C2410C", bg: "#FFF7ED" },
          { label: "Good/Easy", count: results.filter((r) => r.r >= 3).length, color: "#15803D", bg: "#F0FDF4" },
        ].map((s) => (
          <div key={s.label} style={{ background: s.bg, borderRadius: "12px", padding: "14px", border: `1px solid ${s.color}30` }}>
            <div style={{ fontSize: "24px", fontWeight: "800", color: s.color, fontFamily: "'Lora',serif" }}>{s.count}</div>
            <div style={{ fontSize: "12px", color: s.color, fontWeight: "600" }}>{s.label}</div>
          </div>
        ))}
      </div>
      <button className="bt" style={{ width: "100%", padding: "12px", fontSize: "15px", marginBottom: "10px" }} onClick={() => setMode("menu")}>Back to Flashcards</button>
      <button className="bg" style={{ width: "100%", padding: "12px", fontSize: "14px" }} onClick={() => start(deck)}>Study Again</button>
    </div>
  );
}
