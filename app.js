/* Super Science: Taylor series of sin(x)
 * Plain JavaScript, no libraries. The graph is drawn as SVG.
 */

/* ---------- Maths ---------- */

// Taylor polynomial of sin(x) with n terms:
//   sum_{k=0}^{n-1} (-1)^k * x^(2k+1) / (2k+1)!
// Each term is built from the previous one, which avoids huge factorials.
function taylorSin(x, n) {
  let term = x;        // k = 0 term: x
  let sum = term;
  for (let k = 1; k < n; k++) {
    term *= -(x * x) / ((2 * k) * (2 * k + 1));
    sum += term;
  }
  return sum;
}

// Text label for the polynomial, e.g. "x − x³/3! + x⁵/5!"
const SUPERSCRIPT = { 0: "⁰", 1: "¹", 2: "²", 3: "³", 4: "⁴", 5: "⁵", 6: "⁶", 7: "⁷", 8: "⁸", 9: "⁹" };
function sup(num) {
  return String(num).split("").map((d) => SUPERSCRIPT[d]).join("");
}
function polynomialLabel(n) {
  let label = "";
  for (let k = 0; k < n; k++) {
    const p = 2 * k + 1;
    const term = p === 1 ? "x" : `x${sup(p)}/${p}!`;
    if (k === 0) label = term;
    else label += (k % 2 === 1 ? " − " : " + ") + term;
  }
  return label;
}

// Let Node.js load the maths for testing (ignored in the browser).
if (typeof module !== "undefined" && module.exports) {
  module.exports = { taylorSin, polynomialLabel };
}

/* ---------- Graph ---------- */

if (typeof document !== "undefined") {
  const X_MIN = -2 * Math.PI;
  const X_MAX = 2 * Math.PI;
  const Y_MIN = -3;
  const Y_MAX = 3;
  const SAMPLES = 600;

  const COLORS = {
    sin: "#FFFFFF",
    taylor: "#FFB300",
    axis: "#4DD9FF",
    grid: "rgba(77, 217, 255, 0.12)",
    label: "#4DD9FF",
  };

  const svg = document.getElementById("graph");
  const wrap = svg.parentElement;
  const slider = document.getElementById("terms");
  const termsValue = document.getElementById("terms-value");
  const polyEl = document.getElementById("poly");
  const errorEl = document.getElementById("error-readout");
  const NS = "http://www.w3.org/2000/svg";

  let W = 800, H = 480;
  const PAD = { left: 30, right: 12, top: 12, bottom: 28 };

  const sx = (x) => PAD.left + ((x - X_MIN) / (X_MAX - X_MIN)) * (W - PAD.left - PAD.right);
  const sy = (y) => PAD.top + ((Y_MAX - y) / (Y_MAX - Y_MIN)) * (H - PAD.top - PAD.bottom);

  function el(name, attrs, parent) {
    const node = document.createElementNS(NS, name);
    for (const key in attrs) node.setAttribute(key, attrs[key]);
    if (parent) parent.appendChild(node);
    return node;
  }

  // Build an SVG path for a function. Values are limited to ±50 so the
  // numbers stay sane; the clip-path hides everything outside -3..3.
  function pathFor(fn) {
    let d = "";
    for (let i = 0; i <= SAMPLES; i++) {
      const x = X_MIN + (i / SAMPLES) * (X_MAX - X_MIN);
      const y = Math.max(-50, Math.min(50, fn(x)));
      d += (i === 0 ? "M" : "L") + sx(x).toFixed(2) + "," + sy(y).toFixed(2);
    }
    return d;
  }

  const PI_LABELS = { "-2": "−2π", "-1": "−π", "0": "0", "1": "π", "2": "2π" };

  let taylorPath = null;

  function drawStatic() {
    // Size the drawing to the real on-screen width, so text stays crisp and readable.
    W = Math.max(280, Math.round(wrap.clientWidth || 800));
    H = Math.round(W < 600 ? W * 0.85 : W * 0.5);
    svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
    svg.innerHTML = "";

    const fontSize = W < 500 ? 12 : 14;

    const defs = el("defs", {}, svg);
    const clip = el("clipPath", { id: "plot-area" }, defs);
    el("rect", { x: PAD.left, y: PAD.top, width: W - PAD.left - PAD.right, height: H - PAD.top - PAD.bottom }, clip);

    const grid = el("g", { stroke: COLORS.grid, "stroke-width": 1 }, svg);
    // Vertical grid lines every π/2
    for (let i = -4; i <= 4; i++) {
      const x = sx((i * Math.PI) / 2);
      el("line", { x1: x, y1: sy(Y_MAX), x2: x, y2: sy(Y_MIN) }, grid);
    }
    // Horizontal grid lines every 1
    for (let y = Y_MIN; y <= Y_MAX; y++) {
      el("line", { x1: sx(X_MIN), y1: sy(y), x2: sx(X_MAX), y2: sy(y) }, grid);
    }

    // Axes
    const axes = el("g", { stroke: COLORS.axis, "stroke-width": 1.5, opacity: 0.8 }, svg);
    el("line", { x1: sx(X_MIN), y1: sy(0), x2: sx(X_MAX), y2: sy(0) }, axes);
    el("line", { x1: sx(0), y1: sy(Y_MIN), x2: sx(0), y2: sy(Y_MAX) }, axes);

    // Tick labels: x at multiples of π (along the bottom), y at integers
    const labels = el("g", { fill: COLORS.label, "font-size": fontSize, "font-family": "system-ui, sans-serif" }, svg);
    for (let i = -2; i <= 2; i++) {
      const t = el("text", { x: sx(i * Math.PI), y: H - 8, "text-anchor": "middle" }, labels);
      t.textContent = PI_LABELS[i];
    }
    for (let y = Y_MIN; y <= Y_MAX; y++) {
      if (y === 0) continue;
      const t = el("text", { x: PAD.left - 6, y: sy(y) + fontSize * 0.35, "text-anchor": "end" }, labels);
      t.textContent = y < 0 ? "−" + Math.abs(y) : String(y);
    }

    // Curves (clipped to the plot area)
    const curves = el("g", { "clip-path": "url(#plot-area)", fill: "none", "stroke-linecap": "round", "stroke-linejoin": "round" }, svg);
    el("path", { d: pathFor(Math.sin), stroke: COLORS.sin, "stroke-width": 2.5 }, curves);
    taylorPath = el("path", { stroke: COLORS.taylor, "stroke-width": 3 }, curves);
  }

  function update() {
    const n = Number(slider.value);
    taylorPath.setAttribute("d", pathFor((x) => taylorSin(x, n)));
    termsValue.textContent = n;
    polyEl.textContent = polynomialLabel(n);

    // Fill the slider track up to the thumb (Chrome/Safari)
    const pct = ((n - slider.min) / (slider.max - slider.min)) * 100;
    slider.style.setProperty("--fill", pct + "%");

    const err = Math.abs(taylorSin(Math.PI, n) - Math.sin(Math.PI));
    errorEl.innerHTML = `Error at x = π: <b>${err < 1e-4 ? err.toExponential(1) : err.toFixed(4)}</b>`;
  }

  // "input" fires continuously while dragging (touch, mouse and arrow keys)
  slider.addEventListener("input", update);

  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => { drawStatic(); update(); }, 100);
  });

  drawStatic();
  update();

  /* ---------- Offline support (service worker) ---------- */
  if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("sw.js").catch(() => {});
    });
  }
}
