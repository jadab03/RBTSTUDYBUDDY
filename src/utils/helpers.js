import { DOMAINS, BATCH } from "../data/constants.js";
import { FLASHCARDS } from "../data/flashcards.js";

// ── Domain mastery helpers ────────────────────────────────────────────────────
export const parseDomainString = (s) => {
  const d = {};
  s.split(",").forEach((p) => {
    const [k, v] = p.split("=");
    if (k) d[k.trim()] = parseInt(v) || 0;
  });
  return d;
};

export const parseMeta = (t) => {
  const m = t.match(/%%DOMAINS:([^%]+)%%/);
  return m ? parseDomainString(m[1]) : null;
};

export const stripMeta = (t) => t.replace(/%%DOMAINS:[^%]+%%/g, "").trim();

export const applyDeltas = (mastery, deltas, scale = 1.8) => {
  if (!deltas) return mastery;
  const n = { ...mastery };
  Object.entries(deltas).forEach(([k, v]) => {
    if (v > 0 && n[k] !== undefined)
      n[k] = Math.min(100, n[k] + Math.round(v * scale));
  });
  return n;
};

export const avgMastery = (m) =>
  Math.round(Object.values(m).reduce((a, b) => a + b, 0) / DOMAINS.length);

// ── JSON parse helper ─────────────────────────────────────────────────────────
export const safeJSON = (s) => {
  try {
    let c = s.replace(/```json|```/g, "").trim();
    const a = c.indexOf("{");
    const b = c.lastIndexOf("}");
    if (a !== -1 && b !== -1) c = c.slice(a, b + 1);
    return JSON.parse(c);
  } catch {
    return null;
  }
};

// ── Date helpers ──────────────────────────────────────────────────────────────
export const today = () => new Date().toISOString().split("T")[0];

export const fmtDate = (iso) =>
  new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });

// ── Flashcard SRS helpers ─────────────────────────────────────────────────────
export const getUnlocked = (ud) =>
  Math.min(ud.flashcardsUnlocked || BATCH, FLASHCARDS.length);

export const getActiveDeck = (ud) => FLASHCARDS.slice(0, getUnlocked(ud));

export const shouldUnlock = (ud) => {
  if (getUnlocked(ud) >= FLASHCARDS.length) return false;
  const cs = ud.cardStates || {};
  const t = today();
  const deck = getActiveDeck(ud);
  return (
    deck.every((c) => cs[c.id]) &&
    !deck.some((c) => {
      const s = cs[c.id];
      return !s || s.nextReview <= t;
    })
  );
};

export const dueCards = (ud) => {
  const t = today();
  const cs = ud.cardStates || {};
  const m = ud.mastery || {};
  const deck = getActiveDeck(ud);
  return deck
    .filter((c) => {
      const s = cs[c.id];
      if (!s || s.nextReview <= t) return true;
      if ((m[c.domain] || 0) < 30) {
        const days = (new Date(s.nextReview) - new Date(t)) / 864e5;
        if (days <= 1) return true;
      }
      return false;
    })
    .sort((a, b) => {
      const ma = m[a.domain] || 50;
      const mb = m[b.domain] || 50;
      return ma !== mb
        ? ma - mb
        : (cs[a.id]?.nextReview || "0") < (cs[b.id]?.nextReview || "0")
          ? -1
          : 1;
    });
};

export const rateCard = (cs, id, r) => {
  const p = cs[id] || { interval: 0, ease: 2.5, reps: 0 };
  let { interval, ease, reps } = p;
  if (r === 1) {
    interval = 0;
    reps = 0;
  } else if (r === 2) {
    interval = Math.max(1, Math.round(interval * 1.2));
    ease = Math.max(1.3, ease - 0.15);
    reps++;
  } else if (r === 3) {
    interval = reps === 0 ? 1 : reps === 1 ? 3 : Math.round(interval * ease);
    reps++;
  } else {
    interval =
      reps === 0 ? 1 : reps === 1 ? 4 : Math.round(interval * ease * 1.3);
    ease = Math.min(2.5, ease + 0.1);
    reps++;
  }
  const nx = new Date();
  nx.setDate(nx.getDate() + Math.max(1, interval));
  return {
    ...p,
    interval,
    ease,
    reps,
    nextReview: nx.toISOString().split("T")[0],
    lastRating: r,
  };
};

// ── Markdown-lite for chat ────────────────────────────────────────────────────
export const mdToHtml = (t) =>
  t.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>").replace(/\n/g, "<br/>");
