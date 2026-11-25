// Run with:  node tests/physics-batch2.test.js
// Centripetal force, terminal velocity and the pendulum.
const assert = require("assert");
const C = require("../concepts/centripetal.js");
const T = require("../concepts/terminal-velocity.js");
const P = require("../concepts/pendulum.js");
const close = (a, b, tol, msg) => assert.ok(Math.abs(a - b) <= tol, `${msg || ""} ${a} is not within ${tol} of ${b}`);

/* Centripetal: F = mv²/r */
close(C.force(2, 4, 2), 16, 1e-12);
close(C.force(1, 10, 5), 20, 1e-12);
close(C.force(5, 20, 1), 2000, 1e-9, "biggest on the sliders");
close(C.force(1, 1, 10), 0.1, 1e-12, "smallest on the sliders");
close(C.acceleration(6, 6), 6, 1e-12);
close(C.lapTime(2 * Math.PI, 1), 1, 1e-12);
console.log("Centripetal: F(2 kg, 4 m/s, 2 m) =", C.force(2, 4, 2), "N; F(5 kg, 20 m/s, 1 m) =", C.force(5, 20, 1), "N");

/* Terminal velocity: the simulation approaches √(mg/k) */
for (const [m, k] of [[80, 0.25], [50, 0.6], [120, 0.1], [70, 0.3]]) {
  const vt = T.terminalSpeed(m, k);
  close(vt, Math.sqrt((m * 9.8) / k), 1e-12);
  const run = T.simulate({ m, k, tEnd: 60 });
  const last = run[run.length - 1].v;
  close(last, vt, vt * 0.001, `m=${m} k=${k} after 60 s`);
  for (let i = 1; i < run.length; i++) assert.ok(run[i].v >= run[i - 1].v - 1e-9 && run[i].v < vt, "rises towards vt, never past it");
}
// Analytic check: v(t) = vt·tanh(g t / vt)
{
  const m = 80, k = 0.25, vt = T.terminalSpeed(m, k);
  for (const p of T.simulate({ m, k, tEnd: 20 })) close(p.v, vt * Math.tanh((9.8 * p.t) / vt), 1e-6, `t=${p.t}`);
}
// Parachute: speed falls to the new, lower terminal speed
{
  const m = 80, k = 0.25;
  const run = T.simulate({ m, k, tEnd: 40, parachuteAt: 15 });
  close(run[run.length - 1].v, T.terminalSpeed(m, k * T.PARACHUTE), 0.01, "with parachute");
  assert.ok(run.find((p) => p.t > 14.9 && p.t < 15.1).v > 50, "fast before the parachute");
}
console.log("Terminal velocity: 80 kg, k = 0.25 →", T.terminalSpeed(80, 0.25).toFixed(2), "m/s; simulation after 60 s:", T.simulate({ m: 80, k: 0.25, tEnd: 60 }).pop().v.toFixed(2));

/* Pendulum */
const T0 = P.smallAnglePeriod(1);
close(T0, 2.007, 0.0005, "small-angle formula at L = 1 m");
close(P.realPeriod(1, 5), 2.007, 0.002, "real period at L = 1 m, 5°");
// Compare with the exact formula T = T0 / AGM(1, cos(θ0/2))
function agm(a, b) { for (let i = 0; i < 30; i++) [a, b] = [(a + b) / 2, Math.sqrt(a * b)]; return a; }
for (const L of [0.2, 1, 3]) for (const d of [5, 20, 45, 80]) {
  const exact = P.smallAnglePeriod(L) / agm(1, Math.cos((d * Math.PI) / 360));
  close(P.realPeriod(L, d), exact, exact * 1e-6, `L=${L} θ=${d}°`);
}
// The gap grows with angle
let prev = 0;
for (let d = 5; d <= 80; d += 5) { const gap = P.realPeriod(1, d) / T0 - 1; assert.ok(gap > prev); prev = gap; }
// Energy is conserved by the step function (no fake damping)
{
  const L = 1, E = (th, w) => 0.5 * L * L * w * w + 9.8 * L * (1 - Math.cos(th));
  let th = 1.2, w = 0; const e0 = E(th, w);
  for (let i = 0; i < 20000; i++) [th, w] = P.step(th, w, L, 0.001);
  close(E(th, w), e0, e0 * 1e-6, "energy after 20 s");
}
console.log(`Pendulum L = 1 m: formula ${T0.toFixed(4)} s; real at 5° ${P.realPeriod(1, 5).toFixed(4)} s, 45° ${P.realPeriod(1, 45).toFixed(4)} s, 80° ${P.realPeriod(1, 80).toFixed(4)} s`);

console.log("All Batch 2 physics tests passed ✅");
