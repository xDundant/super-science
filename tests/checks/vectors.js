// Answer checks for questions/vectors.js
const { assert, num } = require("./_helpers.js");
const { fromPolar, add, magnitude, angleDeg } = require("../../concepts/vectors.js");

module.exports = {
  checks: {
    "vectors-3-4-magnitude": () => num(magnitude(add(fromPolar(3, 0), fromPolar(4, 90)))),
    "vectors-3-4-angle": () => Math.round(angleDeg(add(fromPolar(3, 0), fromPolar(4, 90)))) + "°",
    "vectors-cancel": () => num(magnitude(add(fromPolar(4, 0), fromPolar(4, 180)))),
    "vectors-max-length": () => {
      const sizeAt = (bAngle) => magnitude(add(fromPolar(5, 0), fromPolar(3, bAngle)));
      let biggest = 0;
      for (let a = 0; a < 360; a++) biggest = Math.max(biggest, sizeAt(a));
      assert.strictEqual(num(sizeAt(90)), "5.83", "explanation says right angles give 5.83");
      return num(biggest);
    },
  },
  conceptual: ["vectors-tip-to-tail"],
};
