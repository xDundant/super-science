/* Concept: Euler's number e, from compound interest */
(function () {
  /* ---------- Maths ---------- */
  // $1 at 100% interest per year, compounded n times a year: (1 + 1/n)^n
  const compound = (n) => Math.pow(1 + 1 / n, n);
  const STEPS = [
    [1, "Yearly"], [2, "Twice a year"], [4, "Quarterly"], [12, "Monthly"],
    [52, "Weekly"], [365, "Daily"], [8760, "Hourly"], [1000000, "A million times"],
  ];

  if (typeof module !== "undefined" && module.exports) module.exports = { compound, STEPS };
  if (typeof window === "undefined" || !window.SuperScience) return;

  /* ---------- Drawing ---------- */
  const SS = window.SuperScience;
  const SUP = { 0: "⁰", 1: "¹", 2: "²", 3: "³", 4: "⁴", 5: "⁵", 6: "⁶", 7: "⁷", 8: "⁸", 9: "⁹" };
  const sup = (n) => String(n).split("").map((d) => SUP[d]).join("");
  const big = (n) => n.toLocaleString("en-US");

  SS.register({
    id: "euler-e",
    title: "Can interest make $1 grow forever?",
    description: "Compound $1 more and more often and watch it hit a mysterious ceiling: e.",
    tag: "Maths",

    render(root) {
      root.insertAdjacentHTML("beforeend", `
        <div class="legend" aria-hidden="true">
          <span class="legend-item"><i class="swatch swatch-amber"></i>(1 + 1/n)ⁿ</span>
          <span class="legend-item"><i class="swatch swatch-dashed"></i>e = 2.71828…</span>
        </div>
        <div class="graph-wrap"><svg role="img" aria-label="Graph of (1 + 1/n) to the power n creeping up towards e"></svg></div>
        <p class="big-eq" aria-live="polite"></p>`);
      const svg = root.querySelector("svg");
      const eq = root.querySelector(".big-eq");
      const set = SS.stats(root, [
        { key: "n", label: "Times per year" },
        { key: "total", label: "$1 becomes" },
        { key: "gap", label: "Short of e by", cls: "stat-red" },
      ]);
      const slider = SS.slider(root, { id: "e-n", label: "Compounding", min: 0, max: 7, step: 1, value: 3, format: (i) => STEPS[i][1] });
      root.insertAdjacentHTML("beforeend", `
        <p class="caption">$1 at 100% interest for a year. Splitting the interest into more, smaller payments helps, but <b>less and less</b>: the total creeps up to <b>e ≈ 2.71828</b> and never passes it.</p>`);

      function draw() {
        const i = Number(slider.value);
        const n = STEPS[i][0];
        const total = compound(n);
        const { W, H, font } = SS.fit(svg, 0.75, 0.5);
        const LABELS = ["1", "10", "100", "1k", "10k", "100k", "1M"];
        const a = SS.axes(svg, {
          W, H, font, id: "euler-e", x: [0, 6], y: [1.9, 2.8],
          xTicks: [0, 1, 2, 3, 4, 5, 6], yTicks: [2, 2.2, 2.4, 2.6, 2.8],
          xFmt: (v) => LABELS[v], yFmt: (v) => "$" + v.toFixed(1),
          xLabel: "times per year (n)", pad: { left: 44 },
        });
        const g = SS.svgEl("g", { "clip-path": a.clip }, svg);

        // e line
        SS.svgEl("line", { x1: a.sx(0), y1: a.sy(Math.E), x2: a.sx(6), y2: a.sy(Math.E), stroke: "rgba(255,255,255,0.6)", "stroke-width": 2, "stroke-dasharray": "7 6" }, g);
        SS.svgEl("text", { x: a.sx(0.1), y: a.sy(Math.E) - 7, fill: "#FFFFFF", "font-size": font, "font-family": "system-ui, sans-serif" }, svg).textContent = "e = 2.71828";
        // smooth curve (n on a log scale)
        const pts = [];
        for (let k = 0; k <= 240; k++) { const lg = (k / 240) * 6; pts.push([a.sx(lg), a.sy(compound(Math.pow(10, lg)))]); }
        SS.svgEl("path", { d: SS.pathD(pts), fill: "none", stroke: "#FFB300", "stroke-width": 3, "stroke-linecap": "round" }, g);
        // the 8 slider choices
        STEPS.forEach(([m], k) => {
          SS.svgEl("circle", { cx: a.sx(Math.log10(m)), cy: a.sy(compound(m)), r: k === i ? 8 : 4, fill: k === i ? "#FFB300" : "#4DD9FF", stroke: k === i ? "#000" : "none", "stroke-width": 2 }, svg);
        });
        // red gap from the current value up to e
        const x = a.sx(Math.log10(n));
        SS.svgEl("line", { x1: x, y1: a.sy(total) - 9, x2: x, y2: a.sy(Math.E), stroke: "#FF4D5E", "stroke-width": 2.5 }, svg);

        set("n", big(n));
        set("total", "$" + total.toFixed(6));
        set("gap", (Math.E - total).toFixed(6));
        eq.textContent = `(1 + 1/${big(n)})${n <= 8760 ? sup(n) : "ⁿ"} = ${total.toFixed(6)}`;
      }

      slider.addEventListener("input", draw);
      draw();
      return SS.watchWidth(svg.parentElement, draw);
    },
  });
})();
