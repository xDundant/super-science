// Answer checks for questions/terminal-velocity.js
const { assert, num } = require("./_helpers.js");
const { G, PARACHUTE, terminalSpeed, accel } = require("../../concepts/terminal-velocity.js");

module.exports = {
  checks: {
    "terminal-velocity-value": () => terminalSpeed(80, 0.2).toFixed(1) + " m/s",
    "terminal-velocity-balance": () => {
      const vt = terminalSpeed(80, 0.2);
      assert.ok(Math.abs(0.2 * vt * vt - 80 * G) < 1e-9);
      assert.ok(Math.abs(accel(vt, 80, 0.2)) < 1e-9);
      return "Equal to the weight";
    },
    "terminal-velocity-parachute": () => {
      const r = terminalSpeed(80, 0.25 * PARACHUTE) / terminalSpeed(80, 0.25);
      assert.ok(r > 0.3 && r < 0.34, `ratio ${r}`);
      return "About 1/3 as fast";
    },
    "terminal-velocity-heavier": () => (terminalSpeed(100, 0.25) > terminalSpeed(60, 0.25) ? "Higher" : "Lower"),
    "terminal-velocity-start": () => num(accel(0, 80, 0.25)) + " m/s²",
  },
  conceptual: [],
};
