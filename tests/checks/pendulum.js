// Answer checks for questions/pendulum.js
const { assert } = require("./_helpers.js");
const { smallAnglePeriod, realPeriod } = require("../../concepts/pendulum.js");
const RATIO = { 0.5: "Halves", 1: "Stays the same", 2: "Doubles", 4: "Becomes 4 times longer" };

module.exports = {
  checks: {
    "pendulum-1m": () => smallAnglePeriod(1).toFixed(2) + " s",
    "pendulum-4x-length": () => RATIO[Math.round((smallAnglePeriod(4) / smallAnglePeriod(1)) * 1e9) / 1e9],
    "pendulum-80-degrees": (q) => {
      const ratio = realPeriod(1, 80) / smallAnglePeriod(1);
      assert.ok(ratio > 1.12 && ratio < 1.15, `explanation says about 13% longer (got ${ratio})`);
      return "Longer";
    },
    "pendulum-approximation": () => {
      const rel = (deg) => { const t = (deg * Math.PI) / 180; return (t - Math.sin(t)) / t; };
      assert.ok(rel(5) < 0.002 && rel(80) > 0.25, "sin θ ≈ θ: good at 5°, poor at 80°");
      return "sin θ ≈ θ";
    },
  },
  conceptual: ["pendulum-mass"],
};
