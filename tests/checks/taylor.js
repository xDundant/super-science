// Answer checks for questions/taylor.js: each returns the option text that must be marked correct.
const { assert } = require("./_helpers.js");
const { taylorSin, polynomialLabel } = require("../../concepts/taylor.js");
const lastTerm = (n) => polynomialLabel(n).slice(polynomialLabel(n - 1).length).replace(/\s+/g, "");

module.exports = {
  checks: {
    "taylor-3-terms": () => polynomialLabel(3),
    "taylor-1-term": () => `The straight line y = ${polynomialLabel(1)}`,
    "taylor-value-at-1": () => taylorSin(1, 2).toFixed(3),
    "taylor-4th-term": () => lastTerm(4),
    "taylor-most-accurate": () => {
      // Error near 0 must be smaller than near 2π or π for every slider setting.
      for (let n = 1; n <= 10; n++) {
        const err = (x) => Math.abs(taylorSin(x, n) - Math.sin(x));
        assert.ok(err(0.5) < err(2 * Math.PI - 0.5) && err(0.5) < err(Math.PI), `n=${n}`);
      }
      return "Near x = 0";
    },
  },
  conceptual: [],
};
