/* Concept: Integration as area under a speed-time graph */
(function () {
  /* ---------- Maths ---------- */
  const speed = (t) => t * t;   // v(t) = t² (m/s)
  const T_END = 3;              // from t = 0 to 3 s
  const EXACT = 9;              // ∫₀³ t² dt = 3³/3 = 9 (metres)

  // Left-rectangle sum with n strips: each strip's height is v at its LEFT edge.
  function leftSum(n, f = speed, a = 0, b = T_END) {
    const dt = (b - a) / n;
    let total = 0;
    for (let k = 0; k < n; k++) total += f(a + k * dt) * dt;
    return total;
  }

  if (typeof module !== "undefined" && module.exports) module.exports = { speed, leftSum, EXACT, T_END };
  if (typeof window === "undefined" || !window.SuperScience) return;

  /* ---------- Drawing ---------- */
  const SS = window.SuperScience;

  SS.register({
    id: "integration",
    title: "How far does a speeding-up car travel?",
    description: "Chop the area under a speed graph into strips and watch the error vanish.",
    tag: "Maths",

    render(root) {
      root.insertAdjacentHTML("beforeend", `
        <div class="legend" aria-hidden="true">
          <span class="legend-item"><i class="swatch swatch-amber"></i>speed v = t²</span>
          <span class="legend-item"><i class="swatch swatch-cyan"></i>strips</span>
          <span class="legend-item"><i class="swatch swatch-red"></i>missed area</span>
        </div>
        <div class="graph-wrap"><svg role="img" aria-label="Speed-time graph of v equals t squared with rectangles under it"></svg></div>`);
      const svg = root.querySelector("svg");
      const set = SS.stats(root, [
        { key: "sum", label: "Strips add up to" },
        { key: "exact", label: "Exact area", cls: "stat-white" },
        { key: "err", label: "Error", cls: "stat-red" },
      ]);
      const slider = SS.slider(root, { id: "int-n", label: "Strips", min: 1, max: 50, step: 1, value: 4 });
      root.insertAdjacentHTML("beforeend", `
        <p class="caption">Each strip is <b>speed × time = distance</b>. Thin strips fit the curve better, and with infinitely many the sum becomes the <b>integral</b>: ∫₀³ t² dt = 9 m, the exact distance travelled.</p>`);

      function draw() {
        const n = Number(slider.value);
        const { W, H, font } = SS.fit(svg, 0.8, 0.5);
        const a = SS.axes(svg, {
          W, H, font, id: "integration", x: [0, 3.15], y: [0, 9.6], xTicks: [0, 1, 2, 3], yTicks: [0, 3, 6, 9],
          xFmt: (v) => `${v} s`, yLabel: "speed v (m/s)",
        });
        const g = SS.svgEl("g", { "clip-path": a.clip }, svg);
        // area under the curve (faint)
        const curve = [];
        for (let k = 0; k <= 120; k++) { const t = (k / 120) * T_END; curve.push([a.sx(t), a.sy(speed(t))]); }
        SS.svgEl("path", { d: SS.pathD(curve) + `L${a.sx(T_END)},${a.sy(0)}L${a.sx(0)},${a.sy(0)}Z`, fill: "rgba(255,77,94,0.18)" }, g);
        // strips
        const dt = T_END / n;
        for (let k = 0; k < n; k++) {
          const h = speed(k * dt);
          SS.svgEl("rect", {
            x: a.sx(k * dt), y: a.sy(h), width: a.sx(dt) - a.sx(0), height: a.sy(0) - a.sy(h),
            fill: "rgba(77,217,255,0.32)", stroke: "#4DD9FF", "stroke-width": n > 30 ? 0.6 : 1.2,
          }, g);
        }
        SS.svgEl("path", { d: SS.pathD(curve), fill: "none", stroke: "#FFB300", "stroke-width": 3 }, g);

        const sum = leftSum(n);
        set("sum", sum.toFixed(3) + " m");
        set("exact", EXACT + " m");
        set("err", (EXACT - sum).toFixed(3) + " m");
      }

      slider.addEventListener("input", draw);
      draw();
      return SS.watchWidth(svg.parentElement, draw);
    },
  });
})();
