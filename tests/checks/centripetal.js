// Answer checks for questions/centripetal.js
const { assert, num } = require("./_helpers.js");
const { force, releaseVelocity } = require("../../concepts/centripetal.js");
const RATIO = { 0.5: "Halves", 1: "Stays the same", 2: "Doubles", 4: "Becomes 4 times bigger" };

module.exports = {
  checks: {
    "centripetal-force-16": () => num(force(2, 4, 2)) + " N",
    "centripetal-double-speed": () => RATIO[force(3, 10, 5) / force(3, 5, 5)],
    "centripetal-double-radius": () => RATIO[force(3, 10, 8) / force(3, 10, 4)],
    "centripetal-release": () => {
      // Velocity at release is at right angles to the string (along the tangent).
      for (let a = 0; a < 7; a += 0.3) {
        const v = releaseVelocity(a, 7);
        assert.ok(Math.abs(v.x * Math.cos(a) + v.y * Math.sin(a)) < 1e-12);
        assert.ok(Math.abs(Math.hypot(v.x, v.y) - 7) < 1e-12);
      }
      return "Straight on, along the tangent";
    },
    "centripetal-force-20": () => num(force(1, 10, 5)) + " N",
  },
  conceptual: [],
};
