// Run with:  node tests/games.test.js
// 3-Second Quiz: question selection, timer rules, results.
const assert = require("assert");
const fs = require("fs");
const path = require("path");
const G = require("../games/quiz.js");
const { rng } = require("../concepts/natural-selection.js"); // seeded random numbers

// Build each subject's question pool, like the game does (subject = the concept's tag)
const root = path.join(__dirname, "..");
const pools = { Mixed: [] };
for (const f of fs.readdirSync(path.join(root, "questions"))) {
  const id = f.slice(0, -3);
  const tag = fs.readFileSync(path.join(root, "concepts", f), "utf8").match(/tag: "([^"]+)"/)[1];
  const qs = require(`../questions/${f}`);
  (pools[tag] = pools[tag] || []).push(...qs);
  pools.Mixed.push(...qs);
}
assert.deepStrictEqual(Object.keys(pools).sort(), [...G.SUBJECTS].sort());

/* ---------- Selection: 8 questions, 2 per tier, no duplicates ---------- */
for (const subject of G.SUBJECTS) {
  for (let seed = 1; seed <= 300; seed++) {
    const picked = G.pickQuestions(pools[subject], rng(seed));
    assert.strictEqual(picked.length, 8, `${subject}: 8 questions`);
    assert.deepStrictEqual(picked.map((p) => p.tier), [0, 0, 1, 1, 2, 2, 3, 3], "2 per tier, easy → expert");
    const ids = picked.map((p) => p.question.id);
    assert.strictEqual(new Set(ids).size, 8, `${subject} seed ${seed}: no duplicates in a game`);
    picked.forEach((p) => {
      assert.ok(pools[subject].includes(p.question), "question comes from the chosen subject");
      // Every subject has 2+ questions per tier, so each question's own difficulty matches its slot
      assert.strictEqual(p.question.difficulty, G.TIERS[p.tier].id);
    });
  }
}
// Different games get different questions
const a = G.pickQuestions(pools.Physics, rng(1)).map((p) => p.question.id).join();
const b = G.pickQuestions(pools.Physics, rng(2)).map((p) => p.question.id).join();
assert.notStrictEqual(a, b);
// Same seed, same game (repeatable)
assert.strictEqual(G.pickQuestions(pools.Physics, rng(7)).map((p) => p.question.id).join(), G.pickQuestions(pools.Physics, rng(7)).map((p) => p.question.id).join());

/* ---------- Filling from the nearest tier ---------- */
const mk = (difficulty, n) => Array.from({ length: n }, (_, i) => ({ id: `${difficulty}-${i}`, difficulty }));
// No expert questions at all: the expert slots are filled from hard (the nearest)
let pool = [...mk("easy", 3), ...mk("medium", 3), ...mk("hard", 4)];
let picked = G.pickQuestions(pool, rng(3));
assert.strictEqual(picked.length, 8);
assert.deepStrictEqual(picked.slice(6).map((p) => p.question.difficulty), ["hard", "hard"]);
assert.strictEqual(new Set(picked.map((p) => p.question.id)).size, 8);
// Only 1 medium: the second medium slot is filled from easy (tie between easy and hard → easier)
pool = [...mk("easy", 4), ...mk("medium", 1), ...mk("hard", 3), ...mk("expert", 2)];
picked = G.pickQuestions(pool, rng(4));
assert.deepStrictEqual(picked.slice(2, 4).map((p) => p.question.difficulty).sort(), ["easy", "medium"]);
// Fewer than 8 questions in total: just use them all, once each
picked = G.pickQuestions(mk("hard", 5), rng(5));
assert.strictEqual(picked.length, 5); assert.strictEqual(new Set(picked.map((p) => p.question.id)).size, 5);

/* ---------- Timer rules ---------- */
const q = { correct: 2 };
assert.deepStrictEqual(G.judge(q, 2, 1000, 1000 + 2999), { correct: true, timedOut: false }, "right answer in time");
assert.deepStrictEqual(G.judge(q, 1, 1000, 1500), { correct: false, timedOut: false }, "wrong answer in time");
assert.deepStrictEqual(G.judge(q, 2, 1000, 1000 + 3000), { correct: false, timedOut: true }, "right answer but too late = wrong");
assert.deepStrictEqual(G.judge(q, null, 1000, 1000 + 3000), { correct: false, timedOut: true }, "no answer = time's up = wrong");
assert.strictEqual(G.LIMIT_MS, 3000);
assert.strictEqual(G.timeLeft(0, 1200), 1800);
assert.strictEqual(G.timeLeft(0, 5000), 0, "never negative");

/* ---------- Results ---------- */
const res = (pattern) => pattern.map((c, i) => ({ correct: c === 1, tier: Math.floor(i / 2) }));
assert.strictEqual(G.tierReached(res([1, 1, 1, 0, 0, 0, 0, 0])), 1, "reached Medium");
assert.strictEqual(G.tierReached(res([0, 0, 0, 0, 0, 0, 0, 1])), 3, "a correct Expert counts");
assert.strictEqual(G.tierReached(res([0, 0, 0, 0, 0, 0, 0, 0])), -1);
assert.ok(G.rankMessage(8).includes("Perfect"));
for (let s = 0; s <= 8; s++) assert.ok(G.rankMessage(s).length > 5);
assert.strictEqual(
  G.shareText("Physics", 6, 8, "https://example.vercel.app/#games/quiz"),
  "I got 6/8 on the Super Science Physics Quiz 🔥 Can you beat me? https://example.vercel.app/#games/quiz");
assert.ok(G.shareText("Mixed", 3, 8, "x").includes("Super Science Mixed Quiz"));

const counts = Object.fromEntries(G.SUBJECTS.map((s) => [s, pools[s].length]));
console.log("3-Second Quiz: questions per subject", JSON.stringify(counts), "| 1500 games: always 8, 2 per tier, no repeats");
console.log("All minigame tests passed ✅");
