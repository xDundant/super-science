// Answer checks for questions/euler-e.js
const { assert } = require("./_helpers.js");
const { compound } = require("../../concepts/euler-e.js");
const dollars = (n) => "$" + compound(n).toFixed(2);

module.exports = {
  checks: {
    "euler-e-yearly": () => dollars(1),
    "euler-e-twice": () => dollars(2),
    "euler-e-monthly": () => dollars(12),
    "euler-e-daily": () => dollars(365),
    "euler-e-limit": () => {
      assert.ok(Math.abs(compound(1e7) - Math.E) < 1e-6, "(1+1/n)^n should approach e");
      for (const n of [1, 12, 365, 1e6]) assert.ok(compound(n) < Math.E, "and never pass it");
      return "e ≈ " + Math.E.toFixed(3);
    },
  },
  conceptual: [],
};
