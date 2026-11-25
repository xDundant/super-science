// Answer checks for questions/natural-selection.js
const { assert, num } = require("./_helpers.js");
const NS = require("../../concepts/natural-selection.js");

module.exports = {
  checks: {
    "natural-selection-dark-bark": () => {
      // 20 different seeded runs: dark should win in every one
      for (let seed = 1; seed <= 20; seed++) {
        const h = NS.simulate({ seed, generations: 30, background: "dark", pressure: 0.6, fractionDark: 0.1 });
        assert.ok(h[h.length - 1] > 80, `seed ${seed}: ${h[h.length - 1]}% dark`);
      }
      return "Dark";
    },
    "natural-selection-no-pressure": () => {
      assert.strictEqual(NS.eatChance("D", "dark", 0), 0);
      assert.strictEqual(NS.eatChance("L", "dark", 0), 0);
      return "It stays roughly the same, drifting only by chance";
    },
    "natural-selection-eaten": () => num(20 * NS.eatChance("L", "dark", 0.5)),
    "natural-selection-mutations": () => num(NS.POP * NS.MUTATION),
  },
  conceptual: ["natural-selection-individuals"],
};
