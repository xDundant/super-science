// Run with:  node tests/maths-batch1.test.js
// Euler's number e, Euler's identity and integration.
const assert = require("assert");
const { compound, STEPS } = require("../concepts/euler-e.js");
const { expi, mul, I } = require("../concepts/euler-identity.js");
const { leftSum, EXACT } = require("../concepts/integration.js");
const close = (a, b, tol, msg) => assert.ok(Math.abs(a - b) < tol, `${msg || ""} ${a} is not within ${tol} of ${b}`);

/* e from compound interest */
close(compound(1), 2, 1e-12);
close(compound(2), 2.25, 1e-12);
close(compound(4), 2.44140625, 1e-12);          // 1.25^4
close(compound(12), 2.613035290224676, 1e-12);
close(compound(365), 2.714567482021973, 1e-9);
close(compound(1e6), Math.E, 2e-6, "a million times a year");
close(Math.E, 2.718281828459045, 1e-15);
// Always increasing, never above e
for (let i = 1; i < STEPS.length; i++) assert.ok(compound(STEPS[i][0]) > compound(STEPS[i - 1][0]));
STEPS.forEach(([n]) => assert.ok(compound(n) < Math.E));
assert.deepStrictEqual(STEPS.map((s) => s[0]), [1, 2, 4, 12, 52, 365, 8760, 1000000]);
console.log("e: (1+1/n)^n for n = 1…1,000,000:", STEPS.map(([n]) => compound(n).toFixed(5)).join(", "));

/* Euler's identity */
const z = expi(Math.PI);
close(z.re, -1, 1e-15, "e^(iπ) real part");
close(z.im, 0, 1e-15, "e^(iπ) imaginary part");
close(z.re + 1, 0, 1e-15, "e^(iπ) + 1");
// Multiplying by i rotates 90°: e^(iθ) × i = e^(i(θ + π/2))
for (let t = 0; t < 7; t += 0.37) {
  const a = mul(expi(t), I), b = expi(t + Math.PI / 2);
  close(a.re, b.re, 1e-12); close(a.im, b.im, 1e-12);
}
close(mul(I, I).re, -1, 1e-15, "i² = −1");
console.log("Euler's identity: e^(iπ) =", z.re, "+", z.im.toExponential(1) + "i  → e^(iπ) + 1 ≈ 0");

/* Integration: left strips converge to 9 */
assert.strictEqual(EXACT, 9);
assert.strictEqual(leftSum(1), 0);
close(leftSum(3), 5, 1e-12);
// closed form for left sums of t² on [0,3]: 9(n−1)(2n−1)/(2n²)
for (let n = 1; n <= 50; n++) close(leftSum(n), (9 * (n - 1) * (2 * n - 1)) / (2 * n * n), 1e-9, `n=${n}`);
let lastErr = Infinity;
for (let n = 1; n <= 50; n++) { const err = EXACT - leftSum(n); assert.ok(err > 0 && err < lastErr, `error shrinks at n=${n}`); lastErr = err; }
close(leftSum(100000), 9, 1e-3, "lots of strips");
console.log("Integration: strips 1, 5, 10, 50 →", [1, 5, 10, 50].map((n) => leftSum(n).toFixed(4)).join(", "), "→ 9");

console.log("All Batch 1 maths tests passed ✅");
