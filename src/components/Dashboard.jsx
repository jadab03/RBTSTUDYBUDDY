import { C, SKILL_LEVELS, DOMAINS, MILESTONES } from "../data/constants.js";
import { avgMastery, dueCards, fmtDate } from "../utils/helpers.js";
import { Card } from "./ui.jsx";

export default function Dashboard({ ud, setView }) {
  const { mastery, badges = [], streak = 0, totalSessions = 0, sessionHistory = [], xp = 0, roadmap } = ud;
  const total = avgMastery(mastery);
  const earned = MILESTONES.filter((m) => badges.includes(m.id));
  const recent = sessionHistory.slice(-3).reverse();
  const due = dueCards(ud).length;

  return (
    <div className="pg" style={{ padding: "24px 28px" }}>
      <div style={{ marginBottom: "20px" }}>
        <div style={{ fontSize: "24px", fontWeight: "800", color: C.charcoal, fontFamily: "'Lora',serif", marginBottom: "3px" }}>Good to see you, {ud.username} {"\u{1F44B}"}</div>
        <div style={{ fontSize: "13px", color: C.sandDark }}>{SKILL_LEVELS.find((s) => s.id === ud.skillLevel)?.label}</div>
      </div>

      <div className="sg" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "12px", marginBottom: "16px" }}>
        {[
          { label: "Overall Mastery", val: `${total}%`, color: C.teal, sub: "across all domains" },
          { label: "Study Streak", val: `${streak} \u{1F525}`, color: C.roseDark, sub: "days in a row" },
          { label: "Total XP", val: `${xp}`, color: "#7FA8C0", sub: `${totalSessions} sessions` },
        ].map((s, i) => (
          <div key={i} className={i === 2 ? "sw" : ""} style={{ background: C.surface, borderRadius: "14px", padding: "16px 18px", boxShadow: "0 2px 12px rgba(61,84,80,.07)", borderTop: `3px solid ${s.color}` }}>
            <div style={{ fontSize: "11px", color: C.sandDark, fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "6px" }}>{s.label}</div>
            <div style={{ fontSize: "26px", fontWeight: "800", color: s.color, letterSpacing: "-0.5px", fontFamily: "'Lora',serif" }}>{s.val}</div>
            <div style={{ fontSize: "12px", color: C.sandDark, marginTop: "2px" }}>{s.sub}</div>
          </div>
        ))}
      </div>

      <div className="g2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "13px" }}>
        <Card>
          <div style={{ fontSize: "14px", fontWeight: "800", color: C.charcoal, marginBottom: "2px" }}>Domain Mastery</div>
          <div style={{ fontSize: "12px", color: C.sandDark, marginBottom: "15px" }}>Grows with every interaction</div>
          {DOMAINS.map((d) => (
            <div key={d.id} style={{ marginBottom: "11px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px", fontSize: "13px" }}>
                <span style={{ color: C.sandDeep, fontWeight: "600" }}>{d.label}</span>
                <span style={{ color: C.sandDark, fontWeight: "700" }}>{mastery[d.id]}%</span>
              </div>
              <div style={{ height: "6px", background: C.cream, borderRadius: "999px", overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${mastery[d.id]}%`, background: d.color, borderRadius: "999px", transition: "width .5s ease" }} />
              </div>
            </div>
          ))}
        </Card>

        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {due > 0 && (
            <Card style={{ borderLeft: `4px solid ${C.teal}`, display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
              <div>
                <div style={{ fontSize: "14px", fontWeight: "800", color: C.charcoal }}>{"\u{1F0CF}"} Cards Due</div>
                <div style={{ fontSize: "12px", color: C.sandDark, marginTop: "2px" }}>{due} card{due !== 1 ? "s" : ""} to review today</div>
              </div>
              <button className="bt" style={{ padding: "8px 14px", fontSize: "12px", flexShrink: 0 }} onClick={() => setView("flashcards")}>Review</button>
            </Card>
          )}
          {!roadmap && (
            <Card style={{ borderLeft: `4px solid ${C.rose}`, display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
              <div>
                <div style={{ fontSize: "14px", fontWeight: "800", color: C.charcoal }}>{"\u{1F5FA}\uFE0F"} No Roadmap Yet</div>
                <div style={{ fontSize: "12px", color: C.sandDark, marginTop: "2px" }}>Get a personalized study plan</div>
              </div>
              <button className="br" style={{ padding: "8px 14px", fontSize: "12px", flexShrink: 0 }} onClick={() => setView("roadmap")}>Create</button>
            </Card>
          )}

          <Card>
            <div style={{ fontSize: "14px", fontWeight: "800", color: C.charcoal, marginBottom: "2px" }}>Milestones</div>
            <div style={{ fontSize: "12px", color: C.sandDark, marginBottom: "12px" }}>{earned.length}/{MILESTONES.length} earned {"\u00B7"} {xp} XP</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "7px" }}>
              {MILESTONES.map((m) => {
                const ok = badges.includes(m.id);
                return (
                  <div key={m.id} className={ok ? "" : "bdim"} title={m.label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "3px", padding: "7px 9px", borderRadius: "10px", minWidth: "52px", background: ok ? C.blush : C.alt, border: `1px solid ${ok ? C.rose : C.border}` }}>
                    <div style={{ fontSize: "18px" }}>{m.icon}</div>
                    <div style={{ fontSize: "10px", fontWeight: "700", color: ok ? C.roseDark : C.sandDark, textAlign: "center", lineHeight: "1.2" }}>{m.label}</div>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card>
            <div style={{ fontSize: "14px", fontWeight: "800", color: C.charcoal, marginBottom: "13px" }}>{"\u{1F4CB}"} Recent Sessions</div>
            {recent.length === 0 ? (
              <div style={{ fontSize: "13px", color: C.sandDark, fontStyle: "italic" }}>No sessions yet \u2014 start studying!</div>
            ) : (
              recent.map((s, i) => (
                <div key={i} style={{ paddingBottom: i < recent.length - 1 ? "10px" : 0, marginBottom: i < recent.length - 1 ? "10px" : 0, borderBottom: i < recent.length - 1 ? `1px solid ${C.cream}` : 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "2px" }}>
                    <div style={{ fontSize: "13px", fontWeight: "700", color: C.charcoal, textTransform: "capitalize" }}>{s.type} session</div>
                    <div style={{ fontSize: "11px", color: C.sandDark }}>{fmtDate(s.date)}</div>
                  </div>
                  <div style={{ fontSize: "12px", color: C.sandDark }}>{s.summary}</div>
                </div>
              ))
            )}
          </Card>

          <div style={{ display: "flex", gap: "8px" }}>
            <button className="bt" style={{ flex: 1, padding: "11px", fontSize: "13px" }} onClick={() => setView("chat")}>{"\u{1F4AC}"} Study Buddy</button>
            <button className="br" style={{ flex: 1, padding: "11px", fontSize: "13px" }} onClick={() => setView("scenarios")}>{"\u{1F3AF}"} Scenarios</button>
          </div>
        </div>
      </div>
    </div>
  );
}
