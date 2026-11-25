// Answer checks for questions/euler-identity.js
const { assert, num, minus } = require("./_helpers.js");
const { expi, mul, I } = require("../../concepts/euler-identity.js");
// Name a point that should be one of 1, i, −1, −i
function name(z) {
  const near = (a, b) => Math.abs(a - b) < 1e-9;
  if (near(z.re, 1) && near(z.im, 0)) return "1";
  if (near(z.re, -1) && near(z.im, 0)) return "−1";
  if (near(z.re, 0) && near(z.im, 1)) return "i";
  if (near(z.re, 0) && near(z.im, -1)) return "−i";
  throw new Error("not one of 1, i, −1, −i");
}

module.exports = {
  checks: {
    "euler-identity-pi": () => name(expi(Math.PI)),
    "euler-identity-quarter": () => name(expi(Math.PI / 2)),
    "euler-identity-i-squared": () => name(mul(I, I)),
    "euler-identity-cos60": () => minus(num(expi(Math.PI / 3).re)),
    "euler-identity-radius": () => {
      for (let t = 0; t < 7; t += 0.1) { const z = expi(t); assert.ok(Math.abs(Math.hypot(z.re, z.im) - 1) < 1e-12); }
      return "Always 1";
    },
  },
  conceptual: [],
};
