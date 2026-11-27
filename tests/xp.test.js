// Run with:  node tests/xp.test.js
const assert = require("assert");
const E = require("../xp/engine.js");
const C = require("../xp/config.js");

const day = (n) => new Date(2026, 0, 1 + n, 12, 0, 0); // Jan 1 2026 + n days, midday local time
const run = (state, events, now) => events.reduce((s, e) => E.award(s, e, now).state, state);

/* ---------- Level curve ---------- */
assert.strictEqual(E.levelInfo(0).level, 1);
assert.strictEqual(E.levelInfo(E.totalXPForLevel(2) - 1).level, 1);
assert.strictEqual(E.levelInfo(E.totalXPForLevel(2)).level, 2);
const l2 = E.totalXPForLevel(2);
assert.ok(l2 >= 40 && l2 <= 60, `Level 2 should come after about 50 XP (got ${l2})`);
// Each level needs more XP than the one before ("steadily slower")
for (let l = 1; l < 60; l++) assert.ok(E.xpToLevelUp(l + 1) > E.xpToLevelUp(l), `level ${l}`);
// levelInfo agrees with totalXPForLevel everywhere, and progress stays 0..1
for (let l = 1; l < 60; l++) {
  const t = E.totalXPForLevel(l);
  assert.strictEqual(E.levelInfo(t).level, l);
  assert.strictEqual(E.levelInfo(t).xpIntoLevel, 0);
  assert.strictEqual(E.levelInfo(t + E.xpToLevelUp(l) - 1).level, l);
}
for (let xp = 0; xp < 5000; xp += 37) { const p = E.levelInfo(xp).progress; assert.ok(p >= 0 && p <= 1); }
assert.strictEqual(E.levelInfo(1e9).level, C.levels.maxLevel);
console.log("Level curve: L2 at", l2, "XP, L5 at", E.totalXPForLevel(5), "XP, L10 at", E.totalXPForLevel(10), "XP");

/* ---------- Ranks: one every 5 levels, original names ---------- */
assert.strictEqual(E.rankFor(1), C.ranks[0]);
assert.strictEqual(E.rankFor(4), C.ranks[0]);
assert.strictEqual(E.rankFor(5), C.ranks[1]);
assert.strictEqual(E.rankFor(9), C.ranks[1]);
assert.strictEqual(E.rankFor(10), C.ranks[2]);
assert.strictEqual(E.rankFor(15), C.ranks[3]);
assert.strictEqual(E.rankFor(99), C.ranks[C.ranks.length - 1]);
const banned = ["saiyan", "kamehameha", "dragon", "goku", "vegeta", "frieza", "kaio", "senzu", "namek", "scouter"];
for (const name of C.ranks.concat(C.auras.map((a) => a.name))) {
  assert.ok(!banned.some((b) => name.toLowerCase().includes(b)), `"${name}" must be an original name`);
}

/* ---------- XP rules ---------- */
let r = E.award(E.freshState(), { type: "openConcept", conceptId: "taylor" }, day(0));
assert.deepStrictEqual(r.gains.map((g) => g.amount), [C.firstOpenConcept, C.streak.start]);
let s = r.state;
assert.strictEqual(s.xp, C.firstOpenConcept + C.streak.start);
assert.strictEqual(E.award(s, { type: "openConcept", conceptId: "taylor" }, day(0)).total, 0, "re-opening pays 0");
assert.strictEqual(E.award(s, { type: "openConcept", conceptId: "vectors" }, day(0)).total, C.firstOpenConcept, "a new concept pays, no 2nd streak bonus today");

r = E.award(s, { type: "correctAnswer", questionId: "q1" }, day(0));
assert.strictEqual(r.total, C.firstCorrectQuestion);
s = r.state;
r = E.award(s, { type: "perfectScore", conceptId: "taylor" }, day(0));
assert.strictEqual(r.total, C.perfectScore);
s = r.state;
assert.strictEqual(E.award(s, { type: "perfectScore", conceptId: "taylor" }, day(0)).total, 0, "perfect pays once per concept");
assert.strictEqual(E.award(s, { type: "nonsense" }, day(0)).total, 0);
assert.strictEqual(E.award(s, { type: "correctAnswer" }, day(0)).total, 0, "missing id pays nothing");
// award() never changes the state passed in
const frozen = JSON.stringify(s);
E.award(s, { type: "correctAnswer", questionId: "q2" }, day(0));
assert.strictEqual(JSON.stringify(s), frozen);

/* ---------- Anti-farming: a question only ever pays once ---------- */
s = E.freshState();
s = E.award(s, { type: "correctAnswer", questionId: "taylor-3-terms" }, day(0)).state;
const afterFirst = s.xp;
for (let i = 0; i < 1000; i++) {
  r = E.award(s, { type: "correctAnswer", questionId: "taylor-3-terms" }, day(0));
  assert.strictEqual(r.total, 0);
  s = r.state;
}
assert.strictEqual(s.xp, afterFirst);
// Retaking on a NEW day still pays 0, and doesn't start a streak day either
r = E.award(s, { type: "correctAnswer", questionId: "taylor-3-terms" }, day(1));
assert.strictEqual(r.total, 0);
assert.strictEqual(r.state.streak, 1);
assert.strictEqual(r.state.lastActiveDate, E.dateKey(day(0)));
// Doing EVERYTHING over and over for 30 days can't exceed a fixed maximum
const all = [];
for (const c of ["taylor", "vectors", "projectile"]) all.push({ type: "openConcept", conceptId: c }, { type: "perfectScore", conceptId: c });
for (let q = 0; q < 15; q++) all.push({ type: "correctAnswer", questionId: "q" + q });
s = E.freshState();
for (let d = 0; d < 30; d++) for (let rep = 0; rep < 5; rep++) s = run(s, all, day(d));
const content = 3 * C.firstOpenConcept + 3 * C.perfectScore + 15 * C.firstCorrectQuestion;
// Only the first day earns anything (everything is used up), so only one streak bonus.
assert.strictEqual(s.xp, content + C.streak.start);
console.log("Anti-farming: 30 days × 5 repeats of everything =", s.xp, "XP (content", content, "+ one streak bonus)");

/* ---------- Streaks ---------- */
const earnOn = (state, d, id) => E.award(state, { type: "correctAnswer", questionId: id || "d" + d }, day(d));
s = E.freshState();
r = earnOn(s, 0); assert.strictEqual(r.state.streak, 1); assert.strictEqual(r.gains[1].amount, C.streak.start);
r = earnOn(r.state, 0, "extra"); assert.strictEqual(r.gains.length, 1, "no second bonus the same day");
r = earnOn(r.state, 1); assert.strictEqual(r.state.streak, 2); assert.strictEqual(r.gains[1].amount, C.streak.start + C.streak.perDay);
r = earnOn(r.state, 2); assert.strictEqual(r.state.streak, 3); assert.strictEqual(r.gains[1].amount, C.streak.start + 2 * C.streak.perDay);
// Skip a day (no day 3) -> streak restarts at 1
r = earnOn(r.state, 4); assert.strictEqual(r.state.streak, 1); assert.strictEqual(r.gains[1].amount, C.streak.start);
// Shown streak: alive today and tomorrow, 0 after a missed day
assert.strictEqual(E.currentStreak(r.state, day(4)), 1);
assert.strictEqual(E.currentStreak(r.state, day(5)), 1);
assert.strictEqual(E.currentStreak(r.state, day(6)), 0);
// Cap: 30 days in a row, the bonus rises by 1 a day then stays at the max
s = E.freshState();
const bonuses = [];
for (let d = 0; d < 30; d++) { r = earnOn(s, d); s = r.state; bonuses.push(r.gains.find((g) => g.streak).amount); }
assert.strictEqual(s.streak, 30);
assert.strictEqual(Math.max(...bonuses), C.streak.max);
bonuses.forEach((b, i) => assert.strictEqual(b, Math.min(C.streak.max, C.streak.start + i * C.streak.perDay)));
console.log("Streak bonuses for days 1-14:", bonuses.slice(0, 14).join(", "));
// Month and year boundaries count as consecutive days
const jan31 = new Date(2026, 0, 31, 23, 50), feb1 = new Date(2026, 1, 1, 0, 10);
s = E.award(E.freshState(), { type: "correctAnswer", questionId: "a" }, jan31).state;
assert.strictEqual(E.award(s, { type: "correctAnswer", questionId: "b" }, feb1).state.streak, 2);
const dec31 = new Date(2026, 11, 31, 20), jan1 = new Date(2027, 0, 1, 9);
s = E.award(E.freshState(), { type: "correctAnswer", questionId: "a" }, dec31).state;
assert.strictEqual(E.award(s, { type: "correctAnswer", questionId: "b" }, jan1).state.streak, 2);

/* ---------- Level-ups and aura unlocks ---------- */
s = E.freshState();
s.xp = E.totalXPForLevel(5) - C.firstCorrectQuestion; s.level = E.levelInfo(s.xp).level; s.lastActiveDate = E.dateKey(day(0)); s.streak = 1;
r = E.award(s, { type: "correctAnswer", questionId: "x" }, day(0));
assert.ok(r.leveledUp); assert.strictEqual(r.newLevel, 5); assert.strictEqual(r.newRank, C.ranks[1]);
assert.deepStrictEqual(r.newAuras.map((a) => a.id), ["cyan"]);
assert.ok(r.state.unlockedAuras.includes("cyan"));
assert.strictEqual(E.chooseAura(r.state, "cyan").chosenAura, "cyan");
assert.strictEqual(E.chooseAura(r.state, "whitegold").chosenAura, "amber", "can't pick a locked aura");
assert.deepStrictEqual(E.aurasForLevel(15), ["amber", "cyan", "red", "whitegold"]);
assert.deepStrictEqual(E.aurasForLevel(9), ["amber", "cyan"]);

/* ---------- Loading saved data safely ---------- */
const tampered = E.normalizeState({ version: 1, xp: -50, level: 80, streak: "lots", completedQuestions: ["a", "a", 7], unlockedAuras: ["whitegold"], chosenAura: "whitegold" });
assert.strictEqual(tampered.xp, 0); assert.strictEqual(tampered.level, 1); assert.strictEqual(tampered.streak, 0);
assert.deepStrictEqual(tampered.completedQuestions, ["a"]);
assert.strictEqual(tampered.chosenAura, "amber");
assert.deepStrictEqual(E.normalizeState({ version: 999, xp: 500 }), E.freshState(), "unknown version starts fresh");
assert.deepStrictEqual(E.normalizeState(null), E.freshState());

/* ---------- Storage (with a fake localStorage) ---------- */
const Storage = require("../xp/storage.js");
const fake = {};
globalThis.localStorage = { getItem: (k) => (k in fake ? fake[k] : null), setItem: (k, v) => { fake[k] = String(v); }, removeItem: (k) => { delete fake[k]; } };
s = E.award(E.freshState(), { type: "openConcept", conceptId: "taylor" }, day(0)).state;
assert.strictEqual(Storage.save(s), true);
assert.deepStrictEqual(Object.keys(fake), [Storage.KEY], "everything saved under ONE key");
assert.strictEqual(JSON.parse(fake[Storage.KEY]).version, E.VERSION);
assert.deepStrictEqual(Storage.load(), s, "save then load gives the same progress");
fake[Storage.KEY] = "{not json";
assert.deepStrictEqual(Storage.load().seenConcepts, ["taylor"], "corrupted data falls back to this visit's copy");
Storage.clear();
assert.deepStrictEqual(Storage.load(), E.freshState(), "reset wipes progress");
// Storage blocked entirely: nothing throws, progress still works for this visit
globalThis.localStorage = { getItem() { throw new Error("blocked"); }, setItem() { throw new Error("blocked"); }, removeItem() { throw new Error("blocked"); } };
assert.deepStrictEqual(Storage.load(), E.freshState());
assert.strictEqual(Storage.save(s), false);
assert.deepStrictEqual(Storage.load(), s, "keeps progress in memory when storage is blocked");
assert.strictEqual(Storage.clear(), false);
Object.defineProperty(globalThis, "localStorage", { get() { throw new Error("SecurityError"); }, configurable: true });
assert.deepStrictEqual(Storage.load(), E.freshState());
assert.strictEqual(Storage.save(s), false);
delete globalThis.localStorage;

console.log("All XP tests passed ✅");
