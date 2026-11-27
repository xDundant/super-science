// Run with:  node tests/structure.test.js
// Makes sure every concept is fully wired up: its files exist, it's loaded in
// index.html, cached for offline use in sw.js, and has a valid subject tag.
const assert = require("assert");
const fs = require("fs");
const path = require("path");
const root = path.join(__dirname, "..");
const read = (f) => fs.readFileSync(path.join(root, f), "utf8");
const list = (dir) => fs.readdirSync(path.join(root, dir)).filter((f) => f.endsWith(".js")).map((f) => f.slice(0, -3)).sort();

const html = read("index.html");
const sw = read("sw.js");
const scripts = [...html.matchAll(/<script src="([^"]+)"/g)].map((m) => m[1]);
const cached = [...sw.matchAll(/^\s*"([^"]+)",?$/gm)].map((m) => m[1]);
const SUBJECTS = ["Maths", "Physics", "Chemistry", "Biology"];

const concepts = list("concepts");
for (const id of concepts) {
  const src = read(`concepts/${id}.js`);
  assert.ok(fs.existsSync(path.join(root, `questions/${id}.js`)), `${id}: missing questions/${id}.js`);
  assert.ok(fs.existsSync(path.join(root, `tests/checks/${id}.js`)), `${id}: missing tests/checks/${id}.js`);
  for (const f of [`concepts/${id}.js`, `questions/${id}.js`]) {
    assert.ok(scripts.includes(f), `${f} is not loaded in index.html`);
    assert.ok(cached.includes(f), `${f} is not in the FILES list in sw.js`);
  }
  assert.ok(new RegExp(`id: "${id}"`).test(src), `${id}: register() id should be "${id}" (same as the file name)`);
  const tag = (src.match(/tag: "([^"]+)"/) || [])[1];
  assert.ok(SUBJECTS.includes(tag), `${id}: tag must be one of ${SUBJECTS.join(", ")} (got ${tag})`);
  assert.ok(/title: "[^"]+\?"/.test(src) || id === "taylor" || id === "vectors" || id === "projectile", `${id}: title should be a curious question ending in "?"`);
}
assert.deepStrictEqual(list("questions"), concepts, "every concept needs exactly one questions file (and vice versa)");
// Every file sw.js caches must exist
for (const f of cached) if (f !== "./") assert.ok(fs.existsSync(path.join(root, f)), `sw.js caches ${f} but it doesn't exist`);
// Concept scripts come before app.js
const appAt = scripts.indexOf("app.js");
scripts.forEach((s, i) => { if (/^(concepts|questions)\//.test(s)) assert.ok(i < appAt, `${s} must be loaded before app.js`); });

// Every minigame file is loaded (before app.js) and cached for offline use
for (const g of list("games")) {
  const f = `games/${g}.js`;
  assert.ok(scripts.includes(f), `${f} is not loaded in index.html`);
  assert.ok(cached.includes(f), `${f} is not in the FILES list in sw.js`);
  assert.ok(scripts.indexOf(f) < appAt, `${f} must be loaded before app.js`);
}
for (const f of ["nav.js"]) { assert.ok(scripts.includes(f) && cached.includes(f), `${f} must be loaded and cached`); }
console.log(`Checked ${concepts.length} concepts are fully wired up`);
console.log("All structure tests passed ✅");
