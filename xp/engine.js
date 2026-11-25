/* Super Science: XP rules, levels, ranks and streaks.
 * Pure logic only: no screen code and no saving. That keeps it easy to test
 * (tests/xp.test.js). The numbers come from xp/config.js.
 */
(function () {
  const CONFIG = typeof window !== "undefined" && window.SuperScienceXPConfig
    ? window.SuperScienceXPConfig
    : require("./config.js");

  const VERSION = 1;

  /* ---------- Levels and ranks ---------- */

  // XP needed to go from `level` to `level + 1`.
  function xpToLevelUp(level) {
    return CONFIG.levels.firstLevelUp + CONFIG.levels.extraPerLevel * (level - 1);
  }

  // Total XP needed to reach `level` from zero.
  function totalXPForLevel(level) {
    let total = 0;
    for (let l = 1; l < level; l++) total += xpToLevelUp(l);
    return total;
  }

  function rankFor(level) {
    const index = Math.min(Math.floor(level / CONFIG.levelsPerRank), CONFIG.ranks.length - 1);
    return CONFIG.ranks[index];
  }

  // Everything the progress bar needs, from a total XP number.
  function levelInfo(xp) {
    let level = 1, floor = 0;
    while (level < CONFIG.levels.maxLevel && xp >= floor + xpToLevelUp(level)) {
      floor += xpToLevelUp(level);
      level++;
    }
    const maxed = level >= CONFIG.levels.maxLevel;
    const needed = xpToLevelUp(level);
    const into = xp - floor;
    return {
      level,
      rank: rankFor(level),
      xpIntoLevel: into,
      xpForNextLevel: needed,
      progress: maxed ? 1 : Math.min(1, into / needed),
      maxed,
    };
  }

  function aurasForLevel(level) {
    return CONFIG.auras.filter((a) => level >= a.level).map((a) => a.id);
  }

  /* ---------- Dates and streaks (uses the phone's local date) ---------- */

  function dateKey(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }
  function yesterdayKey(now) {
    return dateKey(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1));
  }

  // Bonus for day N of a streak: start, start+1, ... capped at max.
  function streakBonus(streakDays) {
    const s = CONFIG.streak;
    return Math.min(s.max, s.start + s.perDay * (streakDays - 1));
  }

  // The streak to SHOW: it's still alive if you earned XP today or yesterday.
  function currentStreak(state, now = new Date()) {
    if (state.lastActiveDate === dateKey(now) || state.lastActiveDate === yesterdayKey(now)) return state.streak;
    return 0;
  }

  /* ---------- Saved progress ---------- */

  function freshState() {
    return {
      version: VERSION,
      xp: 0,
      level: 1,
      streak: 0,
      lastActiveDate: null,
      completedQuestions: [], // question ids already answered correctly (paid once)
      seenConcepts: [],       // concept ids already opened (paid once)
      perfectConcepts: [],    // concept ids already scored 5/5 (paid once)
      unlockedAuras: ["amber"],
      chosenAura: "amber",
    };
  }

  // Clean up anything loaded from storage, so broken or edited data can't break the app.
  function normalizeState(raw) {
    const s = freshState();
    if (!raw || typeof raw !== "object" || raw.version !== VERSION) return s;
    const ids = (list) => Array.isArray(list) ? [...new Set(list.filter((x) => typeof x === "string"))] : [];
    s.xp = Number.isFinite(raw.xp) && raw.xp > 0 ? Math.floor(raw.xp) : 0;
    s.streak = Number.isFinite(raw.streak) && raw.streak > 0 ? Math.floor(raw.streak) : 0;
    s.lastActiveDate = typeof raw.lastActiveDate === "string" && /^\d{4}-\d{2}-\d{2}$/.test(raw.lastActiveDate) ? raw.lastActiveDate : null;
    s.completedQuestions = ids(raw.completedQuestions);
    s.seenConcepts = ids(raw.seenConcepts);
    s.perfectConcepts = ids(raw.perfectConcepts);
    // Level and unlocks always follow from XP, never trusted from storage.
    s.level = levelInfo(s.xp).level;
    s.unlockedAuras = aurasForLevel(s.level);
    s.chosenAura = s.unlockedAuras.includes(raw.chosenAura) ? raw.chosenAura : "amber";
    return s;
  }

  /* ---------- Earning XP ---------- */

  // THE one place XP is given out. Events:
  //   { type: "openConcept",   conceptId }
  //   { type: "correctAnswer", questionId }
  //   { type: "perfectScore",  conceptId }
  // Returns the new state plus what happened. Never changes the state you pass in.
  function award(state, event, now = new Date()) {
    const s = JSON.parse(JSON.stringify(state));
    const gains = [];

    // Pays `amount` only if `id` isn't already in `list` (anti-farming).
    function once(list, id, amount, reason) {
      if (!id || list.includes(id)) return;
      list.push(id);
      gains.push({ amount, reason });
    }

    if (event.type === "openConcept") once(s.seenConcepts, event.conceptId, CONFIG.firstOpenConcept, "New concept");
    else if (event.type === "correctAnswer") once(s.completedQuestions, event.questionId, CONFIG.firstCorrectQuestion, "Correct");
    else if (event.type === "perfectScore") once(s.perfectConcepts, event.conceptId, CONFIG.perfectScore, "Perfect score");

    // Streak bonus: only on the first XP actually earned each new day.
    const today = dateKey(now);
    if (gains.length && s.lastActiveDate !== today) {
      s.streak = s.lastActiveDate === yesterdayKey(now) ? s.streak + 1 : 1;
      s.lastActiveDate = today;
      gains.push({ amount: streakBonus(s.streak), reason: `Day ${s.streak} streak`, streak: true });
    }

    const total = gains.reduce((sum, g) => sum + g.amount, 0);
    const before = levelInfo(state.xp);
    s.xp += total;
    const after = levelInfo(s.xp);
    s.level = after.level;
    const newAuras = aurasForLevel(after.level).filter((id) => !s.unlockedAuras.includes(id));
    s.unlockedAuras = s.unlockedAuras.concat(newAuras);

    return {
      state: s,
      gains,
      total,
      leveledUp: after.level > before.level,
      oldLevel: before.level,
      newLevel: after.level,
      newRank: after.rank !== before.rank ? after.rank : null,
      newAuras: newAuras.map((id) => CONFIG.auras.find((a) => a.id === id)),
    };
  }

  function chooseAura(state, auraId) {
    if (!state.unlockedAuras.includes(auraId)) return state;
    return Object.assign({}, state, { chosenAura: auraId });
  }

  const ENGINE = {
    CONFIG, VERSION, xpToLevelUp, totalXPForLevel, rankFor, levelInfo, aurasForLevel,
    dateKey, streakBonus, currentStreak, freshState, normalizeState, award, chooseAura,
  };
  if (typeof module !== "undefined" && module.exports) module.exports = ENGINE;
  if (typeof window !== "undefined") window.SuperScienceXPEngine = ENGINE;
})();
