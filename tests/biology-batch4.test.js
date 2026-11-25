// Run with:  node tests/biology-batch4.test.js
// Natural selection, Punnett squares and enzymes.
const assert = require("assert");
const NS = require("../concepts/natural-selection.js");
const PN = require("../concepts/punnett.js");
const EZ = require("../concepts/enzymes.js");
const close = (a, b, tol, msg) => assert.ok(Math.abs(a - b) <= tol, `${msg || ""} ${a} is not within ${tol} of ${b}`);

/* Natural selection: seeded runs are repeatable */
const opts = { seed: 42, generations: 40, background: "dark", pressure: 0.5, fractionDark: 0.1 };
const run1 = NS.simulate(opts), run2 = NS.simulate(opts);
assert.deepStrictEqual(run1, run2, "same seed, same result");
assert.notDeepStrictEqual(NS.simulate({ ...opts, seed: 43 }), run1, "different seed, different result");
const r = NS.rng(123), r2 = NS.rng(123);
for (let i = 0; i < 1000; i++) { const v = r(); assert.strictEqual(v, r2()); assert.ok(v >= 0 && v < 1); }
// Selection works both ways
const avg = (bg, start) => { let s = 0; for (let seed = 1; seed <= 30; seed++) { const h = NS.simulate({ seed, generations: 30, background: bg, pressure: 0.6, fractionDark: start }); s += h[h.length - 1]; } return s / 30; };
assert.ok(avg("dark", 0.1) > 85, "dark bark → dark bugs");
assert.ok(avg("light", 0.9) < 15, "light bark → light bugs");
// Population stays at 50 (unless wiped out), and eat chances are right
assert.strictEqual(NS.startPopulation(0.1).filter((c) => c === "D").length, 5);
assert.strictEqual(NS.eatChance("L", "dark", 0.5), 0.5);
assert.strictEqual(NS.eatChance("D", "dark", 0.5), 0.5 * NS.CAMO);
assert.strictEqual(NS.eatChance("D", "light", 0.8), 0.8);
{ const rr = NS.rng(5); let pop = NS.startPopulation(0.5); for (let g = 0; g < 20; g++) { pop = NS.nextGeneration(pop, { background: "light", pressure: 0.5 }, rr).next; assert.strictEqual(pop.length, NS.POP); } }
assert.deepStrictEqual(NS.nextGeneration(["L", "L"], { background: "dark", pressure: 1 }, () => 0.5).next, [], "all eaten → extinct");
console.log("Natural selection: seed 42 →", run1.filter((_, i) => i % 10 === 0).map((v) => v + "%").join(" → "), "(repeatable)");

/* Punnett */
let c = PN.cross("Bb", "Bb");
assert.deepStrictEqual(c.percent, { BB: 25, Bb: 50, bb: 25 });
assert.strictEqual(c.purple, 75);
assert.deepStrictEqual(c.cells, [["BB", "Bb"], ["Bb", "bb"]]);
c = PN.cross("BB", "bb"); assert.strictEqual(c.percent.Bb, 100);
c = PN.cross("Bb", "bb"); assert.deepStrictEqual(c.percent, { BB: 0, Bb: 50, bb: 50 });
c = PN.cross("bb", "bb"); assert.strictEqual(c.purple, 0);
for (const a of PN.GENOTYPES) for (const b of PN.GENOTYPES) {
  const x = PN.cross(a, b), y = PN.cross(b, a);
  close(x.percent.BB + x.percent.Bb + x.percent.bb, 100, 1e-12);
  assert.deepStrictEqual(x.percent, y.percent, "order of parents doesn't matter");
}
assert.strictEqual(PN.combine("b", "B"), "Bb");
console.log("Punnett: Bb × Bb →", JSON.stringify(PN.cross("Bb", "Bb").percent), "purple", PN.cross("Bb", "Bb").purple + "%");

/* Enzymes (simplified model) */
for (const id of ["amylase", "pepsin"]) {
  const e = EZ.ENZYMES[id];
  close(EZ.activity(e.T, e.pH, id), 100, 1e-9, `${id} optimum`);
  // climbs slowly to the optimum, then drops faster than it climbed
  for (let T = 0; T < e.T; T++) assert.ok(EZ.activity(T + 1, e.pH, id) > EZ.activity(T, e.pH, id));
  for (let T = e.T; T < 70; T++) assert.ok(EZ.activity(T + 1, e.pH, id) <= EZ.activity(T, e.pH, id));
  assert.ok(100 - EZ.activity(e.T + 8, e.pH, id) > 2 * (100 - EZ.activity(e.T - 8, e.pH, id)), "sharper drop above the optimum");
  assert.strictEqual(EZ.activity(EZ.denatureTemp(id), e.pH, id), 0);
  for (let T = 0; T <= 70; T++) for (let p = 0; p <= 14; p += 0.5) { const a = EZ.activity(T, p, id); assert.ok(a >= 0 && a <= 100); }
}
assert.strictEqual(EZ.ENZYMES.amylase.pH, 7);
assert.strictEqual(EZ.ENZYMES.pepsin.pH, 2);
assert.strictEqual(EZ.ENZYMES.amylase.T, 37);
assert.strictEqual(EZ.ENZYMES.pepsin.T, 37);
assert.strictEqual(EZ.runSample([20, 55, 37], 7, "amylase"), 0, "denaturing is permanent");
console.log("Enzymes: amylase at 27/37/45/50 °C →", [27, 37, 45, 50].map((T) => Math.round(EZ.activity(T, 7, "amylase")) + "%").join(", "));

console.log("All Batch 4 biology tests passed ✅");
