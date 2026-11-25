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
      // The exact angle being drawn (can be fractional, e.g. 179.37°); the slider shows it rounded.
      let angle = Number(slider.value);
      let a = null, cx = 0, cy = 0, r = 1, font = 12, el = null;
      const shown = {};
      const setOnce = (key, text) => { if (shown[key] !== text) { shown[key] = text; set(key, text); } };
      const put = (node, attrs) => { for (const k in attrs) node.setAttribute(k, typeof attrs[k] === "number" ? attrs[k].toFixed(1) : attrs[k]); };

      // Axes, circle and labels: drawn once (and on resize). The moving parts are created
      // here too, then only moved by drawAngle().
      function drawStatic() {
        const f = SS.fit(svg, 1, 1);
        font = f.font;
        a = SS.axes(svg, {
          W: f.W, H: f.H, font, id: "euler-identity", x: [-R, R], y: [-R, R], xTicks: [-1, 1], yTicks: [-1, 1],
          xFmt: (v) => (v > 0 ? "1" : "−1"), yFmt: (v) => (v > 0 ? "i" : "−i"),
          xLabel: "Real", yLabel: "Imaginary", pad: { left: 26, right: 14, top: 14, bottom: 26 },
        });
        cx = a.sx(0); cy = a.sy(0); r = a.sx(1) - a.sx(0);
        SS.svgEl("circle", { cx, cy, r, fill: "none", stroke: "rgba(77,217,255,0.45)", "stroke-width": 2 }, svg);
        const dash = { stroke: "#4DD9FF", "stroke-width": 2, "stroke-dasharray": "5 5" };
        el = {
          arc: SS.svgEl("path", { fill: "none", stroke: "#FFB300", "stroke-width": 2 }, svg),
          down: SS.svgEl("line", dash, svg),
          across: SS.svgEl("line", dash, svg),
          arrow: SS.arrow(svg, cx, cy, cx, cy, "#FFB300", 3),
          point: SS.svgEl("circle", { r: 8, stroke: "#000", "stroke-width": 2 }, svg),
          label: SS.svgEl("text", { fill: "#FFFFFF", "font-size": font + 3, "font-weight": 800, "font-family": "system-ui, sans-serif" }, svg),
        };
        el.label.textContent = "e^(iθ)";
      }

      function drawAngle() {
        const deg = angle;
        const th = (deg * Math.PI) / 180;
        const z = expi(th);
        // angle arc
        const ar = r * 0.22;
        el.arc.style.display = deg > 0.01 ? "" : "none";
        el.arc.setAttribute("d", deg >= 359.99
          ? `M${cx + ar},${cy} A${ar},${ar} 0 1 0 ${cx - ar},${cy} A${ar},${ar} 0 1 0 ${cx + ar},${cy}`
          : `M${(cx + ar).toFixed(1)},${cy.toFixed(1)} A${ar.toFixed(1)},${ar.toFixed(1)} 0 ${deg > 180 ? 1 : 0} 0 ${(cx + ar * z.re).toFixed(1)},${(cy - ar * z.im).toFixed(1)}`);
        // cos and sin projections
        const px = a.sx(z.re), py = a.sy(z.im);
        put(el.down, { x1: px, y1: py, x2: px, y2: cy });
        put(el.across, { x1: px, y1: py, x2: cx, y2: py });
        SS.setArrow(el.arrow, cx, cy, px, py);
        const atPi = Math.abs(deg - 180) < 0.5;
        put(el.point, { cx: px, cy: py, fill: atPi ? "#FF4D5E" : "#FFB300" });
        put(el.label, { x: px + (z.re >= 0 ? 12 : -12), y: py + (z.im >= 0 ? -10 : 20), "text-anchor": z.re >= 0 ? "start" : "end" });

        const shownDeg = Math.round(deg);
        setOnce("theta", `${piText(shownDeg)} = ${th.toFixed(2)}`);
        setOnce("re", tidy(z.re));
        setOnce("im", tidy(z.im));
        const text = atPi ? "e^(iπ) = −1   so   e^(iπ) + 1 = 0"
          : (() => { const im = Math.abs(z.im) < 0.005 ? 0 : z.im; return `e^(iθ) = ${tidy(z.re)} ${im < 0 ? "−" : "+"} ${Math.abs(im).toFixed(2)}i`; })();
        if (eq.textContent !== text) eq.textContent = text;
        eq.classList.toggle("win", atPi);
      }

      // Smoothly turn to a target angle. The drawing uses the exact angle every frame;
      // the slider just shows the nearest whole degree. Reduced motion: a short, calm turn.
      function animateTo(target) {
        if (stopAnim) stopAnim();
        const start = angle;
        if (start === target) return;
        const duration = SS.reducedMotion() ? 0.25 : 0.8;
        let t = 0;
        stopAnim = SS.loop((dt) => {
          t = Math.min(1, t + dt / duration);
          const ease = 1 - Math.pow(1 - t, 3);
          const deg = start + (target - start) * ease;
          // Wrap past a full turn (e.g. 315° + 90° = 405° shows as 45°)
          angle = t >= 1 && Math.round(target) === 360 ? 360 : ((deg % 360) + 360) % 360;
          const sliderDeg = Math.round(angle) === 360 && t < 1 ? 0 : Math.round(angle);
          if (Number(slider.value) !== sliderDeg) {
            slider.value = sliderDeg;
            slider.dispatchEvent(new Event("input", { bubbles: false }));
          }
          drawAngle();
          if (t >= 1) { stopAnim = null; return false; }
        });
      }

      // Dragging the slider: follow it exactly, at most one redraw per frame.
      const onSlide = SS.perFrame(() => { angle = Number(slider.value); drawAngle(); });
      slider.addEventListener("input", (e) => {
        if (e.isTrusted && stopAnim) { stopAnim(); stopAnim = null; } // your drag takes over from an animation
        if (!stopAnim) onSlide();
      });
      root.querySelector('[data-act="pi"]').addEventListener("click", () => animateTo(180));
      root.querySelector('[data-act="i"]').addEventListener("click", () => animateTo((angle % 360) + 90));
      drawStatic();
      drawAngle();
      const unwatch = SS.watchWidth(svg.parentElement, () => { drawStatic(); drawAngle(); });
      return () => { if (stopAnim) stopAnim(); onSlide.cancel(); unwatch(); };
    },
  });
})();
