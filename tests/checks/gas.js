// Answer checks for questions/gas.js
const { assert } = require("./_helpers.js");
const { pressure, toKelvin } = require("../../concepts/gas.js");
const RATIO = { 0.5: "Halves", 1: "Stays the same", 2: "Doubles", 4: "Becomes 4 times bigger" };
const ratio = (a, b) => RATIO[Math.round((a / b) * 1e9) / 1e9];

module.exports = {
  checks: {
    "gas-double-t": () => ratio(pressure(500, 30), pressure(250, 30)),
    "gas-squeeze-and-heat": () => ratio(pressure(600, 15), pressure(300, 30)),
    "gas-value": () => pressure(300, 25).toFixed(1) + " kPa",
    "gas-celsius": () => {
      const r = pressure(toKelvin(327), 20) / pressure(toKelvin(27), 20);
      assert.ok(Math.abs(r - 2) < 0.002, `ratio ${r}`);
      assert.ok(Math.round(toKelvin(27)) === 300 && Math.round(toKelvin(327)) === 600, "explanation's kelvin values");
      return "Doubles";
    },
  },
  conceptual: ["gas-why-heat"],
};
