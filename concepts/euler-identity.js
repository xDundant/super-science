/* Concept: Euler's identity, e^(iθ) on the unit circle */
(function () {
  /* ---------- Maths ---------- */
  // e^(iθ) = cos θ + i sin θ
  const expi = (theta) => ({ re: Math.cos(theta), im: Math.sin(theta) });
  // Multiply two complex numbers a and b
  const mul = (a, b) => ({ re: a.re * b.re - a.im * b.im, im: a.re * b.im + a.im * b.re });
  const I = { re: 0, im: 1 };

  if (typeof module !== "undefined" && module.exports) module.exports = { expi, mul, I };
  if (typeof window === "undefined" || !window.SuperScience) return;

  /* ---------- Drawing ---------- */
  const SS = window.SuperScience;
  const R = 1.35; // view from -R to R on both axes
  const tidy = (v) => SS.fmt(Math.abs(v) < 0.005 ? 0 : v, 2);
  const piText = (deg) => (deg === 0 ? "0" : deg === 180 ? "π" : deg === 360 ? "2π" : `${SS.fmt(deg / 180, 2)}π`);

  SS.register({
    id: "euler-identity",
    title: "How can e, i and π make zero?",
    description: "Spin a point round a circle and land on maths' most famous equation.",
    tag: "Maths",

    render(root) {
      root.insertAdjacentHTML("beforeend", `
        <div class="legend" aria-hidden="true">
          <span class="legend-item"><i class="swatch swatch-amber"></i>e^(iθ)</span>
          <span class="legend-item"><i class="swatch swatch-cyan"></i>cos θ and sin θ</span>
        </div>
        <div class="graph-wrap graph-wrap--square"><svg role="img" aria-label="Unit circle on the complex plane with the point e to the i theta"></svg></div>
        <p class="big-eq" aria-live="polite"></p>`);
      const svg = root.querySelector("svg");
      const eq = root.querySelector(".big-eq");
      const set = SS.stats(root, [
        { key: "theta", label: "θ (radians)" },
        { key: "re", label: "Real: cos θ", cls: "stat-cyan" },
        { key: "im", label: "Imaginary: sin θ", cls: "stat-cyan" },
      ]);
      const slider = SS.slider(root, { id: "ei-angle", label: "Angle θ", min: 0, max: 360, step: 1, value: 45, format: (d) => `${piText(d)} (${d}°)` });
      root.insertAdjacentHTML("beforeend", `
        <div class="btn-row">
          <button type="button" class="btn" data-act="pi">Go to π</button>
          <button type="button" class="btn-secondary" data-act="i">× i (turn 90°)</button>
        </div>
        <p class="caption">e^(iθ) is the point at angle θ on a circle of radius 1: <b>cos θ + i sin θ</b>. Multiplying by <b>i</b> rotates any point 90°. Half a turn (θ = π) lands on −1, so <b>e^(iπ) + 1 = 0</b>.</p>`);

      let stopAnim = null;

      function draw() {
        const deg = Number(slider.value);
        const th = (deg * Math.PI) / 180;
        const z = expi(th);
        const { W, H, font } = SS.fit(svg, 1, 1);
        const a = SS.axes(svg, {
          W, H, font, id: "euler-identity", x: [-R, R], y: [-R, R], xTicks: [-1, 1], yTicks: [-1, 1],
          xFmt: (v) => (v > 0 ? "1" : "−1"), yFmt: (v) => (v > 0 ? "i" : "−i"),
          xLabel: "Real", yLabel: "Imaginary", pad: { left: 26, right: 14, top: 14, bottom: 26 },
        });
        const cx = a.sx(0), cy = a.sy(0), r = a.sx(1) - a.sx(0);
        SS.svgEl("circle", { cx, cy, r, fill: "none", stroke: "rgba(77,217,255,0.45)", "stroke-width": 2 }, svg);
        // angle arc
        if (deg > 0) {
          const ar = r * 0.22;
          SS.svgEl("path", {
            d: deg >= 360 ? `M${cx + ar},${cy} A${ar},${ar} 0 1 0 ${cx - ar},${cy} A${ar},${ar} 0 1 0 ${cx + ar},${cy}`
              : `M${cx + ar},${cy} A${ar},${ar} 0 ${deg > 180 ? 1 : 0} 0 ${cx + ar * z.re},${cy - ar * z.im}`,
            fill: "none", stroke: "#FFB300", "stroke-width": 2,
          }, svg);
        }
        // cos and sin projections
        const px = a.sx(z.re), py = a.sy(z.im);
        SS.svgEl("line", { x1: px, y1: py, x2: px, y2: cy, stroke: "#4DD9FF", "stroke-width": 2, "stroke-dasharray": "5 5" }, svg);
        SS.svgEl("line", { x1: px, y1: py, x2: cx, y2: py, stroke: "#4DD9FF", "stroke-width": 2, "stroke-dasharray": "5 5" }, svg);
        SS.arrow(svg, cx, cy, px, py, "#FFB300", 3);
        SS.svgEl("circle", { cx: px, cy: py, r: 8, fill: deg === 180 ? "#FF4D5E" : "#FFB300", stroke: "#000", "stroke-width": 2 }, svg);
        SS.svgEl("text", {
          x: px + (z.re >= 0 ? 12 : -12), y: py + (z.im >= 0 ? -10 : 20), "text-anchor": z.re >= 0 ? "start" : "end",
          fill: "#FFFFFF", "font-size": font + 3, "font-weight": 800, "font-family": "system-ui, sans-serif",
        }, svg).textContent = "e^(iθ)";

        set("theta", `${piText(deg)} = ${th.toFixed(2)}`);
        set("re", tidy(z.re));
        set("im", tidy(z.im));
        if (deg === 180) {
          eq.textContent = "e^(iπ) = −1   so   e^(iπ) + 1 = 0";
          eq.classList.add("win");
        } else {
          const im = Math.abs(z.im) < 0.005 ? 0 : z.im;
          eq.textContent = `e^(iθ) = ${tidy(z.re)} ${im < 0 ? "−" : "+"} ${Math.abs(im).toFixed(2)}i`;
          eq.classList.remove("win");
        }
      }

      // Smoothly turn the slider to a target angle (instant with reduced motion).
      function animateTo(target) {
        if (stopAnim) stopAnim();
        const start = Number(slider.value);
        let t = 0;
        // Wrap past a full turn (e.g. 315° + 90° = 405° shows as 45°).
        const go = (deg) => { slider.value = Math.round(deg) === 360 ? 360 : Math.round(deg) % 360; slider.dispatchEvent(new Event("input")); };
        if (SS.reducedMotion() || start === target) return go(target);
        stopAnim = SS.loop((dt) => {
          t = Math.min(1, t + dt / 0.8);
          const ease = 1 - Math.pow(1 - t, 3);
          go(start + (target - start) * ease);
          return t < 1;
        });
      }

      slider.addEventListener("input", draw);
      root.querySelector('[data-act="pi"]').addEventListener("click", () => animateTo(180));
      root.querySelector('[data-act="i"]').addEventListener("click", () => {
        const deg = Number(slider.value) % 360;
        animateTo(deg + 90);
      });
      draw();
      const unwatch = SS.watchWidth(svg.parentElement, draw);
      return () => { if (stopAnim) stopAnim(); unwatch(); };
    },
  });
})();
