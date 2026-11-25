// Run with:  node tests/animation.test.js
// Checks the shared animation helpers in core.js with fake screen refreshes,
// so we can test what happens with slow frames, fast screens and hidden tabs.
const assert = require("assert");

// --- a tiny fake browser: we decide when each frame happens ---
let queue = [], listeners = {};
global.window = {};
global.location = { search: "" };
global.document = {
  addEventListener: (type, fn) => { (listeners[type] = listeners[type] || []).push(fn); },
  removeEventListener: (type, fn) => { listeners[type] = (listeners[type] || []).filter((f) => f !== fn); },
};
global.requestAnimationFrame = (fn) => { queue.push(fn); return queue.length; };
global.cancelAnimationFrame = () => {};
const frame = (time) => { const q = queue; queue = []; q.forEach((fn) => fn(time)); };
require("../core.js");
const SS = window.SuperScience;

// 1. Time-based: the same 1 second of animation on 60 Hz and 120 Hz screens
function run(hz, seconds) {
  queue = []; let total = 0;
  const stop = SS.loop((dt) => { total += dt; });
  for (let i = 0; i <= hz * seconds; i++) frame((i * 1000) / hz);
  stop();
  return total;
}
assert.ok(Math.abs(run(60, 1) - 1) < 1e-9 && Math.abs(run(120, 1) - 1) < 1e-9, "1 s of animation on both 60 Hz and 120 Hz");

// 2. A long gap (e.g. coming back to the tab) moves things on by at most 0.05 s
queue = []; let seen = [];
let stop = SS.loop((dt) => { seen.push(dt); });
frame(0); frame(16); frame(3016); stop();
assert.strictEqual(seen[2], 0.05, "a 3 s gap is capped at 0.05 s");

// 3. When the tab becomes visible again, the clock restarts: the next frame moves 0 s
queue = []; seen = [];
stop = SS.loop((dt) => { seen.push(dt); });
frame(0); frame(16);
(listeners.visibilitychange || []).forEach((fn) => fn());
frame(9000); frame(9016); stop();
assert.strictEqual(seen[2], 0, "no jump after the tab comes back");
assert.ok(Math.abs(seen[3] - 0.016) < 1e-9, "then normal again");
assert.strictEqual((listeners.visibilitychange || []).length, 0, "stopped loops stop listening");

// 4. Fixed-step physics: same number of 1/240 s steps whatever the frame rate
function steps(hz) {
  queue = []; let n = 0, alphas = [];
  const stop = SS.physicsLoop({ step: () => { n++; }, render: (a) => { alphas.push(a); } });
  for (let i = 0; i <= hz * 2; i++) frame((i * 1000) / hz);
  stop();
  return { n, alphaOK: alphas.every((a) => a >= 0 && a < 1) };
}
const s60 = steps(60), s144 = steps(144);
assert.ok(Math.abs(s60.n - 480) <= 1 && Math.abs(s144.n - 480) <= 1, `2 s = 480 steps at 60 Hz (${s60.n}) and 144 Hz (${s144.n})`);
assert.ok(s60.alphaOK && s144.alphaOK, "interpolation amount stays between 0 and 1");

// 5. perFrame: many slider events in one frame -> one update with the latest value
queue = []; const got = [];
const onSlide = SS.perFrame((v) => got.push(v));
onSlide(1); onSlide(2); onSlide(3); frame(0);
onSlide(4); frame(16);
assert.deepStrictEqual(got, [3, 4]);

// 6. smooth(): eases towards the target without overshooting, and gets there
let x = 0;
for (let i = 0; i < 60; i++) { const nx = SS.smooth(x, 1, 1 / 60, 0.07); assert.ok(nx > x && nx <= 1); x = nx; }
assert.ok(x > 0.999, "reaches the target within a second");

console.log("Animation helpers: 60/120 Hz give the same 1 s; 3 s gap capped at 0.05 s; tab return = 0 s; 480 physics steps per 2 s at 60 and 144 Hz");
console.log("All animation tests passed ✅");
