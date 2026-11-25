/* Concept: Projectile motion (no air resistance) */
(function () {
  /* ---------- Physics ---------- */
  const G = 9.8; // m/s²
  const toRad = (deg) => (deg * Math.PI) / 180;

  // v = launch speed (m/s), deg = launch angle above the ground (degrees)
  function timeOfFlight(v, deg) { return (2 * v * Math.sin(toRad(deg))) / G; }         // T = 2v·sinθ / g
  function range(v, deg) { return Math.max(0, (v * v * Math.sin(2 * toRad(deg))) / G); } // R = v²·sin2θ / g
  function maxHeight(v, deg) { return (v * Math.sin(toRad(deg))) ** 2 / (2 * G); }        // H = v²·sin²θ / 2g
  function position(v, deg, t) {                                                         // where the ball is at time t
    return { x: v * Math.cos(toRad(deg)) * t, y: v * Math.sin(toRad(deg)) * t - 0.5 * G * t * t };
  }

  if (typeof module !== "undefined" && module.exports) {
    module.exports = { G, timeOfFlight, range, maxHeight, position };
  }
  if (typeof window === "undefined" || !window.SuperScience) return;

  /* ---------- Drawing ---------- */
  const SS = window.SuperScience;
  const COLORS = { path: "#FFB300", ball: "#FF4D5E", axis: "#4DD9FF", grid: "rgba(77, 217, 255, 0.12)", ghost: "rgba(255,255,255,0.35)" };
  // Zoom levels (metres across the graph) and the grid spacing for each.
  const LEVELS = [[10, 2], [20, 4], [50, 10], [100, 20], [200, 40], [300, 50]];

  SS.register({
    id: "projectile",
    title: "Projectile motion",
    description: "Launch a ball and find the angle that sends it furthest.",
    tag: "Physics",

    render(root) {
      root.insertAdjacentHTML("beforeend", `
        <div class="legend" aria-hidden="true">
          <span class="legend-item"><i class="swatch swatch-amber"></i>Trajectory</span>
          <span class="legend-item"><i class="swatch swatch-dashed"></i>45° at same speed</span>
        </div>
        <div class="graph-wrap"><svg role="img" aria-label="Trajectory of a projectile"></svg></div>
        <div class="stats">
          <div class="stat"><span class="stat-label">Range</span><span class="stat-value" data-k="range"></span></div>
          <div class="stat"><span class="stat-label">Max height</span><span class="stat-value" data-k="height"></span></div>
          <div class="stat"><span class="stat-label">Time of flight</span><span class="stat-value" data-k="time"></span></div>
        </div>
        <button type="button" class="btn-launch">Launch</button>`);

      const svg = root.querySelector("svg");
      const wrap = svg.parentElement;
      const button = root.querySelector(".btn-launch");
      const out = (k) => root.querySelector(`[data-k="${k}"]`);

      const angle = SS.slider(root, { id: "angle", label: "Launch angle", min: 0, max: 90, step: 1, value: 60, format: (v) => v + "°" });
      const speed = SS.slider(root, { id: "speed", label: "Launch speed", min: 1, max: 50, step: 1, value: 20, format: (v) => v + " m/s" });

      root.insertAdjacentHTML("beforeend", `
        <p class="caption">With no air resistance, <b>45° gives the longest range</b>. Angles that add up to 90° (like 30° and 60°) land in the same spot.</p>
        <p class="footnote">g = 9.8 m/s², launched from ground level, air resistance ignored.</p>`);

      let W = 800, H = 400, scale = 1;
      const PAD = { left: 40, right: 14, top: 14, bottom: 30 };
      const sx = (x) => PAD.left + x * scale;
      const sy = (y) => H - PAD.bottom - y * scale;
      let ball, clock, frame = null;

      function pathFor(v, deg) {
        const T = timeOfFlight(v, deg);
        let d = "";
        for (let i = 0; i <= 200; i++) {
          const p = position(v, deg, (i / 200) * T);
          d += (i === 0 ? "M" : "L") + sx(p.x).toFixed(2) + "," + sy(Math.max(0, p.y)).toFixed(2);
        }
        return d;
      }

      function draw() {
        stopAnimation();
        const v = Number(speed.value), deg = Number(angle.value);

        W = Math.max(280, Math.round(wrap.clientWidth || 800));
        H = Math.round(W < 600 ? W * 0.75 : W * 0.5);
        const plotW = W - PAD.left - PAD.right, plotH = H - PAD.top - PAD.bottom;

        // Zoom so every angle at this speed fits, with the same scale on both axes.
        const need = Math.max((v * v) / G, (v * v) / (2 * G) / (plotH / plotW)) * 1.05;
        const [xMax, step] = LEVELS.find(([m]) => m >= need) || LEVELS[LEVELS.length - 1];
        scale = plotW / xMax;
        const yMax = plotH / scale;

        svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
        svg.innerHTML = "";
        const fontSize = W < 500 ? 11 : 13;

        const grid = SS.svgEl("g", { stroke: COLORS.grid, "stroke-width": 1 }, svg);
        const labels = SS.svgEl("g", { fill: COLORS.axis, "font-size": fontSize, "font-family": "system-ui, sans-serif" }, svg);
        for (let x = step; x <= xMax + 1e-9; x += step) {
          SS.svgEl("line", { x1: sx(x), y1: sy(0), x2: sx(x), y2: PAD.top }, grid);
          SS.svgEl("text", { x: sx(x), y: H - 10, "text-anchor": "middle" }, labels).textContent = x;
        }
        for (let y = step; y <= yMax + 1e-9; y += step) {
          SS.svgEl("line", { x1: sx(0), y1: sy(y), x2: W - PAD.right, y2: sy(y) }, grid);
          SS.svgEl("text", { x: PAD.left - 6, y: sy(y) + fontSize * 0.35, "text-anchor": "end" }, labels).textContent = y;
        }
        SS.svgEl("text", { x: PAD.left - 6, y: H - 10, "text-anchor": "end" }, labels).textContent = "0";
        SS.svgEl("text", { x: W - PAD.right, y: PAD.top + fontSize, "text-anchor": "end", opacity: 0.7 }, labels).textContent = "metres";

        const axes = SS.svgEl("g", { stroke: COLORS.axis, "stroke-width": 1.5, opacity: 0.8 }, svg);
        SS.svgEl("line", { x1: sx(0), y1: sy(0), x2: W - PAD.right, y2: sy(0) }, axes);
        SS.svgEl("line", { x1: sx(0), y1: sy(0), x2: sx(0), y2: PAD.top }, axes);

        const curves = SS.svgEl("g", { fill: "none", "stroke-linecap": "round", "stroke-linejoin": "round" }, svg);
        if (deg !== 45) {
          SS.svgEl("path", { d: pathFor(v, 45), stroke: COLORS.ghost, "stroke-width": 2, "stroke-dasharray": "6 6" }, curves);
        }
        SS.svgEl("path", { d: pathFor(v, deg), stroke: COLORS.path, "stroke-width": 3 }, curves);

        clock = SS.svgEl("text", {
          x: sx(0) + 10, y: PAD.top + fontSize + 2, "text-anchor": "start",
          fill: "#FFFFFF", "font-size": fontSize + 2, "font-family": "system-ui, sans-serif", "font-variant-numeric": "tabular-nums",
        }, svg);
        ball = [
          SS.svgEl("circle", { cx: sx(0), cy: sy(0), r: 13, fill: COLORS.ball, opacity: 0.25 }, svg), // glow
          SS.svgEl("circle", { cx: sx(0), cy: sy(0), r: 7, fill: COLORS.ball }, svg),
        ];

        out("range").textContent = range(v, deg).toFixed(1) + " m";
        out("height").textContent = maxHeight(v, deg).toFixed(1) + " m";
        out("time").textContent = timeOfFlight(v, deg).toFixed(2) + " s";
        button.disabled = timeOfFlight(v, deg) <= 0;
      }

      function placeBall(x, y) {
        for (const c of ball) { c.setAttribute("cx", sx(x)); c.setAttribute("cy", sy(Math.max(0, y))); }
      }

      function stopAnimation() {
        if (frame) cancelAnimationFrame(frame);
        frame = null;
      }

      function launch() {
        stopAnimation();
        const v = Number(speed.value), deg = Number(angle.value);
        const T = timeOfFlight(v, deg);
        if (T <= 0) return;
        // Real time, but squeezed into 1.2–3.5 seconds so it never drags.
        const duration = Math.min(3.5, Math.max(1.2, T)) * 1000;
        const reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const start = performance.now();

        function tick(now) {
          const p = reduceMotion ? 1 : Math.min(1, (now - start) / duration);
          const t = p * T;
          const pos = position(v, deg, t);
          placeBall(p === 1 ? range(v, deg) : pos.x, p === 1 ? 0 : pos.y);
          clock.textContent = "t = " + t.toFixed(2) + " s";
          frame = p < 1 ? requestAnimationFrame(tick) : null;
        }
        frame = requestAnimationFrame(tick);
      }

      angle.addEventListener("input", draw);
      speed.addEventListener("input", draw);
      button.addEventListener("click", launch);
      draw();
      const unwatch = SS.watchWidth(wrap, draw);
      return () => { stopAnimation(); unwatch(); };
    },
  });
})();
