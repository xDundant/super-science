// Run every test:  node tests/run-all.js
// (Runs tests/*.test.js automatically, so new test files are picked up.)
const fs = require("fs");
fs.readdirSync(__dirname).filter((f) => f.endsWith(".test.js")).sort().forEach((f) => require("./" + f));
