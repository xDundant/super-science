/* Concept: Adding vectors (tip to tail) */
(function () {
  /* ---------- Maths ---------- */
  const toRad = (deg) => (deg * Math.PI) / 180;

  // A vector from its length and angle (degrees, anticlockwise from the +x axis).
  function fromPolar(length, angleDeg) {
    return { x: length * Math.cos(toRad(angleDeg)), y: length * Math.sin(toRad(angleDeg)) };
  }
  function add(a, b) {
    return { x: a.x + b.x, y: a.y + b.y };
  }
  function magnitude(v) {
    return Math.hypot(v.x, v.y);
  }
  // Angle in degrees, 0 to 360, anticlockwise from the +x axis.
  function angleDeg(v) {
    const deg = (Math.atan2(v.y, v.x) * 180) / Math.PI;
    return deg < 0 ? deg + 360 : deg;
  }

  if (typeof module !== "undefined" && module.exports) {
    module.exports = { fromPolar, add, magnitude, angleDeg };
  }
  if (typeof window === "undefined" || !window.SuperScience) return;

  /* ---------- Drawing ---------- */
  const SS = window.SuperScience;
  const RANGE = 10; // graph shows -10..10 on both axes (two max-length vectors fit)
  const COLORS = { a: "#4DD9FF", b: "#FFB300", r: "#FF4D5E", axis: "#4DD9FF", grid: "rgba(77, 217, 255, 0.10)" };

  SS.register({
    id: "vectors",
    title: "Adding vectors",
    description: "Put two arrows tip to tail and see where you end up.",
    tag: "Maths",

    render(root) {
      root.insertAdjacentHTML("beforeend", `
        <div class="legend" aria-hidden="true">
          <span class="legend-item"><i class="swatch swatch-cyan"></i>A</span>
          <span class="legend-item"><i class="swatch swatch-amber"></i>B</span>
          <span class="legend-item"><i class="swatch swatch-red"></i>A + B</span>
        </div>
        <div class="graph-wrap graph-wrap--square"><svg role="img" aria-label="Vector A, vector B placed tip to tail, and their sum A + B"></svg></div>
        <div class="stats">
          <div class="stat"><span class="stat-label">|A + B|</span><span class="stat-value stat-red" data-k="mag"></span></div>
          <div class="stat"><span class="stat-label">Angle</span><span class="stat-value stat-red" data-k="ang"></span></div>
          <div class="stat"><span class="stat-label">Components</span><span class="stat-value stat-wrap" data-k="xy"></span></div>
        </div>
        <div class="slider-groups">
          <div class="slider-group" data-g="a"><h3 class="group-title group-cyan">Vector A</h3></div>
          <div class="slider-group" data-g="b"><h3 class="group-title group-amber">Vector B</h3></div>
        </div>
        <p class="caption">Vectors add <b>tip to tail</b>: start B where A ends. A + B is the shortcut arrow from the very start to the very end.</p>`);

      const svg = root.querySelector("svg");
      const wrap = svg.parentElement;
      const out = (k) => root.querySelector(`[data-k="${k}"]`);
      const gA = root.querySelector('[data-g="a"]');
      const gB = root.querySelector('[data-g="b"]');
      const len1 = (v) => v.toFixed(1);
      const deg = (v) => v + "°";

      const aLen = SS.slider(gA, { id: "a-len", label: "Length", min: 0, max: 5, step: 0.1, value: 4, format: len1, accent: "cyan" });
      const aAng = SS.slider(gA, { id: "a-ang", label: "Angle", min: 0, max: 360, step: 1, value: 20, format: deg, accent: "cyan" });
      const bLen = SS.slider(gB, { id: "b-len", label: "Length", min: 0, max: 5, step: 0.1, value: 3, format: len1 });
      const bAng = SS.slider(gB, { id: "b-ang", label: "Angle", min: 0, max: 360, step: 1, value: 100, format: deg });

      let S = 400, scale = 1, cx = 200, cy = 200;
      const PAD = 22;
      const sx = (x) => cx + x * scale;
      const sy = (y) => cy - y * scale;
      let layer; // redrawn on every slider move

      function drawStatic() {
        S = Math.max(260, Math.round(wrap.clientWidth || 400));
        scale = (S - 2 * PAD) / (2 * RANGE);
        cx = cy = S / 2;
        svg.setAttribute("viewBox", `0 0 ${S} ${S}`);
        svg.innerHTML = "";
        const fontSize = S < 400 ? 11 : 13;

        const grid = SS.svgEl("g", { stroke: COLORS.grid, "stroke-width": 1 }, svg);
        for (let i = -RANGE; i <= RANGE; i++) {
          SS.svgEl("line", { x1: sx(i), y1: sy(-RANGE), x2: sx(i), y2: sy(RANGE) }, grid);
          SS.svgEl("line", { x1: sx(-RANGE), y1: sy(i), x2: sx(RANGE), y2: sy(i) }, grid);
        }
        const axes = SS.svgEl("g", { stroke: COLORS.axis, "stroke-width": 1.5, opacity: 0.7 }, svg);
        SS.svgEl("line", { x1: sx(-RANGE), y1: sy(0), x2: sx(RANGE), y2: sy(0) }, axes);
        SS.svgEl("line", { x1: sx(0), y1: sy(-RANGE), x2: sx(0), y2: sy(RANGE) }, axes);

        const labels = SS.svgEl("g", { fill: COLORS.axis, "font-size": fontSize, "font-family": "system-ui, sans-serif", opacity: 0.85 }, svg);
        for (const v of [-10, -5, 5, 10]) {
          const t = v < 0 ? "−" + Math.abs(v) : String(v);
          SS.svgEl("text", { x: sx(v), y: sy(0) + fontSize + 4, "text-anchor": "middle" }, labels).textContent = t;
          SS.svgEl("text", { x: sx(0) - 5, y: sy(v) + fontSize * 0.35, "text-anchor": "end" }, labels).textContent = t;
        }
        layer = SS.svgEl("g", {}, svg);
      }

      // Put a letter beside an arrow, on the side away from the triangle's centre.
      function labelArrow(p1, p2, text, color, centre) {
        const mx = (sx(p1.x) + sx(p2.x)) / 2, my = (sy(p1.y) + sy(p2.y)) / 2;
        const dx = sx(p2.x) - sx(p1.x), dy = sy(p2.y) - sy(p1.y);
        const len = Math.hypot(dx, dy);
        if (len < 18) return;
        let nx = -dy / len, ny = dx / len;
        if (nx * (mx - centre.x) + ny * (my - centre.y) < 0) { nx = -nx; ny = -ny; }
        SS.svgEl("text", {
          x: mx + nx * 16, y: my + ny * 16 + 5, "text-anchor": "middle",
          fill: color, "font-size": 16, "font-weight": 800, "font-family": "system-ui, sans-serif",
        }, layer).textContent = text;
      }

      function update() {
        const A = fromPolar(Number(aLen.value), Number(aAng.value));
        const B = fromPolar(Number(bLen.value), Number(bAng.value));
        const R = add(A, B);
        const O = { x: 0, y: 0 };
        const mag = magnitude(R);
        const ang = angleDeg(R);

        layer.innerHTML = "";
        // Angle arc for A + B
        if (mag > 0.05 && ang > 0.5) {
          const r = 26;
          const ex = cx + r * Math.cos(toRad(ang)), ey = cy - r * Math.sin(toRad(ang));
          SS.svgEl("path", {
            d: `M${cx + r},${cy} A${r},${r} 0 ${ang > 180 ? 1 : 0} 0 ${ex},${ey}`,
            fill: "none", stroke: COLORS.r, "stroke-width": 2, opacity: 0.8,
          }, layer);
        }
        SS.arrow(layer, sx(0), sy(0), sx(A.x), sy(A.y), COLORS.a, 3.5);
        SS.arrow(layer, sx(A.x), sy(A.y), sx(R.x), sy(R.y), COLORS.b, 3.5);
        SS.arrow(layer, sx(0), sy(0), sx(R.x), sy(R.y), COLORS.r, 3.5);

        const centre = { x: (sx(0) + sx(A.x) + sx(R.x)) / 3, y: (sy(0) + sy(A.y) + sy(R.y)) / 3 };
        labelArrow(O, A, "A", COLORS.a, centre);
        labelArrow(A, R, "B", COLORS.b, centre);
        labelArrow(O, R, "A+B", COLORS.r, centre);

        out("mag").textContent = mag.toFixed(2);
        out("ang").textContent = mag < 0.005 ? "—" : ((Math.round(ang * 10) / 10) % 360).toFixed(1) + "°";
        const f = (n) => (Math.abs(n) < 0.005 ? "0.00" : n.toFixed(2)).replace("-", "−");
        out("xy").textContent = `(${f(R.x)}, ${f(R.y)})`;
      }

      // Slider drags: redraw at most once per frame
      const onSlide = SS.perFrame(update);
      [aLen, aAng, bLen, bAng].forEach((s) => s.addEventListener("input", onSlide));
      drawStatic();
      update();
      const unwatch = SS.watchWidth(wrap, () => { drawStatic(); update(); });
      return () => { onSlide.cancel(); unwatch(); };
    },
  });
})();
