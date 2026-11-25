// Answer checks for questions/ph.js
const { assert, num } = require("./_helpers.js");
const { hConc, ohConc, pOH, classify } = require("../../concepts/ph.js");
const SUP = { "-": "⁻", 0: "⁰", 1: "¹", 2: "²", 3: "³", 4: "⁴", 5: "⁵", 6: "⁶", 7: "⁷", 8: "⁸", 9: "⁹" };
const pow10 = (x) => { const e = Math.round(Math.log10(x)); assert.ok(Math.abs(x / Math.pow(10, e) - 1) < 1e-9); return `1 × 10${String(e).split("").map((c) => SUP[c]).join("")}`; };

module.exports = {
  checks: {
    "ph-h-at-3": () => pow10(hConc(3)) + " mol/L",
    "ph-2-vs-5": () => Math.round(hConc(2) / hConc(5)) + "×",
    "ph-poh": () => num(pOH(9)),
    "ph-bleach": () => ({ Basic: "Basic (alkaline)", Acidic: "Acidic", Neutral: "Neutral" })[classify(12.5)],
    "ph-neutral": () => {
      assert.ok(Math.abs(hConc(7) - 1e-7) < 1e-20 && Math.abs(ohConc(7) - 1e-7) < 1e-20);
      return hConc(7) === ohConc(7) ? "They're equal" : "?";
    },
  },
  conceptual: [],
};
