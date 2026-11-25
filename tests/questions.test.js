// Run with:  node tests/questions.test.js
// Checks every quiz question: structure, and that the marked answer is
// actually right, using the SAME maths code the graphs use.
//
// Questions are found automatically in questions/<id>.js. Each concept has a
// matching tests/checks/<id>.js that CALCULATES the right answers.
const assert = require("assert");
const fs = require("fs");
const path = require("path");
const { checkAnswer, shuffle } = require("../quiz.js");

const ids = (dir) => fs.readdirSync(path.join(__dirname, dir)).filter((f) => f.endsWith(".js") && !f.startsWith("_")).map((f) => f.slice(0, -3)).sort();
const BANKS = {}, CHECKS = {}, CONCEPTUAL = new Set();
for (const id of ids("../questions")) {
  BANKS[id] = require(`../questions/${id}.js`);
  const checkFile = path.join(__dirname, "checks", id + ".js");
  assert.ok(fs.existsSync(checkFile), `missing tests/checks/${id}.js for questions/${id}.js`);
  const c = require(checkFile);
  Object.assign(CHECKS, c.checks);
  c.conceptual.forEach((q) => CONCEPTUAL.add(q));
}

let total = 0;
const seen = new Set();
for (const [concept, bank] of Object.entries(BANKS)) {
  assert.strictEqual(bank.length, 5, `${concept} should have 5 questions`);
  for (const q of bank) {
    const where = `${concept} / ${q.id}`;
    total++;

    // Structure
    assert.ok(q.id && !seen.has(q.id), `${where}: id missing or duplicated`);
    assert.ok(q.id.startsWith(concept + "-"), `${where}: id should start with "${concept}-"`);
    seen.add(q.id);
    assert.ok(q.question && q.question.trim().length > 10, `${where}: question text`);
    assert.ok(q.explanation && q.explanation.trim().length > 20, `${where}: explanation`);
    assert.ok(Array.isArray(q.options) && q.options.length === 4, `${where}: needs exactly 4 options`);
    assert.ok(Number.isInteger(q.correct) && q.correct >= 0 && q.correct <= 3, `${where}: correct must be 0, 1, 2 or 3`);

    // No duplicate options (ignoring spaces/case), and no two numbers that are equal (e.g. "5" vs "5.0")
    // Ignore spaces (capitals DO count: in genetics BB, Bb and bb are different answers)
    const norm = q.options.map((o) => o.replace(/\s+/g, ""));
    assert.strictEqual(new Set(norm).size, 4, `${where}: duplicate options ${JSON.stringify(q.options)}`);
    // Only options that are ONE number (with an optional unit), e.g. "16 N", "62.6 m/s", "5"
    const single = (o) => (o.match(/\d+(\.\d+)?/g) || []).length === 1 && /^[−-]?\d/.test(o.trim());
    const nums = q.options.filter(single).map((o) => parseFloat(o.trim().replace("−", "-")));
    assert.strictEqual(new Set(nums).size, nums.length, `${where}: two options are the same number`);

    // Exactly one correct option: only the marked index passes the answer check
    const passing = q.options.map((_, k) => checkAnswer(q, k).correct).filter(Boolean).length;
    assert.strictEqual(passing, 1, `${where}: exactly one option should be correct`);

    // The marked answer is really right
    if (CHECKS[q.id]) {
      const expected = CHECKS[q.id](q);
      assert.strictEqual(q.options[q.correct], expected,
        `${where}: marked answer "${q.options[q.correct]}" but the maths says "${expected}"`);
      assert.strictEqual(q.options.filter((o) => o === expected).length, 1, `${where}: correct answer appears once`);
    } else {
      assert.ok(CONCEPTUAL.has(q.id), `${where}: add a check in tests/checks/${concept}.js (or list it under conceptual if it isn't about a number)`);
    }
  }
}
// No leftover checks for questions that were deleted or renamed
for (const id of Object.keys(CHECKS)) assert.ok(seen.has(id), `a checks file has "${id}" but no question uses it`);
for (const id of CONCEPTUAL) assert.ok(seen.has(id), `conceptual list has "${id}" but no question uses it`);

// checkAnswer and shuffle
const sample = BANKS.vectors[1];
assert.deepStrictEqual(checkAnswer(sample, sample.correct), { correct: true, correctIndex: sample.correct, explanation: sample.explanation });
assert.strictEqual(checkAnswer(sample, (sample.correct + 1) % 4).correct, false);
const shuffled = shuffle(BANKS.taylor);
assert.strictEqual(shuffled.length, 5);
assert.deepStrictEqual(shuffled.map((q) => q.id).sort(), BANKS.taylor.map((q) => q.id).sort());
assert.notStrictEqual(shuffled, BANKS.taylor, "shuffle must not change the original list");

console.log(`Checked ${total} questions (${Object.keys(CHECKS).length} numeric/computed, ${CONCEPTUAL.size} conceptual)`);
console.log("All question tests passed ✅");
