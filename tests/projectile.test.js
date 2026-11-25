// Run with:  node tests/projectile.test.js
const assert = require("assert");
const { G, timeOfFlight, range, maxHeight, position } = require("../concepts/projectile.js");
const close = (a, b, tol = 1e-6) => assert.ok(Math.abs(a - b) < tol, `${a} is not close to ${b}`);

assert.strictEqual(G, 9.8);

// 45° at 20 m/s: R = v²/g = 40.8 m, H = v²/4g = 10.2 m, T = 2.89 s
close(range(20, 45), 400 / 9.8);
close(maxHeight(20, 45), 400 / (4 * 9.8));
close(timeOfFlight(20, 45), (2 * 20 * Math.SQRT1_2) / 9.8);
console.log(`45° @ 20 m/s -> range ${range(20, 45).toFixed(1)} m, max height ${maxHeight(20, 45).toFixed(1)} m, time ${timeOfFlight(20, 45).toFixed(2)} s`);
close(range(20, 45), 40.8, 0.05);
close(maxHeight(20, 45), 10.2, 0.05);
close(timeOfFlight(20, 45), 2.89, 0.01);

// Straight up at 20 m/s: no range, H = v²/2g = 20.4 m, T = 2v/g = 4.08 s
close(range(20, 90), 0);
close(maxHeight(20, 90), 400 / 19.6);
close(timeOfFlight(20, 90), 40 / 9.8);

// Flat along the ground: nothing happens
close(range(20, 0), 0); close(maxHeight(20, 0), 0); close(timeOfFlight(20, 0), 0);

// Complementary angles land in the same place (30° and 60°)
close(range(20, 30), range(20, 60));
close(range(20, 30), 35.35, 0.01);

// 45° gives the longest range of every whole-number angle
let best = 0;
for (let a = 0; a <= 90; a++) if (range(20, a) > range(20, best)) best = a;
assert.strictEqual(best, 45);

// The ball lands back on the ground at x = range when t = time of flight
for (const [v, a] of [[20, 45], [35, 30], [10, 75], [50, 60]]) {
  const p = position(v, a, timeOfFlight(v, a));
  close(p.y, 0); close(p.x, range(v, a));
  // ...and its highest point (halfway through the flight) equals the max height
  close(position(v, a, timeOfFlight(v, a) / 2).y, maxHeight(v, a));
}

// Double the speed -> 4x the range
close(range(40, 37), 4 * range(20, 37));

console.log("All projectile tests passed ✅");
