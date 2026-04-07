import { DOMAINS, BATCH } from "../data/constants.js";
import { today } from "./helpers.js";

const SK = (u) => `rbt_compass_${u}`;

export const loadUser = (username) => {
  try {
    const raw = localStorage.getItem(SK(username));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const saveUser = (username, data) => {
  try {
    localStorage.setItem(SK(username), JSON.stringify(data));
  } catch (e) {
    console.error("Storage save failed:", e);
  }
};

export const defaultUser = (username, skillLevel) => ({
  username,
  skillLevel,
  mastery: Object.fromEntries(
    DOMAINS.map((d) => [
      d.id,
      skillLevel === "refresher" ? 15 : skillLevel === "training" ? 3 : 5,
    ])
  ),
  badges: [],
  streak: 1,
  lastStudyDate: today(),
  totalSessions: 0,
  scenariosCompleted: [],
  sessionHistory: [],
  xp: 0,
  cardStates: {},
  totalCardsReviewed: 0,
  roadmap: null,
  examDate: null,
  flashcardsUnlocked: BATCH,
});
