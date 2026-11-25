// Run with:  node tests/questions.test.js
// Checks every quiz question: structure, and that the marked answer is
// actually right, using the SAME maths code the graphs use.
const assert = require("assert");
const { taylorSin, polynomialLabel } = require("../concepts/taylor.js");
const { fromPolar, add, magnitude, angleDeg } = require("../concepts/vectors.js");
const { range, timeOfFlight, maxHeight } = require("../concepts/projectile.js");
const { checkAnswer, shuffle } = require("../quiz.js");

const BANKS = {
  taylor: require("../questions/taylor.js"),
  vectors: require("../questions/vectors.js"),
  projectile: require("../questions/projectile.js"),
};

// Format a number the way the options are written: up to 2 decimals, no trailing zeros.
const num = (x) => String(Number(x.toFixed(2)) + 0);
const argMax = (from, to, fn) => { let best = from; for (let a = from; a <= to; a++) if (fn(a) > fn(best)) best = a; return best; };
const lastTerm = (n) => polynomialLabel(n).slice(polynomialLabel(n - 1).length).replace(/\s+/g, "");

/* For each question id: compute the right answer in code and return the exact
 * option text that must be marked correct. */
const CHECKS = {
  // Taylor
  "taylor-3-terms": () => polynomialLabel(3),
  "taylor-1-term": () => `The straight line y = ${polynomialLabel(1)}`,
  "taylor-value-at-1": () => taylorSin(1, 2).toFixed(3),
  "taylor-4th-term": () => lastTerm(4),
  "taylor-most-accurate": (q) => {
    // Error near 0 must be smaller than near 2π or π for every slider setting.
    for (let n = 1; n <= 10; n++) {
      const err = (x) => Math.abs(taylorSin(x, n) - Math.sin(x));
      assert.ok(err(0.5) < err(2 * Math.PI - 0.5) && err(0.5) < err(Math.PI), `n=${n}`);
    }
    return "Near x = 0";
  },

  // Vectors
  "vectors-3-4-magnitude": () => num(magnitude(add(fromPolar(3, 0), fromPolar(4, 90)))),
  "vectors-3-4-angle": () => Math.round(angleDeg(add(fromPolar(3, 0), fromPolar(4, 90)))) + "°",
  "vectors-cancel": () => num(magnitude(add(fromPolar(4, 0), fromPolar(4, 180)))),
  "vectors-max-length": (q) => {
    const sizeAt = (bAngle) => magnitude(add(fromPolar(5, 0), fromPolar(3, bAngle)));
    let biggest = 0;
    for (let a = 0; a < 360; a++) biggest = Math.max(biggest, sizeAt(a));
    assert.strictEqual(num(sizeAt(90)), "5.83", "explanation says right angles give 5.83");
    return num(biggest);
  },

  // Projectile
  "projectile-best-angle": () => argMax(0, 90, (a) => range(20, a)) + "°",
  "projectile-range-20-45": () => range(20, 45).toFixed(1) + " m",
  "projectile-same-landing": (q) => {
    assert.ok(q.question.includes(range(20, 30).toFixed(1) + " m"), "range quoted in the question");
    const matches = q.options.filter((o) => {
      const a = parseFloat(o);
      return a !== 30 && Math.abs(range(20, a) - range(20, 30)) < 1e-9;
    });
    assert.strictEqual(matches.length, 1, "exactly one option should land in the same spot");
    return matches[0];
  },
  "projectile-straight-up-time": () => {
    assert.strictEqual((20 / 9.8).toFixed(2), "2.04", "explanation says 2.04 s to the top");
    return timeOfFlight(20, 90).toFixed(2) + " s";
  },
  "projectile-double-speed": () => {
    const ratios = [10, 30, 45, 70].map((a) => range(40, a) / range(20, a));
    ratios.forEach((r) => assert.ok(Math.abs(r - ratios[0]) < 1e-9));
    return `It becomes ${num(ratios[0])} times bigger`;
  },
};

// Questions about ideas rather than numbers (checked by reading, not by code).
const CONCEPTUAL = new Set(["vectors-tip-to-tail"]);

let total = 0;
const ids = new Set();
for (const [concept, bank] of Object.entries(BANKS)) {
  assert.strictEqual(bank.length, 5, `${concept} should have 5 questions`);
  for (const q of bank) {
    const where = `${concept} / ${q.id}`;
    total++;

    // Structure
    assert.ok(q.id && !ids.has(q.id), `${where}: id missing or duplicated`);
    ids.add(q.id);
    assert.ok(q.question && q.question.trim().length > 10, `${where}: question text`);
    assert.ok(q.explanation && q.explanation.trim().length > 20, `${where}: explanation`);
    assert.ok(Array.isArray(q.options) && q.options.length === 4, `${where}: needs exactly 4 options`);
    assert.ok(Number.isInteger(q.correct) && q.correct >= 0 && q.correct <= 3, `${where}: correct must be 0, 1, 2 or 3`);

    // No duplicate options (ignoring spaces/case), and no two numbers that are equal (e.g. "5" vs "5.0")
    const norm = q.options.map((o) => o.replace(/\s+/g, "").toLowerCase());
    assert.strictEqual(new Set(norm).size, 4, `${where}: duplicate options ${JSON.stringify(q.options)}`);
    const nums = q.options.map((o) => o.trim()).filter((o) => /^[−-]?\d/.test(o)).map(parseFloat);
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
      assert.ok(CONCEPTUAL.has(q.id), `${where}: add a check in CHECKS (or list it in CONCEPTUAL if it isn't about a number)`);
    }
  }
}
// No leftover checks for questions that were deleted or renamed
for (const id of Object.keys(CHECKS)) assert.ok(ids.has(id), `CHECKS has "${id}" but no question uses it`);

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
