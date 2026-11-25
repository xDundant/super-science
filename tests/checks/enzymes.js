// Answer checks for questions/enzymes.js
const { assert } = require("./_helpers.js");
const { ENZYMES, activity, runSample } = require("../../concepts/enzymes.js");
const pct = (v) => Math.round(v) + "%";

module.exports = {
  checks: {
    "enzymes-optimum": () => pct(activity(37, 7, "amylase")),
    "enzymes-cooler": () => pct(activity(27, 7, "amylase")),
    "enzymes-pepsin-ph": () => String(ENZYMES.pepsin.pH),
    "enzymes-denatured": () => {
      assert.strictEqual(runSample([60, 37], 7, "amylase"), 0);
      assert.ok(runSample([30, 37], 7, "amylase") > 99, "a sample that never overheated is fine");
      return "Still about 0%: it's denatured";
    },
    "enzymes-pepsin-neutral": () => pct(activity(37, 7, "pepsin")),
  },
  conceptual: [],
};
