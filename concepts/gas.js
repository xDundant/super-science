/* Concept: Gas in a box (ideal gas law) */
(function () {
  /* ---------- Chemistry / physics ---------- */
  const R = 8.314;     // gas constant, L·kPa/(mol·K)
  const MOLES = 1;     // amount of gas, kept fixed
  // Ideal gas law P = nRT/V. T in kelvin, V in litres -> P in kPa.
  const pressure = (T, V, n = MOLES) => (n * R * T) / V;
  // Particle speed grows with √T (relative to room temperature, 300 K)
  const speedFactor = (T) => Math.sqrt(T / 300);
  const toKelvin = (celsius) => celsius + 273.15;

  if (typeof module !== "undefined" && module.exports) module.exports = { R, MOLES, pressure, speedFactor, toKelvin };
  if (typeof window === "undefined" || !window.SuperScience) return;

  /* ---------- Drawing ---------- */
  const SS = window.SuperScience;
  const COUNT = 40, V_MAX = 50, DOT = 5;

  // Particle colour: cool cyan -> warm amber -> hot red
  function heatColour(T) {
    const stops = [[100, [77, 217, 255]], [350, [255, 179, 0]], [600, [255, 77, 94]]];
    const i = T <= 350 ? 0 : 1, [t0, c0] = stops[i], [t1, c1] = stops[i + 1];
    const f = Math.max(0, Math.min(1, (T - t0) / (t1 - t0)));
    return `rgb(${c0.map((c, k) => Math.round(c + (c1[k] - c) * f)).join(",")})`;
  }

  SS.register({
    id: "gas",
    title: "Why does a balloon shrink in the cold?",
    description: "Heat or squeeze a box of bouncing particles and watch the pressure change.",
    tag: "Chemistry",

    render(root) {
      root.insertAdjacentHTML("beforeend", `
        <div class="graph-wrap"><svg role="img" aria-label="Gas particles bouncing around inside a box with a movable wall"></svg></div>
        <p class="note" aria-live="off"></p>`);
      const svg = root.querySelector("svg");
      const note = root.querySelector(".note");
      const set = SS.stats(root, [
        { key: "p", label: "Pressure P = nRT/V" },
        { key: "t", label: "Temperature", cls: "stat-white" },
        { key: "v", label: "Volume", cls: "stat-cyan" },
      ]);
      const sT = SS.slider(root, { id: "gas-t", label: "Temperature", min: 100, max: 600, step: 10, value: 300, format: (v) => `${v} K (${Math.round(v - 273.15)} °C)` });
      const sV = SS.slider(root, { id: "gas-v", label: "Box volume", min: 10, max: 50, step: 1, value: 30, format: (v) => v + " L", accent: "cyan" });
      root.insertAdjacentHTML("beforeend", `
        <p class="caption">Pressure is the push of particles <b>hitting the walls</b>. Heat the gas and the particles move faster, hitting harder and more often. Squeeze it smaller and they reach the walls more often too. Both raise the pressure: <b>P = nRT/V</b> (here n = 1 mol, with T in kelvin). Cold air in a balloon pushes less, so it shrinks.</p>`);

      let W = 400, H = 280, box = { x: 0, y: 0, w: 0, h: 0 }, dots = [], parts = [], piston = null, hits = [], clock = 0;

      function setup() {
        const f = SS.fit(svg, 0.7, 0.42);
        W = f.W; H = f.H;
        box.x = 12; box.y = 12; box.h = H - 24;
        if (!parts.length) {
          for (let i = 0; i < COUNT; i++) {
            const a = Math.random() * Math.PI * 2, s = 0.6 + Math.random() * 0.8;
            parts.push({ x: Math.random(), y: Math.random(), vx: Math.cos(a) * s, vy: Math.sin(a) * s });
          }
        }
        SS.svgEl("rect", { class: "gas-box", x: box.x, y: box.y, width: 10, height: box.h, fill: "rgba(255,255,255,0.03)", stroke: "#FFFFFF", "stroke-width": 3, rx: 4 }, svg);
        piston = SS.svgEl("rect", { x: 0, y: box.y - 6, width: 10, height: box.h + 12, rx: 3, fill: "#4DD9FF" }, svg);
        // All particles are drawn as ONE path (one circle shape per particle), so each frame
        // updates a single attribute instead of 80 separate positions.
        dots = SS.svgEl("path", {}, svg);
        layout();
      }

      function layout() {
        const V = Number(sV.value);
        box.w = ((W - 44) * V) / V_MAX;
        svg.querySelector(".gas-box").setAttribute("width", box.w);
        piston.setAttribute("x", box.x + box.w);
        const T = Number(sT.value);
        set("p", pressure(T, V).toFixed(1) + " kPa");
        set("t", `${T} K`);
        set("v", V + " L");
      }

      // Fixed 1/240 s physics steps. Each particle remembers where it was one step ago
      // (ox, oy) so drawing can sit smoothly in between.
      let lastColour = "", lastNote = "";
      const stop = SS.physicsLoop({
        step(h) {
          const T = Number(sT.value);
          // pixels per second: about a third of the picture width at 300 K
          const speed = W * 0.35 * speedFactor(T) * h;
          clock += h;
          const maxX = box.w - DOT, maxY = box.h - DOT;
          for (const p of parts) {
            // positions are stored in pixels inside the box
            if (p.px === undefined) { p.px = DOT + p.x * (box.w - 2 * DOT); p.py = DOT + p.y * (box.h - 2 * DOT); }
            p.ox = p.px; p.oy = p.py;
            p.px += p.vx * speed; p.py += p.vy * speed;
            if (p.px < DOT) { p.px = DOT; p.vx = Math.abs(p.vx); hits.push(clock); }
            if (p.px > maxX) { p.px = maxX; p.vx = -Math.abs(p.vx); hits.push(clock); }
            if (p.py < DOT) { p.py = DOT; p.vy = Math.abs(p.vy); hits.push(clock); }
            if (p.py > maxY) { p.py = maxY; p.vy = -Math.abs(p.vy); hits.push(clock); }
          }
          while (hits.length && hits[0] < clock - 2) hits.shift();
        },
        render(alpha) {
          const colour = heatColour(Number(sT.value));
          if (colour !== lastColour) { lastColour = colour; dots.setAttribute("fill", colour); }
          let d = "";
          for (const p of parts) {
            if (p.ox === undefined) continue;
            const x = box.x + SS.lerp(p.ox, p.px, alpha), y = box.y + SS.lerp(p.oy, p.py, alpha);
            // a circle of radius DOT drawn as two half-circle arcs
            d += `M${(x - DOT).toFixed(1)},${y.toFixed(1)}a${DOT},${DOT} 0 1,0 ${2 * DOT},0a${DOT},${DOT} 0 1,0 ${-2 * DOT},0`;
          }
          dots.setAttribute("d", d);
          const text = clock > 2 ? `Wall hits per second: about ${Math.round(hits.length / 2)}` : "";
          if (text !== lastNote) { lastNote = text; note.textContent = text; }
        },
      });

      // Slider drags: update at most once per frame
      const onSlide = SS.perFrame(layout);
      sT.addEventListener("input", onSlide);
      sV.addEventListener("input", onSlide);
      setup();
      const unwatch = SS.watchWidth(svg.parentElement, () => {
        parts.forEach((p) => { p.px = p.ox = undefined; p.x = Math.random(); p.y = Math.random(); });
        lastColour = "";
        setup();
      });
      return () => { stop(); onSlide.cancel(); unwatch(); };
    },
  });
})();
