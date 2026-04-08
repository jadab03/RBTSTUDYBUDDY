import { C, DOMAINS } from "../data/constants.js";
import { Card } from "./ui.jsx";

export default function MasteryTracker({ mastery }) {
  return (
    <div className="pg" style={{ padding: "24px 28px" }}>
      <div style={{ marginBottom: "20px" }}>
        <div style={{ fontSize: "22px", fontWeight: "800", color: C.charcoal, fontFamily: "'Lora',serif", marginBottom: "3px" }}>Skill Mastery</div>
        <div style={{ fontSize: "13px", color: C.sandDark }}>Every interaction builds your scores automatically</div>
      </div>

      <Card style={{ marginBottom: "18px", borderLeft: `3px solid ${C.teal}` }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "14px" }}>
          {[["\u{1F4AC}", "Chat"], ["\u{1F3AF}", "Scenarios"], ["\u{1FA9E}", "Reflections"], ["\u{1F0CF}", "Flashcards"]].map(([icon, label]) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: "7px" }}>
              <span style={{ fontSize: "15px" }}>{icon}</span>
              <span style={{ fontSize: "13px", color: C.sandDeep, fontWeight: "600" }}>{label}</span>
            </div>
          ))}
        </div>
      </Card>

      <div style={{ display: "flex", flexDirection: "column", gap: "11px" }}>
        {DOMAINS.map((d) => {
          const pct = mastery[d.id];
          const lbl = pct < 20 ? "Just Starting" : pct < 45 ? "Building" : pct < 70 ? "Developing" : pct < 90 ? "Proficient" : "Mastered";
          const lc = pct < 20 ? C.sandDark : pct < 45 ? C.roseDark : pct < 70 ? "#B8933A" : pct < 90 ? "#7FA8C0" : C.teal;
          return (
            <div key={d.id} style={{ background: C.surface, borderRadius: "14px", padding: "18px 20px", boxShadow: "0 2px 10px rgba(61,84,80,.06)", borderLeft: `4px solid ${d.color}` }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "11px" }}>
                <div>
                  <div style={{ fontSize: "14px", fontWeight: "700", color: C.charcoal }}>{d.label}</div>
                  <div style={{ fontSize: "12px", color: C.sandDark, marginTop: "1px" }}>{d.tasks} task list items</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "24px", fontWeight: "800", color: d.color, letterSpacing: "-0.5px", fontFamily: "'Lora',serif" }}>{pct}%</div>
                  <div style={{ fontSize: "11px", fontWeight: "700", color: lc, textTransform: "uppercase", letterSpacing: "0.4px" }}>{lbl}</div>
                </div>
              </div>
              <div style={{ height: "7px", background: C.cream, borderRadius: "999px", overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${pct}%`, background: d.color, borderRadius: "999px", transition: "width .5s ease" }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
