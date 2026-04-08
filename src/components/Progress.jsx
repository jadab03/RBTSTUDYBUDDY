import { C, DOMAINS, MILESTONES } from "../data/constants.js";
import { avgMastery, fmtDate } from "../utils/helpers.js";
import { Card } from "./ui.jsx";

export default function Progress({ ud }) {
  const { mastery, sessionHistory = [], badges = [], xp = 0, totalSessions = 0, streak = 0, scenariosCompleted = [], totalCardsReviewed = 0 } = ud;
  const total = avgMastery(mastery);
  const earned = MILESTONES.filter((m) => badges.includes(m.id));

  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - 6 + i);
    const ds = d.toISOString().split("T")[0];
    const sess = sessionHistory.filter((s) => s.date === ds);
    return { label: d.toLocaleDateString("en-US", { weekday: "short" }), xp: sess.reduce((a, s) => a + (s.xpGained || 0), 0) };
  });
  const maxXP = Math.max(...last7.map((d) => d.xp), 1);

  const levels = [
    { min: 0, max: 20, label: "Just Starting", color: C.sandDark },
    { min: 20, max: 45, label: "Building", color: C.roseDark },
    { min: 45, max: 70, label: "Developing", color: "#B8933A" },
    { min: 70, max: 90, label: "Proficient", color: "#7FA8C0" },
    { min: 90, max: 101, label: "Mastered", color: C.teal },
  ];
  const getL = (p) => levels.find((l) => p >= l.min && p < l.max) || levels[0];
  const typeCounts = sessionHistory.reduce((a, s) => { a[s.type] = (a[s.type] || 0) + 1; return a; }, {});

  return (
    <div className="pg" style={{ padding: "24px 28px" }}>
      <div style={{ marginBottom: "20px" }}>
        <div style={{ fontSize: "22px", fontWeight: "800", color: C.charcoal, fontFamily: "'Lora',serif", marginBottom: "3px" }}>Progress & Growth</div>
        <div style={{ fontSize: "13px", color: C.sandDark }}>Your learning journey at a glance</div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "11px", marginBottom: "16px" }}>
        {[
          { label: "Avg Mastery", val: `${total}%`, color: C.teal },
          { label: "Total XP", val: xp, color: "#7FA8C0" },
          { label: "Streak", val: `${streak}d \u{1F525}`, color: C.roseDark },
        ].map((s, i) => (
          <div key={i} style={{ background: C.surface, borderRadius: "13px", padding: "14px 16px", boxShadow: "0 2px 10px rgba(61,84,80,.06)", borderTop: `3px solid ${s.color}` }}>
            <div style={{ fontSize: "11px", color: C.sandDark, fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "5px" }}>{s.label}</div>
            <div style={{ fontSize: "24px", fontWeight: "800", color: s.color, fontFamily: "'Lora',serif" }}>{s.val}</div>
          </div>
        ))}
      </div>

      <div className="g2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "13px", marginBottom: "14px" }}>
        <Card>
          <div style={{ fontSize: "14px", fontWeight: "800", color: C.charcoal, marginBottom: "3px" }}>Weekly Activity</div>
          <div style={{ fontSize: "12px", color: C.sandDark, marginBottom: "16px" }}>XP earned per day</div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: "6px", height: "80px" }}>
            {last7.map((d, i) => (
              <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", height: "100%", justifyContent: "flex-end" }}>
                <div style={{ width: "100%", background: d.xp > 0 ? C.teal : C.cream, borderRadius: "4px 4px 0 0", height: `${Math.max(4, (d.xp / maxXP) * 72)}px`, transition: "height .4s", position: "relative" }}>
                  {d.xp > 0 && <div style={{ position: "absolute", top: "-16px", left: "50%", transform: "translateX(-50%)", fontSize: "10px", fontWeight: "700", color: C.tealDark }}>{d.xp}</div>}
                </div>
                <div style={{ fontSize: "10px", color: C.sandDark, fontWeight: "600" }}>{d.label}</div>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <div style={{ fontSize: "14px", fontWeight: "800", color: C.charcoal, marginBottom: "14px" }}>Activity Breakdown</div>
          {[
            { type: "chat", icon: "\u{1F4AC}", label: "Chat sessions", color: C.teal },
            { type: "scenario", icon: "\u{1F3AF}", label: "Scenarios done", color: C.roseDark },
            { type: "flashcard", icon: "\u{1F0CF}", label: "Cards reviewed", color: "#7FA8C0" },
          ].map((a) => {
            const val = a.type === "scenario" ? scenariosCompleted.length : a.type === "flashcard" ? totalCardsReviewed : (typeCounts[a.type] || 0);
            return (
              <div key={a.type} style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "11px" }}>
                <span style={{ fontSize: "18px", flexShrink: 0 }}>{a.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "3px" }}>
                    <span style={{ fontSize: "12px", fontWeight: "600", color: C.sandDeep }}>{a.label}</span>
                    <span style={{ fontSize: "12px", fontWeight: "800", color: a.color }}>{val}</span>
                  </div>
                  <div style={{ height: "5px", background: C.cream, borderRadius: "999px", overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${Math.min(100, (val / Math.max(val, 20)) * 100)}%`, background: a.color, borderRadius: "999px" }} />
                  </div>
                </div>
              </div>
            );
          })}
          <div style={{ paddingTop: "8px", borderTop: `1px solid ${C.cream}`, fontSize: "12px", color: C.sandDark }}>{totalSessions} sessions {"\u00B7"} {earned.length}/{MILESTONES.length} milestones</div>
        </Card>
      </div>

      <Card style={{ marginBottom: "14px" }}>
        <div style={{ fontSize: "14px", fontWeight: "800", color: C.charcoal, marginBottom: "14px" }}>Domain Progress</div>
        {DOMAINS.map((d) => {
          const pct = mastery[d.id]; const lv = getL(pct);
          return (
            <div key={d.id} style={{ marginBottom: "14px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "5px" }}>
                <span style={{ fontSize: "13px", fontWeight: "700", color: C.charcoal }}>{d.label}</span>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "11px", fontWeight: "700", color: lv.color, background: `${lv.color}15`, padding: "2px 8px", borderRadius: "20px" }}>{lv.label}</span>
                  <span style={{ fontSize: "13px", fontWeight: "800", color: d.color }}>{pct}%</span>
                </div>
              </div>
              <div style={{ height: "8px", background: C.cream, borderRadius: "999px", overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${pct}%`, background: d.color, borderRadius: "999px", transition: "width .5s" }} />
              </div>
            </div>
          );
        })}
      </Card>

      <Card>
        <div style={{ fontSize: "14px", fontWeight: "800", color: C.charcoal, marginBottom: "14px" }}>{"\u{1F4CB}"} Session Log</div>
        {sessionHistory.length === 0
          ? <div style={{ fontSize: "13px", color: C.sandDark, fontStyle: "italic" }}>No sessions yet \u2014 start studying!</div>
          : [...sessionHistory].reverse().slice(0, 10).map((s, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: "12px", paddingBottom: i < 9 ? "10px" : 0, marginBottom: i < 9 ? "10px" : 0, borderBottom: i < 9 ? `1px solid ${C.cream}` : 0 }}>
              <div style={{ fontSize: "18px", flexShrink: 0 }}>{s.type === "chat" ? "\u{1F4AC}" : s.type === "scenario" ? "\u{1F3AF}" : s.type === "flashcard" ? "\u{1F0CF}" : "\u{1FA9E}"}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "13px", fontWeight: "700", color: C.charcoal, textTransform: "capitalize" }}>{s.type} session</div>
                <div style={{ fontSize: "12px", color: C.sandDark, marginTop: "1px" }}>{s.summary}</div>
              </div>
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <div style={{ fontSize: "11px", color: C.sandDark }}>{fmtDate(s.date)}</div>
                {s.xpGained > 0 && <div style={{ fontSize: "11px", fontWeight: "700", color: "#7FA8C0", marginTop: "2px" }}>+{s.xpGained} XP</div>}
              </div>
            </div>
          ))}
      </Card>
    </div>
  );
}
