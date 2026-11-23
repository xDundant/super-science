// Run with:  node tests/taylor.test.js
const assert = require("assert");
const { taylorSin, polynomialLabel } = require("../app.js");

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

console.log("All maths tests passed ✅");
