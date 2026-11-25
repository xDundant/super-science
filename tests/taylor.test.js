// Run with:  node tests/taylor.test.js
const assert = require("assert");
const { taylorSin, polynomialLabel } = require("../concepts/taylor.js");

// n = 1 is just "x"
assert.strictEqual(taylorSin(2, 1), 2);
// n = 2 at x = 1: 1 - 1/6
assert.ok(Math.abs(taylorSin(1, 2) - (1 - 1 / 6)) < 1e-15);
// n = 3 at x = 2: 2 - 8/6 + 32/120
assert.ok(Math.abs(taylorSin(2, 3) - (2 - 8 / 6 + 32 / 120)) < 1e-12);

// n = 10 at x = π should match sin(π) = 0 very closely
const errPi = Math.abs(taylorSin(Math.PI, 10) - Math.sin(Math.PI));
console.log("n=10, x=π   error:", errPi.toExponential(2));
assert.ok(errPi < 1e-8);

// n = 10 should be close to sin(x) everywhere on [-π, π]
let maxErr = 0;
for (let x = -Math.PI; x <= Math.PI; x += 0.001) maxErr = Math.max(maxErr, Math.abs(taylorSin(x, 10) - Math.sin(x)));
console.log("n=10, max error on [-π, π]:", maxErr.toExponential(2));
assert.ok(maxErr < 1e-8);

// Each extra term should make the error at x = π smaller
for (let n = 1; n < 10; n++) {
  assert.ok(Math.abs(taylorSin(Math.PI, n + 1)) < Math.abs(taylorSin(Math.PI, n)));
}

// Labels
assert.strictEqual(polynomialLabel(1), "x");
assert.strictEqual(polynomialLabel(3), "x − x³/3! + x⁵/5!");
assert.ok(polynomialLabel(10).endsWith("− x¹⁹/19!"));
console.log("label n=10:", polynomialLabel(10));

// Smooth morphing: fractional terms
const { taylorSinBlend } = require("../concepts/taylor.js");
for (let n = 1; n <= 10; n++) for (let x = -6.2; x <= 6.2; x += 0.31) {
  assert.ok(Math.abs(taylorSinBlend(x, n) - taylorSin(x, n)) < 1e-12, `whole numbers match at n=${n}`);
}
// Halfway between 2 and 3 terms is exactly halfway between the two polynomials
for (let x = -6; x <= 6; x += 0.5) {
  const mid = (taylorSin(x, 2) + taylorSin(x, 3)) / 2;
  assert.ok(Math.abs(taylorSinBlend(x, 2.5) - mid) < 1e-12, `n=2.5 at x=${x}`);
}
// No jumps: a tiny slider move makes a tiny change everywhere on the graph
// (measured on what's visible: the graph shows y from −3 to 3)
const visible = (y) => Math.max(-3, Math.min(3, y));
const jump = (step) => {
  let biggest = 0;
  for (let n = 1; n + step <= 10; n += 0.01) for (let x = -2 * Math.PI; x <= 2 * Math.PI; x += 0.05) {
    biggest = Math.max(biggest, Math.abs(visible(taylorSinBlend(x, n + step)) - visible(taylorSinBlend(x, n))));
  }
  return biggest;
};
const j1 = jump(0.01), j2 = jump(0.005), j3 = jump(0.001);
console.log(`Largest visible change: ${j1.toFixed(3)} for a 0.01 step, ${j3.toFixed(4)} for a 0.001 step (graph height is 6)`);
// Continuous = smaller slider steps give proportionally smaller changes (no sudden jumps).
assert.ok(j2 < j1 * 0.6 && j3 < j1 * 0.15, "changes shrink with the step: continuous, no jumps");
// And whole-number steps (the old behaviour) were far bigger jumps than a 0.01 step
assert.ok(jump(1) > 5 * j1);

console.log("All maths tests passed ✅");
