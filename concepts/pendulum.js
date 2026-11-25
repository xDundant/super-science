/* Concept: Pendulum, real swing vs the small-angle formula */
(function () {
  /* ---------- Physics ---------- */
  const G = 9.8;
  const toRad = (d) => (d * Math.PI) / 180;
  // Textbook formula (assumes sin θ ≈ θ): T = 2π√(L/g)
  const smallAnglePeriod = (L) => 2 * Math.PI * Math.sqrt(L / G);

  // One RK4 step of the REAL equation θ'' = −(g/L)·sin θ
  function step(theta, omega, L, dt) {
    const f = (th) => -(G / L) * Math.sin(th);
    const k1t = omega, k1w = f(theta);
    const k2t = omega + (k1w * dt) / 2, k2w = f(theta + (k1t * dt) / 2);
    const k3t = omega + (k2w * dt) / 2, k3w = f(theta + (k2t * dt) / 2);
    const k4t = omega + k3w * dt, k4w = f(theta + k3t * dt);
    return [theta + ((k1t + 2 * k2t + 2 * k3t + k4t) * dt) / 6, omega + ((k1w + 2 * k2w + 2 * k3w + k4w) * dt) / 6];
  }

  // Real period by simulation: release from rest, time how long it takes to reach
  // the bottom (a quarter swing), then multiply by 4.
  function realPeriod(L, startDeg, stepsPerQuarter = 4000) {
    const dt = smallAnglePeriod(L) / 4 / stepsPerQuarter;
    let th = toRad(startDeg), w = 0, t = 0;
    for (;;) {
      const [th2, w2] = step(th, w, L, dt);
      if (th2 <= 0) return 4 * (t + dt * (th / (th - th2))); // interpolate the exact crossing
      th = th2; w = w2; t += dt;
    }
  }

  if (typeof module !== "undefined" && module.exports) module.exports = { G, smallAnglePeriod, step, realPeriod };
  if (typeof window === "undefined" || !window.SuperScience) return;

  /* ---------- Drawing ---------- */
  const SS = window.SuperScience;

  SS.register({
    id: "pendulum",
    title: "Does a bigger swing take longer?",
    description: "Race a real pendulum against the textbook formula and watch them drift apart.",
    tag: "Physics",

    render(root) {
      root.insertAdjacentHTML("beforeend", `
        <div class="legend" aria-hidden="true">
          <span class="legend-item"><i class="swatch swatch-amber"></i>real pendulum</span>
          <span class="legend-item"><i class="swatch swatch-cyan"></i>small-angle formula</span>
        </div>
        <div class="graph-wrap"><svg class="pend" role="img" aria-label="A swinging pendulum next to a ghost pendulum following the small-angle formula"></svg></div>`);
      const svg = root.querySelector("svg.pend");
      const set = SS.stats(root, [
        { key: "real", label: "Real period" },
        { key: "small", label: "Formula 2π√(L/g)", cls: "stat-cyan" },
        { key: "diff", label: "Difference", cls: "stat-red" },
      ]);
      const sL = SS.slider(root, { id: "pd-l", label: "Length", min: 0.2, max: 3, step: 0.1, value: 1, format: (v) => v.toFixed(1) + " m" });
      const sA = SS.slider(root, { id: "pd-a", label: "Starting angle", min: 5, max: 80, step: 1, value: 30, format: (v) => v + "°" });
      root.insertAdjacentHTML("beforeend", `
        <p class="graph-title">Period vs starting angle</p>
        <div class="graph-wrap"><svg class="chart" role="img" aria-label="Graph of the real period rising above the formula as the angle grows"></svg></div>
        <p class="caption">The formula T = 2π√(L/g) assumes <b>sin θ ≈ θ</b>, the first term of the <a href="#taylor">Taylor series for sin</a>. That's spot on for small swings, so the two pendulums stay together. At big angles sin θ is noticeably less than θ, the pull back is weaker, and the <b>real swing takes longer</b>.</p>`);
      const chart = root.querySelector("svg.chart");

      let th = 0, w = 0, t = 0, L = 1, start = 30, Treal = 0, T0 = 0, layer = null, W = 400, H = 300;

      function restart() {
        L = Number(sL.value); start = Number(sA.value);
        th = toRad(start); w = 0; t = 0;
        Treal = realPeriod(L, start); T0 = smallAnglePeriod(L);
        set("real", Treal.toFixed(3) + " s");
        set("small", T0.toFixed(3) + " s");
        set("diff", "+" + (((Treal - T0) / T0) * 100).toFixed(1) + "%");
        drawChart();
      }

      function drawStatic() {
        const f = SS.fit(svg, 0.8, 0.45);
        W = f.W;
        // Height just big enough for the longest (3 m) pendulum at the width's scale
        H = Math.round(Math.min(f.H, W / 2 + 50));
        svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
        layer = SS.svgEl("g", {}, svg);
      }

      function drawPendulum() {
        layer.innerHTML = "";
        // Zoom to fit this pendulum (but never closer than 1.5 m), down and sideways.
        const view = Math.max(L, 1.5);
        const px = W / 2, py = 18, perM = Math.min((H - 50) / view, (W / 2 - 20) / view);
        const len = L * perM;
        const pos = (a) => [px + len * Math.sin(a), py + len * Math.cos(a)];
        // ceiling and swing range
        SS.svgEl("line", { x1: px - 50, y1: py, x2: px + 50, y2: py, stroke: "#4DD9FF", "stroke-width": 3 }, layer);
        const [lx, ly] = pos(-toRad(start)), [rx, ry] = pos(toRad(start));
        SS.svgEl("path", { d: `M${lx},${ly} A${len},${len} 0 0 0 ${rx},${ry}`, fill: "none", stroke: "rgba(255,255,255,0.15)", "stroke-width": 1.5, "stroke-dasharray": "4 5" }, layer);
        // ghost: small-angle formula θ(t) = θ₀·cos(√(g/L)·t)
        const ghost = toRad(start) * Math.cos(Math.sqrt(G / L) * t);
        const [gx, gy] = pos(ghost);
        SS.svgEl("line", { x1: px, y1: py, x2: gx, y2: gy, stroke: "rgba(77,217,255,0.55)", "stroke-width": 2 }, layer);
        SS.svgEl("circle", { cx: gx, cy: gy, r: 12, fill: "rgba(77,217,255,0.35)", stroke: "#4DD9FF", "stroke-width": 2 }, layer);
        // real pendulum
        const [bx, by] = pos(th);
        SS.svgEl("line", { x1: px, y1: py, x2: bx, y2: by, stroke: "#FFFFFF", "stroke-width": 2.5 }, layer);
        SS.svgEl("circle", { cx: bx, cy: by, r: 13, fill: "#FFB300", stroke: "#000", "stroke-width": 2 }, layer);
        SS.svgEl("circle", { cx: px, cy: py, r: 4, fill: "#FFFFFF" }, layer);
        // 1 m scale bar
        SS.svgEl("line", { x1: W - 14 - perM, y1: H - 16, x2: W - 14, y2: H - 16, stroke: "#4DD9FF", "stroke-width": 3 }, layer);
        SS.svgEl("text", { x: W - 14 - perM / 2, y: H - 24, "text-anchor": "middle", fill: "#4DD9FF", "font-size": 12, "font-family": "system-ui, sans-serif" }, layer).textContent = "1 m";
        SS.svgEl("text", { x: 10, y: H - 12, fill: "#FFFFFF", "font-size": 13, "font-family": "system-ui, sans-serif", "font-variant-numeric": "tabular-nums" }, layer).textContent = `t = ${t.toFixed(1)} s`;
      }

      function drawChart() {
        const { W: cw, H: ch, font } = SS.fit(chart, 0.55, 0.32);
        const angles = []; for (let d = 5; d <= 80; d += 5) angles.push(d);
        const periods = angles.map((d) => realPeriod(L, d, 1500));
        const yMin = Math.floor(T0 * 0.98 * 10) / 10, yMax = Math.ceil(periods[periods.length - 1] * 1.03 * 10) / 10;
        const yStep = (yMax - yMin) / 3;
        const a = SS.axes(chart, {
          W: cw, H: ch, font, id: "pend-chart", x: [5, 80], y: [yMin, yMax], xTicks: [5, 20, 40, 60, 80],
          yTicks: [yMin, yMin + yStep, yMin + 2 * yStep, yMax], xFmt: (v) => v + "°", yFmt: (v) => v.toFixed(2) + " s",
          pad: { left: 50 },
        });
        SS.svgEl("line", { x1: a.sx(5), y1: a.sy(T0), x2: a.sx(80), y2: a.sy(T0), stroke: "#4DD9FF", "stroke-width": 2, "stroke-dasharray": "7 6" }, chart);
        SS.svgEl("path", { d: SS.pathD(angles.map((d, i) => [a.sx(d), a.sy(periods[i])])), fill: "none", stroke: "#FFB300", "stroke-width": 3 }, chart);
        SS.svgEl("circle", { cx: a.sx(start), cy: a.sy(Treal), r: 7, fill: "#FF4D5E", stroke: "#000", "stroke-width": 2 }, chart);
      }

      const stop = SS.loop((dt) => {
        const sub = 20, h = dt / sub;
        for (let i = 0; i < sub; i++) [th, w] = step(th, w, L, h);
        t += dt;
        drawPendulum();
      });

      sL.addEventListener("input", restart);
      sA.addEventListener("input", restart);
      drawStatic();
      restart();
      drawPendulum();
      const unwatch = SS.watchWidth(svg.parentElement, () => { drawStatic(); drawChart(); drawPendulum(); });
      return () => { stop(); unwatch(); };
    },
  });
})();
