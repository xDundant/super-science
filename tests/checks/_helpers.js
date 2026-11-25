// Small helpers shared by the per-concept answer checks.
const assert = require("assert");
module.exports = {
  assert,
  // Up to 2 decimals, no trailing zeros: 5 -> "5", 5.83 -> "5.83", 0.5 -> "0.5"
  num: (x) => String(Number(x.toFixed(2)) + 0),
  // Whole number value of `from..to` where fn is biggest
  argMax: (from, to, fn) => { let best = from; for (let a = from; a <= to; a++) if (fn(a) > fn(best)) best = a; return best; },
  // Same minus sign the app uses
  minus: (text) => String(text).replace(/^-/, "−"),
};
