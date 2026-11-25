/* Concept: Punnett square (pea plant flower colour) */
(function () {
  /* ---------- Genetics ---------- */
  // B = purple (dominant), b = white (recessive)
  const GENOTYPES = ["BB", "Bb", "bb"];
  const gametes = (g) => [g[0], g[1]];                                  // each parent passes on one allele
  const combine = (a, b) => (a === "B" || b !== "B" ? a + b : b + a);    // write the capital B first: "Bb"
  const phenotype = (g) => (g.includes("B") ? "Purple" : "White");

  // Cross two parents. Returns the 2×2 cells plus counts and percentages.
  function cross(p1, p2) {
    const rows = gametes(p1), cols = gametes(p2);
    const cells = rows.map((r) => cols.map((c) => combine(r, c)));
    const counts = { BB: 0, Bb: 0, bb: 0 };
    cells.flat().forEach((g) => counts[g]++);
    const percent = {};
    GENOTYPES.forEach((g) => { percent[g] = (counts[g] / 4) * 100; });
    return { rows, cols, cells, counts, percent, purple: percent.BB + percent.Bb, white: percent.bb };
  }

  if (typeof module !== "undefined" && module.exports) module.exports = { GENOTYPES, gametes, combine, phenotype, cross };
  if (typeof window === "undefined" || !window.SuperScience) return;

  /* ---------- Drawing ---------- */
  const SS = window.SuperScience;
  const PETAL = { Purple: "#A66BE0", White: "#F4F1EA" };

  function flower(parent, x, y, r, colour) {
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
      SS.svgEl("circle", { cx: x + Math.cos(a) * r * 0.62, cy: y + Math.sin(a) * r * 0.62, r: r * 0.48, fill: PETAL[colour], stroke: "rgba(0,0,0,0.35)", "stroke-width": 1 }, parent);
    }
    SS.svgEl("circle", { cx: x, cy: y, r: r * 0.3, fill: "#FFB300" }, parent);
  }

  SS.register({
    id: "punnett",
    title: "Can two purple flowers have a white baby?",
    description: "Cross pea plants in a Punnett square and predict their flower colours.",
    tag: "Biology",

    render(root) {
      const pick = document.createElement("div");
      pick.className = "controls-2";
      root.appendChild(pick);
      const opts = [["BB", "BB (purple)"], ["Bb", "Bb (purple)"], ["bb", "bb (white)"]];
      const p1 = SS.select(pick, { id: "pn-1", label: "Parent 1", options: opts, value: "Bb" });
      const p2 = SS.select(pick, { id: "pn-2", label: "Parent 2", options: opts, value: "Bb" });
      root.insertAdjacentHTML("beforeend", `
        <div class="graph-wrap graph-wrap--square punnett-wrap"><svg role="img" aria-label="Punnett square"></svg></div>
        <p class="big-eq" aria-live="polite"></p>`);
      const svg = root.querySelector("svg");
      const eq = root.querySelector(".big-eq");
      const set = SS.stats(root, [
        { key: "BB", label: "BB", cls: "stat-white" },
        { key: "Bb", label: "Bb", cls: "stat-white" },
        { key: "bb", label: "bb", cls: "stat-white" },
        { key: "purple", label: "Purple flowers" },
      ]);
      root.insertAdjacentHTML("beforeend", `
        <p class="caption">Each parent has two copies (alleles) of the flower-colour gene and passes on <b>one at random</b>: those are the letters along the edges. Each box is one equally likely baby. <b>B</b> (purple) is dominant, so a plant only has white flowers if it gets <b>b from both parents</b> (bb).</p>`);

      function draw() {
        const c = cross(p1.value, p2.value);
        const { W, font } = SS.fit(svg, 1, 1);
        const head = W * 0.2, cell = (W - head - 8) / 2, x0 = head, y0 = head;
        const txt = { "text-anchor": "middle", "font-family": "system-ui, sans-serif", "font-weight": 900 };
        // gametes along the edges
        c.cols.forEach((g, j) => SS.svgEl("text", Object.assign({ x: x0 + cell * (j + 0.5), y: head * 0.68, fill: "#4DD9FF", "font-size": head * 0.5 }, txt), svg).textContent = g);
        c.rows.forEach((g, i) => SS.svgEl("text", Object.assign({ x: head * 0.5, y: y0 + cell * (i + 0.5) + head * 0.18, fill: "#FFB300", "font-size": head * 0.5 }, txt), svg).textContent = g);
        SS.svgEl("text", Object.assign({ x: head * 0.5, y: head * 0.68, fill: "rgba(255,255,255,0.5)", "font-size": head * 0.4 }, txt), svg).textContent = "×";
        // the four boxes
        c.cells.forEach((row, i) => row.forEach((g, j) => {
          const x = x0 + j * cell, y = y0 + i * cell, ph = phenotype(g);
          SS.svgEl("rect", { x: x + 3, y: y + 3, width: cell - 6, height: cell - 6, rx: 12, fill: "#000", stroke: ph === "Purple" ? "rgba(166,107,224,0.7)" : "rgba(255,255,255,0.5)", "stroke-width": 2 }, svg);
          flower(svg, x + cell / 2, y + cell * 0.4, cell * 0.2, ph);
          SS.svgEl("text", Object.assign({ x: x + cell / 2, y: y + cell * 0.85, fill: "#FFFFFF", "font-size": Math.max(font + 4, cell * 0.17) }, txt), svg).textContent = g;
        }));

        const pct = (v) => (Number.isInteger(v) ? v : v.toFixed(1)) + "%";
        set("BB", pct(c.percent.BB));
        set("Bb", pct(c.percent.Bb));
        set("bb", pct(c.percent.bb));
        set("purple", pct(c.purple));
        const p = c.counts.BB + c.counts.Bb, w = c.counts.bb;
        const gcd = (x, y) => (y ? gcd(y, x % y) : x), d = gcd(p, w); // simplest ratio, e.g. 2 : 2 -> 1 : 1
        eq.textContent = w === 0 ? "All purple" : p === 0 ? "All white" : `Purple : white = ${p / d} : ${w / d}`;
      }

      p1.addEventListener("change", draw);
      p2.addEventListener("change", draw);
      draw();
      return SS.watchWidth(svg.parentElement, draw);
    },
  });
})();
