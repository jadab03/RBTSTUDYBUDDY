import { useState } from "react";
import { C, SKILL_LEVELS } from "../data/constants.js";

export default function LevelUpModal({ mode, currentLevel, suggestedLevel, onConfirm, onClose }) {
  const [pick, setPick] = useState(suggestedLevel || null);
  const current = SKILL_LEVELS.find((s) => s.id === currentLevel);
  const suggested = SKILL_LEVELS.find((s) => s.id === suggestedLevel);

  const overlay = {
    position: "fixed", inset: 0, background: "rgba(42,36,32,.55)",
    display: "flex", alignItems: "center", justifyContent: "center",
    padding: "20px", zIndex: 200, backdropFilter: "blur(3px)",
  };
  const box = {
    background: C.surface, borderRadius: "18px", padding: "28px 26px",
    width: "100%", maxWidth: "440px",
    boxShadow: "0 20px 60px rgba(61,84,80,.3)", maxHeight: "90vh", overflowY: "auto",
  };

  // ── SUGGESTED MODE ────────────────────────────────────────────────────────
  if (mode === "suggested" && suggested) {
    return (
      <div style={overlay} onClick={onClose}>
        <div style={box} onClick={(e) => e.stopPropagation()}>
          <div style={{ textAlign: "center", marginBottom: "18px" }}>
            <div style={{ fontSize: "42px", marginBottom: "8px" }}>{"\u{1F389}"}</div>
            <div style={{ fontSize: "22px", fontWeight: "800", color: C.charcoal, fontFamily: "'Lora',serif", marginBottom: "6px" }}>
              You{"\u2019"}re crushing it!
            </div>
            <div style={{ fontSize: "13px", color: C.sandDark, lineHeight: "1.5" }}>
              Your mastery looks strong. Ready to level up your study focus?
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "14px", borderRadius: "12px", background: C.alt, border: `1px solid ${C.border}`, marginBottom: "10px" }}>
            <div style={{ fontSize: "22px", flexShrink: 0 }}>{current?.icon}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "11px", fontWeight: "700", color: C.sandDark, textTransform: "uppercase", letterSpacing: "0.4px" }}>Currently</div>
              <div style={{ fontSize: "14px", fontWeight: "700", color: C.charcoal }}>{current?.label}</div>
            </div>
          </div>

          <div style={{ textAlign: "center", color: C.sandDark, fontSize: "18px", margin: "2px 0" }}>{"\u2193"}</div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "14px", borderRadius: "12px", background: `${C.mint}50`, border: `1.5px solid ${C.teal}`, marginBottom: "20px" }}>
            <div style={{ fontSize: "22px", flexShrink: 0 }}>{suggested.icon}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "11px", fontWeight: "700", color: C.tealDark, textTransform: "uppercase", letterSpacing: "0.4px" }}>Next up</div>
              <div style={{ fontSize: "14px", fontWeight: "800", color: C.charcoal }}>{suggested.label}</div>
              <div style={{ fontSize: "12px", color: C.sandDeep, marginTop: "2px" }}>{suggested.desc}</div>
            </div>
          </div>

          <div style={{ fontSize: "12px", color: C.sandDark, background: C.cream, padding: "10px 12px", borderRadius: "9px", marginBottom: "16px", lineHeight: "1.5" }}>
            {"\u{1F4A1}"} Your progress, badges, streak, and mastery all stay with you. Only the focus of your chat, roadmap, and quizzes will shift.
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <button className="bg" style={{ flex: 1, padding: "12px", fontSize: "13px" }} onClick={onClose}>
              Not yet
            </button>
            <button className="bt" style={{ flex: 1.4, padding: "12px", fontSize: "13px" }} onClick={() => onConfirm(suggestedLevel)}>
              Level me up {"\u2192"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── MANUAL MODE ───────────────────────────────────────────────────────────
  return (
    <div style={overlay} onClick={onClose}>
      <div style={box} onClick={(e) => e.stopPropagation()}>
        <div style={{ marginBottom: "16px" }}>
          <div style={{ fontSize: "20px", fontWeight: "800", color: C.charcoal, fontFamily: "'Lora',serif", marginBottom: "4px" }}>
            Change your level
          </div>
          <div style={{ fontSize: "13px", color: C.sandDark, lineHeight: "1.5" }}>
            Pick the phase you{"\u2019"}re in. The app will adjust your chat, roadmap, and quiz focus. Your progress stays with you.
          </div>
        </div>

        {SKILL_LEVELS.map((lvl) => {
          const isCurrent = lvl.id === currentLevel;
          const isPicked = lvl.id === pick;
          return (
            <div
              key={lvl.id}
              className="so"
              onClick={() => setPick(lvl.id)}
              style={{
                display: "flex", alignItems: "center", gap: "12px",
                padding: "13px 15px", borderRadius: "12px", marginBottom: "8px",
                border: `1.5px solid ${isPicked ? C.teal : C.border}`,
                background: isPicked ? `${C.mint}50` : C.surface,
                cursor: "pointer",
              }}
            >
              <div style={{ fontSize: "22px", flexShrink: 0 }}>{lvl.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                  <div style={{ fontSize: "14px", fontWeight: "800", color: C.charcoal }}>{lvl.label}</div>
                  {isCurrent && (
                    <span style={{ fontSize: "10px", fontWeight: "800", color: C.roseDeep, background: C.blush, border: `1px solid ${C.rose}`, padding: "2px 7px", borderRadius: "20px", textTransform: "uppercase", letterSpacing: "0.4px" }}>
                      Current
                    </span>
                  )}
                </div>
                <div style={{ fontSize: "12px", color: C.sandDark, marginTop: "2px", lineHeight: "1.4" }}>{lvl.desc}</div>
              </div>
              {isPicked && <div style={{ color: C.teal, fontWeight: "800", fontSize: "16px" }}>{"\u2713"}</div>}
            </div>
          );
        })}

        <div style={{ display: "flex", gap: "10px", marginTop: "16px" }}>
          <button className="bg" style={{ flex: 1, padding: "12px", fontSize: "13px" }} onClick={onClose}>
            Cancel
          </button>
          <button
            className="bt"
            style={{ flex: 1.4, padding: "12px", fontSize: "13px", opacity: !pick || pick === currentLevel ? 0.45 : 1 }}
            disabled={!pick || pick === currentLevel}
            onClick={() => pick && pick !== currentLevel && onConfirm(pick)}
          >
            Update level
          </button>
        </div>
      </div>
    </div>
  );
}
