// Run with:  node tests/minigame-xp.test.js
// Save format v2 (migration from v1) and minigame XP with the daily cap.
const assert = require("assert");
const E = require("../xp/engine.js");
const C = require("../xp/config.js");
const M = C.minigames;
const day = (n, h = 12) => new Date(2026, 10, 1 + n, h, 0, 0);

/* ---------- Migration: a version 1 save keeps everything ---------- */
const oldSave = {
  version: 1, xp: 437, level: 5, streak: 4, lastActiveDate: "2026-11-20",
  completedQuestions: ["taylor-3-terms", "vectors-cancel", "ph-poh"], seenConcepts: ["taylor", "vectors", "ph"],
  perfectConcepts: ["taylor"], unlockedAuras: ["amber", "cyan"], chosenAura: "cyan",
};
const migrated = E.normalizeState(JSON.parse(JSON.stringify(oldSave)));
assert.strictEqual(migrated.version, 2);
assert.strictEqual(migrated.xp, 437, "XP kept");
assert.strictEqual(migrated.level, E.levelInfo(437).level);
assert.strictEqual(migrated.streak, 4);
assert.strictEqual(migrated.lastActiveDate, "2026-11-20");
assert.deepStrictEqual(migrated.completedQuestions, oldSave.completedQuestions);
assert.deepStrictEqual(migrated.seenConcepts, oldSave.seenConcepts);
assert.deepStrictEqual(migrated.perfectConcepts, oldSave.perfectConcepts);
assert.strictEqual(migrated.chosenAura, "cyan");
assert.deepStrictEqual(migrated.minigames, { quiz: { best: {} } }, "new minigame data starts empty");
assert.deepStrictEqual(migrated.minigameXP, { date: null, earned: 0 });
// Re-loading a v2 save keeps minigame data; bad values are dropped
const v2 = E.normalizeState({ ...migrated, minigames: { quiz: { best: { Physics: 6, Maths: "lots", Biology: -3 } } }, minigameXP: { date: "2026-11-21", earned: 999 } });
assert.deepStrictEqual(v2.minigames.quiz.best, { Physics: 6 });
assert.deepStrictEqual(v2.minigameXP, { date: "2026-11-21", earned: M.dailyCap }, "earned can't exceed the cap");
assert.deepStrictEqual(E.normalizeState({ version: 3, xp: 50 }), E.freshState(), "unknown future version starts fresh");
// Storage round trip of an old save
const Storage = require("../xp/storage.js");
const fake = {};
globalThis.localStorage = { getItem: (k) => (k in fake ? fake[k] : null), setItem: (k, v) => { fake[k] = String(v); }, removeItem: (k) => { delete fake[k]; } };
fake[Storage.KEY] = JSON.stringify(oldSave);
const loaded = Storage.load();
assert.strictEqual(loaded.xp, 437); assert.strictEqual(loaded.version, 2);
delete globalThis.localStorage;
console.log("Migration: v1 save with 437 XP → v2 with", migrated.xp, "XP, all progress kept");

/* ---------- Minigame XP ---------- */
let s = { ...E.freshState(), lastActiveDate: E.dateKey(day(0)), streak: 1 }; // already earned today (no streak bonus noise)
let r = E.recordMinigame(s, { game: "quiz", subject: "Physics", score: 6, total: 8 }, day(0));
assert.strictEqual(r.paid, 6 * M.perCorrect, "+2 per correct");
assert.strictEqual(r.total, 12);
assert.ok(r.newBest && r.state.minigames.quiz.best.Physics === 6);
s = r.state;
r = E.recordMinigame(s, { game: "quiz", subject: "Physics", score: 8, total: 8 }, day(0));
assert.strictEqual(r.paid, 8 * M.perCorrect + M.perfectBonus, "+10 bonus for 8/8");
assert.strictEqual(r.state.minigames.quiz.best.Physics, 8);
s = r.state;
assert.strictEqual(E.minigameXPLeft(s, day(0)), M.dailyCap - 12 - 26);
// A worse score doesn't replace the best
r = E.recordMinigame(s, { game: "quiz", subject: "Physics", score: 3, total: 8 }, day(0));
assert.strictEqual(r.state.minigames.quiz.best.Physics, 8); assert.ok(!r.newBest);
assert.strictEqual(r.paid, 2, "only 2 XP left under the cap"); assert.ok(r.capped);
s = r.state;

/* ---------- Daily cap ---------- */
assert.strictEqual(E.minigameXPLeft(s, day(0)), 0);
const xpBefore = s.xp;
for (let i = 0; i < 50; i++) {
  r = E.recordMinigame(s, { game: "quiz", subject: "Mixed", score: 8, total: 8 }, day(0, 20));
  assert.strictEqual(r.total, 0, "no XP once the cap is reached"); assert.ok(r.capped);
  s = r.state;
}
assert.strictEqual(s.xp, xpBefore, "playing 50 more perfect games the same day adds 0 XP");
assert.strictEqual(s.minigames.quiz.best.Mixed, 8, "best scores still save at the cap");
// Next day the cap resets
r = E.recordMinigame(s, { game: "quiz", subject: "Maths", score: 5, total: 8 }, day(1));
assert.strictEqual(r.paid, 10); assert.strictEqual(E.minigameXPLeft(r.state, day(1)), M.dailyCap - 10);
// Over a whole day of play, minigames can never pay more than the cap
s = E.freshState(); let fromGames = 0;
for (let i = 0; i < 30; i++) { r = E.recordMinigame(s, { game: "quiz", subject: "Mixed", score: 1 + (i % 8), total: 8 }, day(2, 9)); fromGames += r.paid; s = r.state; }
assert.strictEqual(fromGames, M.dailyCap);
// The cap doesn't block the once-a-day streak bonus (that isn't minigame XP)
r = E.recordMinigame(E.freshState(), { game: "quiz", subject: "Maths", score: 2, total: 8 }, day(3));
assert.deepStrictEqual(r.gains.map((g) => g.amount), [4, C.streak.start]);
console.log(`Minigame XP: +${M.perCorrect} per correct, +${M.perfectBonus} for 8/8, capped at ${M.dailyCap}/day (50 extra perfect games added 0 XP)`);
console.log("All minigame XP tests passed ✅");
