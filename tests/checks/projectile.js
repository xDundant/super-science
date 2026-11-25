// Answer checks for questions/projectile.js
const { assert, num, argMax } = require("./_helpers.js");
const { range, timeOfFlight } = require("../../concepts/projectile.js");

module.exports = {
  checks: {
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
  },
  conceptual: [],
};
