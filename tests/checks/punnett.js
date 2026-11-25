// Answer checks for questions/punnett.js
const { assert } = require("./_helpers.js");
const { cross, phenotype, GENOTYPES } = require("../../concepts/punnett.js");
const pct = (v) => v + "%";

module.exports = {
  checks: {
    "punnett-bb-x-bb-white": () => pct(cross("Bb", "Bb").white),
    "punnett-BB-x-bb": () => pct(cross("BB", "bb").percent.Bb),
    "punnett-Bb-x-bb-purple": () => pct(cross("Bb", "bb").purple),
    "punnett-white-genotype": () => {
      const white = GENOTYPES.filter((g) => phenotype(g) === "White");
      assert.strictEqual(white.length, 1);
      return white[0];
    },
    "punnett-purple-parents": () => {
      assert.ok(cross("Bb", "Bb").white > 0 && cross("BB", "BB").white === 0 && cross("BB", "Bb").white === 0);
      return "Yes, if both are Bb";
    },
  },
  conceptual: [],
};
