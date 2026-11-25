// Answer checks for questions/atom.js
const { element, massNumber, charge, shells, chargeText, describe } = require("../../concepts/atom.js");

module.exports = {
  checks: {
    "atom-11-protons": () => element(11).name,
    "atom-carbon-14": () => String(massNumber(6, 8)),
    "atom-oxide-charge": () => chargeText(charge(8, 10)),
    "atom-sodium-shells": () => shells(11).join(", "),
    "atom-isotopes": () => {
      const a = describe(6, 6, 6), b = describe(6, 8, 6);
      return a.name === b.name && a.mass !== b.mass && !b.isIon && !b.isCommonIsotope ? "Isotopes of the same element" : "?";
    },
  },
  conceptual: [],
};
