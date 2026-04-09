import { useState } from "react";
import { C, SKILL_LEVELS, DOMAINS, MILESTONES, NAV, BATCH } from "./data/constants.js";
import { FLASHCARDS } from "./data/flashcards.js";
import { SCENARIOS } from "./data/scenarios.js";
import { applyDeltas, avgMastery, today, rateCard, shouldUnlock } from "./utils/helpers.js";
import { loadUser, saveUser, defaultUser } from "./utils/storage.js";
import { Fonts } from "./components/ui.jsx";
import Auth from "./components/Auth.jsx";
import Onboarding from "./components/Onboarding.jsx";
import Dashboard from "./components/Dashboard.jsx";
import Chat from "./components/Chat.jsx";
import Flashcards from "./components/Flashcards.jsx";
import Scenarios from "./components/Scenarios.jsx";
import Roadmap from "./components/Roadmap.jsx";
import Progress from "./components/Progress.jsx";
import MasteryTracker from "./components/MasteryTracker.jsx";
import LevelUpModal from "./components/LevelUpModal.jsx";

export default function App() {
  const [screen, setScreen] = useState("auth");
  const [ud, setUd] = useState(null);
  const [view, setView] = useState("dashboard");
  const [saving, setSaving] = useState(false);
  const [levelUp, setLevelUp] = useState(null); // { mode: "manual"|"suggested", suggestedLevel? }

  const save = (data) => { setSaving(true); saveUser(data.username, data); setSaving(false); };

  // ── Mastery update ────────────────────────────────────────────────────────
  const onMU = (deltas, scale = 1.8) => {
    setUd((prev) => {
      const nm = applyDeltas(prev.mastery, deltas, scale);
      const nb = [...prev.badges];
      const avg = avgMastery(nm);
      if (avg >= 25 && !nb.includes("mastery_25")) nb.push("mastery_25");
      if (avg >= 50 && !nb.includes("mastery_50")) nb.push("mastery_50");
      if (avg >= 75 && !nb.includes("mastery_75")) nb.push("mastery_75");
      if (avg >= 80 && !nb.includes("mastery_80")) nb.push("mastery_80");
      if (Object.values(nm).some((v) => v >= 100) && !nb.includes("mastery_100")) nb.push("mastery_100");
      const next = { ...prev, mastery: nm, badges: nb };
      save(next);
      return next;
    });
  };

  // ── Badge earn ────────────────────────────────────────────────────────────
  const onBE = (id) => {
    setUd((prev) => {
      if (prev.badges.includes(id)) return prev;
      const m = MILESTONES.find((x) => x.id === id);
      const next = { ...prev, badges: [...prev.badges, id], xp: (prev.xp || 0) + (m?.xp || 10) };
      save(next);
      return next;
    });
  };

  // ── Session end ───────────────────────────────────────────────────────────
  const onSE = (session) => {
    setUd((prev) => {
      const next = {
        ...prev,
        sessionHistory: [...(prev.sessionHistory || []), session],
        totalSessions: (prev.totalSessions || 0) + 1,
        xp: (prev.xp || 0) + (session.xpGained || 10),
      };
      save(next);
      return next;
    });
  };

  // ── Scenario done ─────────────────────────────────────────────────────────
  const onScenarioDone = (id, score) => {
    setUd((prev) => {
      const already = prev.scenariosCompleted.includes(id);
      const nc = already ? prev.scenariosCompleted : [...prev.scenariosCompleted, id];
      const nb = [...prev.badges];
      if (!nb.includes("first_scenario")) nb.push("first_scenario");
      if (score === "correct" && !nb.includes("scenario_perf")) nb.push("scenario_perf");
      if (nc.length >= 10 && !nb.includes("scenarios_10")) nb.push("scenarios_10");
      if (nc.length >= SCENARIOS.length && !nb.includes("scenarios_all")) nb.push("scenarios_all");
      const xp = already ? 0 : score === "correct" ? 15 : score === "partial" ? 8 : 4;
      const nh = [
        ...(prev.sessionHistory || []),
        { type: "scenario", date: today(), summary: `Answered "${SCENARIOS.find((s) => s.id === id)?.title}" \u2014 ${score}`, xpGained: xp },
      ];
      const next = { ...prev, scenariosCompleted: nc, badges: nb, xp: (prev.xp || 0) + xp, sessionHistory: nh };
      save(next);
      return next;
    });
  };

  // ── Flashcard rate ────────────────────────────────────────────────────────
  const onCardRate = (cid, r) => {
    setUd((prev) => {
      const ncs = { ...prev.cardStates, [cid]: rateCard(prev.cardStates || {}, cid, r) };
      const tot = (prev.totalCardsReviewed || 0) + 1;
      const nb = [...prev.badges];
      const card = FLASHCARDS.find((c) => c.id === cid);
      const nm = applyDeltas(prev.mastery, { [card.domain]: r >= 3 ? 3 : 1 }, 1.0);
      if (tot >= 20 && !nb.includes("flashcard_20")) nb.push("flashcard_20");
      if (FLASHCARDS.every((c) => ncs[c.id]) && !nb.includes("flashcard_all")) nb.push("flashcard_all");
      const tempUd = { ...prev, cardStates: ncs };
      const newUnlocked = shouldUnlock(tempUd)
        ? Math.min((prev.flashcardsUnlocked || BATCH) + BATCH, FLASHCARDS.length)
        : prev.flashcardsUnlocked || BATCH;
      const next = { ...prev, cardStates: ncs, totalCardsReviewed: tot, badges: nb, mastery: nm, flashcardsUnlocked: newUnlocked };
      save(next);
      return next;
    });
  };

  // ── Roadmap save ──────────────────────────────────────────────────────────
  const onRoadmapSave = (rm, ed) => {
    setUd((prev) => { const next = { ...prev, roadmap: rm, examDate: ed, roadmapLevel: prev.skillLevel }; save(next); return next; });
  };

  // ── Skill level change ────────────────────────────────────────────────────
  const onChangeLevel = (newLevel) => {
    setUd((prev) => {
      const label = SKILL_LEVELS.find((s) => s.id === newLevel)?.label || newLevel;
      const nh = [
        ...(prev.sessionHistory || []),
        { type: "level change", date: today(), summary: `Moved to ${label}`, xpGained: 0 },
      ];
      const next = { ...prev, skillLevel: newLevel, levelUpDismissedFor: null, sessionHistory: nh };
      save(next);
      return next;
    });
    setLevelUp(null);
  };

  // ── Level-up prompt dismiss ───────────────────────────────────────────────
  const onDismissLevelUp = () => {
    setUd((prev) => {
      const next = { ...prev, levelUpDismissedFor: prev.skillLevel };
      save(next);
      return next;
    });
    setLevelUp(null);
  };

  // ── Auth handler ──────────────────────────────────────────────────────────
  const handleAuth = (u) => {
    if (u.isNew) { setUd({ username: u.username, email: u.email, isNew: true }); setScreen("onboarding"); return; }
    const data = loadUser(u.username) || u;
    const lastDate = data.lastStudyDate;
    const todayStr = today();
    let ns = data.streak || 1;
    if (lastDate) {
      const diff = (new Date(todayStr) - new Date(lastDate)) / (1000 * 60 * 60 * 24);
      if (Math.round(diff) === 1) ns++;
      else if (diff > 1) ns = 1;
    }
    const upd = { ...data, streak: ns, lastStudyDate: todayStr };
    if (!upd.badges.includes("first_login")) { upd.badges = [...upd.badges, "first_login"]; upd.xp = (upd.xp || 0) + 5; }
    if (ns >= 3 && !upd.badges.includes("streak_3")) { upd.badges = [...upd.badges, "streak_3"]; upd.xp = (upd.xp || 0) + 25; }
    if (ns >= 7 && !upd.badges.includes("streak_7")) { upd.badges = [...upd.badges, "streak_7"]; upd.xp = (upd.xp || 0) + 50; }
    if (ns >= 14 && !upd.badges.includes("streak_14")) { upd.badges = [...upd.badges, "streak_14"]; upd.xp = (upd.xp || 0) + 100; }
    saveUser(u.username, upd);
    setUd(upd);
    setScreen("app");
  };

  // ── Onboarding complete ───────────────────────────────────────────────────
  const handleOnboard = (level, masteryBaseline) => {
    const nd = defaultUser(ud.username, level);
    nd.email = ud.email;
    if (masteryBaseline) {
      Object.entries(masteryBaseline).forEach(([k, v]) => {
        if (nd.mastery[k] !== undefined) nd.mastery[k] = Math.min(100, Math.max(5, parseInt(v) || 5));
      });
    }
    nd.badges = ["first_login", "onboard_done"];
    nd.xp = 15;
    saveUser(ud.username, nd);
    setUd(nd);
    setScreen("app");
  };

  // ── Render ────────────────────────────────────────────────────────────────
  if (screen === "auth") return <><Fonts /><Auth onAuth={handleAuth} /></>;
  if (screen === "onboarding") return <><Fonts /><Onboarding user={ud} onComplete={handleOnboard} /></>;
  if (!ud) return null;

  const title = NAV.find((n) => n.id === view)?.label || "";

  return (
    <>
      <Fonts />
      <div style={{ fontFamily: "'Nunito',sans-serif", background: C.bg, minHeight: "100vh", color: C.charcoal }}>
        <div style={{ display: "flex", minHeight: "100vh" }}>
          {/* Sidebar */}
          <div className="sd" style={{ width: "224px", background: C.sidebar, display: "flex", flexDirection: "column", flexShrink: 0 }}>
            <div style={{ padding: "22px 18px 14px", borderBottom: "1px solid rgba(255,255,255,.08)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ width: "34px", height: "34px", borderRadius: "9px", background: C.teal, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px" }}>{"\u{1F9E0}"}</div>
                <div>
                  <div style={{ fontSize: "16px", fontWeight: "800", color: "#fff", fontFamily: "'Lora',serif" }}>RBT Compass</div>
                  <div style={{ fontSize: "10px", color: "rgba(255,255,255,.35)", letterSpacing: "0.7px", textTransform: "uppercase", fontWeight: "700" }}>Study Companion</div>
                </div>
              </div>
            </div>
            <div style={{ padding: "8px 0", flex: 1 }}>
              {NAV.map((n) => (
                <div key={n.id} className="ni" onClick={() => setView(n.id)} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 18px", fontSize: "13px", fontWeight: view === n.id ? "700" : "500", color: view === n.id ? "#fff" : "rgba(255,255,255,.48)", background: view === n.id ? "rgba(255,255,255,.09)" : "transparent", borderLeft: view === n.id ? `2px solid ${C.rose}` : "2px solid transparent" }}>
                  <span style={{ fontSize: "14px", width: "17px", textAlign: "center" }}>{n.icon}</span>{n.label}
                </div>
              ))}
            </div>
            <div style={{ padding: "12px 18px", borderTop: "1px solid rgba(255,255,255,.07)" }}>
              <div style={{ fontSize: "11px", color: "rgba(255,255,255,.28)", lineHeight: "1.5", marginBottom: "10px" }}>
                {SKILL_LEVELS.find((s) => s.id === ud.skillLevel)?.icon} {SKILL_LEVELS.find((s) => s.id === ud.skillLevel)?.label}
              </div>
              <div style={{ height: "2px", borderRadius: "1px", background: `linear-gradient(90deg,${C.teal},${C.rose})` }} />
            </div>
          </div>

          {/* Main */}
          <div className="mw" style={{ flex: 1, background: C.bg, overflowY: "auto", display: "flex", flexDirection: "column" }}>
            <div className="tb" style={{ background: C.surface, padding: "13px 28px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: `1px solid ${C.border}`, flexShrink: 0, position: "sticky", top: 0, zIndex: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ fontSize: "17px", fontWeight: "800", color: C.charcoal, fontFamily: "'Lora',serif" }}>{title}</div>
                {saving && <div style={{ fontSize: "11px", color: C.sandDark, fontWeight: "600" }}>{"\u{1F4BE}"} Saving\u2026</div>}
              </div>
              <div onClick={() => { setScreen("auth"); setUd(null); }} style={{ display: "flex", alignItems: "center", gap: "7px", padding: "5px 11px", borderRadius: "20px", background: C.blush, cursor: "pointer", border: `1px solid ${C.rose}` }}>
                <div style={{ width: "24px", height: "24px", borderRadius: "50%", background: C.rose, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", color: "#fff", fontWeight: "800" }}>
                  {ud.username?.[0]?.toUpperCase()}
                </div>
                <span style={{ fontSize: "13px", fontWeight: "700", color: C.roseDeep }}>@{ud.username}</span>
              </div>
            </div>
            <div style={{ flex: 1 }}>
              {view === "dashboard" && <Dashboard ud={ud} setView={setView} onOpenLevelUp={(mode, sl) => setLevelUp({ mode, suggestedLevel: sl })} onDismissLevelUp={onDismissLevelUp} />}
              {view === "chat" && <Chat ud={ud} onMU={onMU} onBE={onBE} onSE={onSE} />}
              {view === "flashcards" && <Flashcards ud={ud} onRate={onCardRate} onBE={onBE} />}
              {view === "scenarios" && <Scenarios ud={ud} onMU={onMU} onBE={onBE} onDone={onScenarioDone} />}
              {view === "roadmap" && <Roadmap ud={ud} onSave={onRoadmapSave} onBE={onBE} />}
              {view === "progress" && <Progress ud={ud} />}
              {view === "mastery" && <MasteryTracker mastery={ud.mastery} />}
            </div>
          </div>
        </div>

        {levelUp && (
          <LevelUpModal
            mode={levelUp.mode}
            currentLevel={ud.skillLevel}
            suggestedLevel={levelUp.suggestedLevel}
            onConfirm={onChangeLevel}
            onClose={() => setLevelUp(null)}
          />
        )}

        {/* Mobile nav */}
        <div className="mn" style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: C.surface, borderTop: `1px solid ${C.border}`, zIndex: 100, boxShadow: "0 -3px 14px rgba(61,84,80,.08)" }}>
          {NAV.map((n) => (
            <div key={n.id} onClick={() => setView(n.id)} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "7px 2px 9px", cursor: "pointer", color: view === n.id ? C.roseDark : C.sandDark }}>
              <div style={{ fontSize: "16px", marginBottom: "2px" }}>{n.icon}</div>
              <div style={{ fontSize: "9px", fontWeight: view === n.id ? "800" : "500" }}>{n.label}</div>
              {view === n.id && <div style={{ width: "4px", height: "4px", borderRadius: "50%", background: C.rose, marginTop: "3px" }} />}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
