// Answer checks for questions/integration.js
const { assert, num } = require("./_helpers.js");
const { leftSum, EXACT } = require("../../concepts/integration.js");

module.exports = {
  checks: {
    "integration-exact": () => {
      // Check the "exact" value with a very fine midpoint sum, independent of the formula.
      let s = 0; const n = 100000, dt = 3 / n;
      for (let k = 0; k < n; k++) { const t = (k + 0.5) * dt; s += t * t * dt; }
      assert.ok(Math.abs(s - EXACT) < 1e-6);
      return num(EXACT);
    },
    "integration-3-strips": () => num(leftSum(3)),
    "integration-1-strip": () => num(leftSum(1)),
    "integration-6-strips": () => String(leftSum(6)),
    "integration-too-small": () => {
      for (let n = 1; n <= 50; n++) assert.ok(leftSum(n) < EXACT, `n=${n}`);
      return "Too small";
    },
  },
  conceptual: [],
};
