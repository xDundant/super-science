/* Concept: Taylor series of sin(x) */
(function () {
  /* ---------- Maths ---------- */

  // Taylor polynomial of sin(x) with n terms:
  //   sum_{k=0}^{n-1} (-1)^k * x^(2k+1) / (2k+1)!
  // Each term is built from the previous one, which avoids huge factorials.
  function taylorSin(x, n) {
    let term = x;
    let sum = term;
    for (let k = 1; k < n; k++) {
      term *= -(x * x) / ((2 * k) * (2 * k + 1));
      sum += term;
    }
    return sum;
  }

  // Fractional number of terms, for smooth morphing: the first floor(n) terms count fully
  // and the next term is blended in with weight (n − floor(n)).
  // e.g. n = 2.25 -> x − x³/3! + 0.25 × x⁵/5!. At whole numbers it equals taylorSin(x, n).
  function taylorSinBlend(x, n) {
    const whole = Math.floor(n), frac = n - whole;
    let term = x, sum = 0;
    for (let k = 0; k <= whole; k++) {
      if (k > 0) term *= -(x * x) / ((2 * k) * (2 * k + 1));
      if (k < whole) sum += term;
      else if (frac > 0) sum += frac * term;
    }
    return sum;
  }

  // Text label, e.g. "x − x³/3! + x⁵/5!"
  const SUPERSCRIPT = { 0: "⁰", 1: "¹", 2: "²", 3: "³", 4: "⁴", 5: "⁵", 6: "⁶", 7: "⁷", 8: "⁸", 9: "⁹" };
  const sup = (num) => String(num).split("").map((d) => SUPERSCRIPT[d]).join("");
  function polynomialLabel(n) {
    let label = "";
    for (let k = 0; k < n; k++) {
      const p = 2 * k + 1;
      const term = p === 1 ? "x" : `x${sup(p)}/${p}!`;
      label += k === 0 ? term : (k % 2 === 1 ? " − " : " + ") + term;
    }
    return label;
  }

  // Let Node.js load the maths for testing.
  if (typeof module !== "undefined" && module.exports) {
    module.exports = { taylorSin, taylorSinBlend, polynomialLabel };
  }
  if (typeof window === "undefined" || !window.SuperScience) return;

  /* ---------- Drawing ---------- */
  const SS = window.SuperScience;
  const X_MIN = -2 * Math.PI, X_MAX = 2 * Math.PI;
  const Y_MIN = -3, Y_MAX = 3;
  const SAMPLES = 600;
  const COLORS = { sin: "#FFFFFF", taylor: "#FFB300", axis: "#4DD9FF", grid: "rgba(77, 217, 255, 0.12)" };
  const PI_LABELS = { "-2": "−2π", "-1": "−π", "0": "0", "1": "π", "2": "2π" };

  SS.register({
    id: "taylor",
    title: "Taylor series of sin(x)",
    description: "Build sin(x) out of simple powers of x, one term at a time.",
    tag: "Maths",

    render(root) {
      root.insertAdjacentHTML("beforeend", `
        <div class="legend" aria-hidden="true">
          <span class="legend-item"><i class="swatch swatch-white"></i>sin(x)</span>
          <span class="legend-item"><i class="swatch swatch-amber"></i>Taylor polynomial</span>
        </div>
        <div class="graph-wrap"><svg role="img" aria-label="Graph of sin(x) and its Taylor polynomial"></svg></div>
        <p class="poly" aria-live="polite"></p>`);

      const svg = root.querySelector("svg");
      const wrap = svg.parentElement;
      const polyEl = root.querySelector(".poly");
      // Fractional steps so the curve can morph; the label shows the rounded whole number.
      const slider = SS.slider(root, { id: "terms", label: "Terms", min: 1, max: 10, step: 0.01, value: 1, format: (v) => String(Math.round(v)) });

      root.insertAdjacentHTML("beforeend", `
        <p class="error-readout"></p>
        <p class="caption">Add more terms and the polynomial hugs sin(x) further out.</p>`);
      const errorEl = root.querySelector(".error-readout");

      let W = 800, H = 480;
      const PAD = { left: 30, right: 12, top: 12, bottom: 28 };
      const sx = (x) => PAD.left + ((x - X_MIN) / (X_MAX - X_MIN)) * (W - PAD.left - PAD.right);
      const sy = (y) => PAD.top + ((Y_MAX - y) / (Y_MAX - Y_MIN)) * (H - PAD.top - PAD.bottom);

      // x values and their screen positions are fixed for a given width, so work them out once.
      let xs = [], pxs = [];
      function sampleXs() {
        xs = []; pxs = [];
        for (let i = 0; i <= SAMPLES; i++) {
          const x = X_MIN + (i / SAMPLES) * (X_MAX - X_MIN);
          xs.push(x); pxs.push(sx(x).toFixed(1));
        }
      }
      // ONE path for the whole curve. Values are limited to ±50 so numbers stay sane;
      // the clip hides anything outside −3..3.
      function pathFor(fn) {
        let d = "";
        for (let i = 0; i <= SAMPLES; i++) {
          const y = Math.max(-50, Math.min(50, fn(xs[i])));
          d += (i === 0 ? "M" : "L") + pxs[i] + "," + sy(y).toFixed(1);
        }
        return d;
      }

      // The static picture (grid, axes, labels, sin curve) is drawn once per size.
      let taylorPath;
      function drawStatic() {
        W = Math.max(280, Math.round(wrap.clientWidth || 800));
        H = Math.round(W < 600 ? W * 0.85 : W * 0.5);
        svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
        svg.innerHTML = "";
        sampleXs();
        const fontSize = W < 500 ? 12 : 14;

        const clip = SS.svgEl("clipPath", { id: "taylor-clip" }, SS.svgEl("defs", {}, svg));
        SS.svgEl("rect", { x: PAD.left, y: PAD.top, width: W - PAD.left - PAD.right, height: H - PAD.top - PAD.bottom }, clip);

        const grid = SS.svgEl("g", { stroke: COLORS.grid, "stroke-width": 1 }, svg);
        for (let i = -4; i <= 4; i++) {
          const x = sx((i * Math.PI) / 2);
          SS.svgEl("line", { x1: x, y1: sy(Y_MAX), x2: x, y2: sy(Y_MIN) }, grid);
        }
        for (let y = Y_MIN; y <= Y_MAX; y++) {
          SS.svgEl("line", { x1: sx(X_MIN), y1: sy(y), x2: sx(X_MAX), y2: sy(y) }, grid);
        }

        const axes = SS.svgEl("g", { stroke: COLORS.axis, "stroke-width": 1.5, opacity: 0.8 }, svg);
        SS.svgEl("line", { x1: sx(X_MIN), y1: sy(0), x2: sx(X_MAX), y2: sy(0) }, axes);
        SS.svgEl("line", { x1: sx(0), y1: sy(Y_MIN), x2: sx(0), y2: sy(Y_MAX) }, axes);

        const labels = SS.svgEl("g", { fill: COLORS.axis, "font-size": fontSize, "font-family": "system-ui, sans-serif" }, svg);
        for (let i = -2; i <= 2; i++) {
          SS.svgEl("text", { x: sx(i * Math.PI), y: H - 8, "text-anchor": "middle" }, labels).textContent = PI_LABELS[i];
        }
        for (let y = Y_MIN; y <= Y_MAX; y++) {
          if (y === 0) continue;
          SS.svgEl("text", { x: PAD.left - 6, y: sy(y) + fontSize * 0.35, "text-anchor": "end" }, labels)
            .textContent = y < 0 ? "−" + Math.abs(y) : String(y);
        }

        const curves = SS.svgEl("g", { "clip-path": "url(#taylor-clip)", fill: "none", "stroke-linecap": "round", "stroke-linejoin": "round" }, svg);
        SS.svgEl("path", { d: pathFor(Math.sin), stroke: COLORS.sin, "stroke-width": 2.5 }, curves);
        taylorPath = SS.svgEl("path", { stroke: COLORS.taylor, "stroke-width": 3 }, curves);
      }

      /* ---------- Smooth motion ----------
       * target = where the slider is; shown = what's drawn. Every frame, shown glides
       * towards target (ease-out), so dragging, tapping the track and arrow keys all
       * animate smoothly. When you let go, target settles on the nearest whole number. */
      let target = Number(slider.value), shown = target, stopAnim = null, labelN = null;
      const TAU = () => (SS.reducedMotion() ? 0.03 : 0.07); // seconds; shorter = snappier

      function drawCurve() {
        taylorPath.setAttribute("d", pathFor((x) => taylorSinBlend(x, shown)));
        const n = Math.round(shown);
        if (n !== labelN) {
          // Text only changes when the whole-number count changes
          labelN = n;
          polyEl.textContent = polynomialLabel(n);
          const err = Math.abs(taylorSin(Math.PI, n) - Math.sin(Math.PI));
          errorEl.innerHTML = `Error at x = π: <b>${err < 1e-4 ? err.toExponential(1) : err.toFixed(4)}</b>`;
        }
      }

      function animate() {
        if (stopAnim) return; // already running
        stopAnim = SS.loop((dt) => {
          shown = SS.smooth(shown, target, dt, TAU());
          if (Math.abs(shown - target) < 0.0005) shown = target;
          drawCurve();
          if (shown === target) { stopAnim = null; return false; }
        });
      }

      function setTarget(v, settle) {
        target = Math.max(1, Math.min(10, settle ? Math.round(v) : v));
        if (settle) {
          slider.value = target;
          slider.dispatchEvent(new Event("input")); // update the slider's label and fill
        }
        animate();
      }

      slider.addEventListener("input", () => { target = Number(slider.value); animate(); });
      // Released after a drag or a tap on the track: glide to the nearest whole number.
      slider.addEventListener("change", () => setTarget(Number(slider.value), true));
      // Arrow keys move one whole term (the slider itself would only move 0.01).
      slider.addEventListener("keydown", (e) => {
        const n = Math.round(target);
        const next = { ArrowRight: n + 1, ArrowUp: n + 1, ArrowLeft: n - 1, ArrowDown: n - 1, PageUp: n + 3, PageDown: n - 3, Home: 1, End: 10 }[e.key];
        if (next === undefined) return;
        e.preventDefault();
        setTarget(next, true);
      });

      drawStatic();
      drawCurve();
      const unwatch = SS.watchWidth(wrap, () => { drawStatic(); labelN = null; drawCurve(); });
      return () => { if (stopAnim) stopAnim(); unwatch(); };
    },
  });
})();
