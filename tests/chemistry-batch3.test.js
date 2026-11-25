// Run with:  node tests/chemistry-batch3.test.js
// pH, gas laws and the atom builder.
const assert = require("assert");
const P = require("../concepts/ph.js");
const G = require("../concepts/gas.js");
const A = require("../concepts/atom.js");
const close = (a, b, tol, msg) => assert.ok(Math.abs(a - b) <= tol, `${msg || ""} ${a} is not within ${tol} of ${b}`);

/* pH */
close(P.hConc(3), 1e-3, 1e-18, "pH 3 → [H⁺] = 1e−3");
close(P.hConc(7), 1e-7, 1e-22);
close(P.ohConc(3), 1e-11, 1e-26, "pH 3 → [OH⁻] = 1e−11");
for (let pH = 0; pH <= 14; pH += 0.1) {
  close(pH + P.pOH(pH), 14, 1e-12, "pH + pOH = 14");
  close(-Math.log10(P.hConc(pH)) - Math.log10(P.ohConc(pH)), 14, 1e-9);
  close(P.hConc(pH) * P.ohConc(pH), 1e-14, 1e-20, "Kw");
}
close(P.hConc(2) / P.hConc(3), 10, 1e-9, "one step = 10×");
assert.strictEqual(P.classify(7), "Neutral");
assert.strictEqual(P.classify(6.9), "Acidic");
assert.strictEqual(P.classify(7.1), "Basic");
assert.strictEqual(P.classify(Number("7.0")), "Neutral");
// Indicator colour is defined everywhere and changes smoothly
for (let pH = 0; pH <= 14; pH += 0.1) assert.match(P.indicatorColour(pH), /^rgb\(\d+, \d+, \d+\)$/);
// Example values sit on the correct side of 7
const ex = Object.fromEntries(P.EXAMPLES.map((e) => [e.name, e.pH]));
assert.strictEqual(ex["Pure water"], 7);
assert.ok(ex["Lemon juice"] >= 2 && ex["Lemon juice"] < 3);
assert.ok(ex["Bleach"] >= 12 && ex["Bleach"] <= 13);
P.EXAMPLES.forEach((e) => assert.ok(e.pH >= 0 && e.pH <= 14));
console.log("pH: [H⁺] at pH 3 =", P.hConc(3), "| pH + pOH = 14 everywhere");

/* Gas: P = nRT/V */
close(G.pressure(300, 25), (8.314 * 300) / 25, 1e-9);
for (const [T, V] of [[100, 10], [300, 30], [450, 17], [600, 50]]) {
  close(G.pressure(2 * T, V) / G.pressure(T, V), 2, 1e-12, "doubling T doubles P");
  close(G.pressure(T, V / 2) / G.pressure(T, V), 2, 1e-12, "halving V doubles P");
}
close(G.speedFactor(300), 1, 1e-12);
close(G.speedFactor(1200), 2, 1e-12, "4× the temperature → 2× the speed");
close(G.toKelvin(0), 273.15, 1e-12);
console.log("Gas: 1 mol, 300 K, 25 L →", G.pressure(300, 25).toFixed(2), "kPa");

/* Atom builder: names for protons 1–20 */
const EXPECTED = [
  "H Hydrogen 1", "He Helium 4", "Li Lithium 7", "Be Beryllium 9", "B Boron 11", "C Carbon 12", "N Nitrogen 14",
  "O Oxygen 16", "F Fluorine 19", "Ne Neon 20", "Na Sodium 23", "Mg Magnesium 24", "Al Aluminium 27", "Si Silicon 28",
  "P Phosphorus 31", "S Sulfur 32", "Cl Chlorine 35", "Ar Argon 40", "K Potassium 39", "Ca Calcium 40",
];
for (let p = 1; p <= 20; p++) {
  const e = A.element(p);
  assert.strictEqual(`${e.symbol} ${e.name} ${p + e.commonNeutrons}`, EXPECTED[p - 1], `protons = ${p}`);
}
assert.strictEqual(A.ELEMENTS.length, 20);
assert.strictEqual(A.massNumber(6, 8), 14);
assert.strictEqual(A.charge(11, 10), 1);
assert.strictEqual(A.charge(17, 18), -1);
assert.strictEqual(A.chargeText(-2), "−2");
assert.strictEqual(A.chargeText(1), "+1");
assert.deepStrictEqual(A.shells(1), [1]);
assert.deepStrictEqual(A.shells(6), [2, 4]);
assert.deepStrictEqual(A.shells(18), [2, 8, 8]);
assert.deepStrictEqual(A.shells(20), [2, 8, 8, 2]);
assert.deepStrictEqual(A.shells(0), []);
let d = A.describe(6, 6, 6);
assert.ok(d.name === "Carbon" && d.mass === 12 && d.charge === 0 && !d.isIon && d.isCommonIsotope);
d = A.describe(6, 8, 6);
assert.ok(d.mass === 14 && !d.isCommonIsotope && d.commonMass === 12);
d = A.describe(11, 12, 10);
assert.ok(d.isIon && d.charge === 1 && d.isCommonIsotope);
console.log("Atoms: elements 1–20 named correctly; Na⁺ charge", A.describe(11, 12, 10).charge, "; C-14 mass", A.describe(6, 8, 6).mass);

console.log("All Batch 3 chemistry tests passed ✅");
