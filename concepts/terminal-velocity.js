/* Concept: Terminal velocity (skydiver with air resistance) */
(function () {
  /* ---------- Physics ---------- */
  const G = 9.8;               // m/s²
  const PARACHUTE = 10;        // opening the parachute multiplies k by this
  const terminalSpeed = (m, k) => Math.sqrt((m * G) / k);   // where mg = kv²
  // Acceleration while falling: gravity down, drag kv² up (taking down as positive)
  const accel = (v, m, k) => G - (k / m) * v * Math.abs(v);

  // One small time step (RK4: a standard accurate way to step a simulation forward)
  function step(v, m, k, dt) {
    const a1 = accel(v, m, k);
    const a2 = accel(v + (a1 * dt) / 2, m, k);
    const a3 = accel(v + (a2 * dt) / 2, m, k);
    const a4 = accel(v + a3 * dt, m, k);
    return v + ((a1 + 2 * a2 + 2 * a3 + a4) * dt) / 6;
  }

  // Simulate a whole fall. Returns [{ t, v }] every `every` seconds.
  function simulate({ m, k, tEnd = 30, dt = 0.01, parachuteAt = null, every = 0.1 }) {
    const out = [{ t: 0, v: 0 }];
    let v = 0, kNow = k, t = 0, next = every;
    const steps = Math.round(tEnd / dt);
    for (let i = 1; i <= steps; i++) {
      if (parachuteAt !== null && t >= parachuteAt && kNow === k) kNow = k * PARACHUTE;
      v = step(v, m, kNow, dt);
      t = i * dt;
      if (t >= next - 1e-9) { out.push({ t, v }); next += every; }
    }
    return out;
  }

  if (typeof module !== "undefined" && module.exports) module.exports = { G, PARACHUTE, terminalSpeed, accel, step, simulate };
  if (typeof window === "undefined" || !window.SuperScience) return;

  /* ---------- Drawing ---------- */
  const SS = window.SuperScience;
  const T_MAX = 30;      // seconds shown on the graph
  const SIM_SPEED = 2;   // simulated seconds per real second
  const DT = 0.01;

  SS.register({
    id: "terminal-velocity",
    title: "Why don't skydivers keep speeding up?",
    description: "Gravity pulls, air pushes back harder and harder, until they balance.",
    tag: "Physics",

    render(root) {
      root.insertAdjacentHTML("beforeend", `
        <div class="legend" aria-hidden="true">
          <span class="legend-item"><i class="swatch swatch-amber"></i>speed</span>
          <span class="legend-item"><i class="swatch swatch-dashed"></i>terminal speed</span>
        </div>
        <div class="graph-wrap"><svg role="img" aria-label="Speed-time graph of a falling skydiver"></svg></div>
        <div class="force-bars" aria-hidden="true">
          <div class="force-bar"><span class="fb-label">Weight ↓</span><span class="fb-track"><span class="fb-fill fb-weight"></span></span><span class="fb-val" data-f="w"></span></div>
          <div class="force-bar"><span class="fb-label">Drag ↑</span><span class="fb-track"><span class="fb-fill fb-drag"></span></span><span class="fb-val" data-f="d"></span></div>
        </div>
        <p class="note" aria-live="polite"></p>`);
      const fillW = root.querySelector(".fb-weight"), fillD = root.querySelector(".fb-drag");
      const svg = root.querySelector("svg");
      const note = root.querySelector(".note");
      const set = SS.stats(root, [
        { key: "v", label: "Speed now" },
        { key: "vt", label: "Terminal speed √(mg/k)", cls: "stat-white" },
        { key: "t", label: "Time falling", cls: "stat-cyan" },
      ]);
      const sM = SS.slider(root, { id: "tv-m", label: "Mass", min: 50, max: 120, step: 1, value: 80, format: (v) => v + " kg" });
      const sK = SS.slider(root, { id: "tv-k", label: "Drag coefficient k", min: 0.1, max: 0.6, step: 0.01, value: 0.25, format: (v) => v.toFixed(2) + " kg/m" });
      root.insertAdjacentHTML("beforeend", `
        <div class="btn-row">
          <button type="button" class="btn" data-act="jump">Jump</button>
          <button type="button" class="btn-secondary" data-act="chute" disabled>Open parachute</button>
          <button type="button" class="btn-secondary" data-act="reset">Reset</button>
        </div>
        <p class="caption">Air resistance grows with speed (drag = kv²). The skydiver speeds up until drag equals their weight (kv² = mg). Then there's no overall force, so the speed stops rising: the <b>terminal velocity</b> √(mg/k). A parachute makes k about 10× bigger, so the terminal speed drops a lot.</p>`);
      const btnJump = root.querySelector('[data-act="jump"]');
      const btnChute = root.querySelector('[data-act="chute"]');

      let t = 0, v = 0, k = 0, chute = false, running = false, points = [], stopLoop = null;

      function reset() {
        if (stopLoop) { stopLoop(); stopLoop = null; }
        t = 0; v = 0; k = Number(sK.value); chute = false; running = false; points = [{ t: 0, v: 0 }];
        btnJump.disabled = false; btnChute.disabled = true;
        note.textContent = "Press Jump to start the fall.";
        draw();
      }

      function draw() {
        const m = Number(sM.value), k0 = Number(sK.value);
        const vt0 = terminalSpeed(m, k0);
        const yMax = Math.ceil((vt0 * 1.15) / 10) * 10;
        const step10 = yMax > 80 ? 20 : 10;
        const ticks = []; for (let y = 0; y <= yMax; y += step10) ticks.push(y);
        const { W, H, font } = SS.fit(svg, 0.8, 0.5);
        const a = SS.axes(svg, {
          W, H, font, id: "terminal", x: [0, T_MAX], y: [0, yMax], xTicks: [0, 5, 10, 15, 20, 25, 30], yTicks: ticks,
          xFmt: (x) => x + " s", yLabel: "speed (m/s)",
        });
        const g = SS.svgEl("g", { "clip-path": a.clip }, svg);
        const dashed = (speed, colour, label) => {
          SS.svgEl("line", { x1: a.sx(0), y1: a.sy(speed), x2: a.sx(T_MAX), y2: a.sy(speed), stroke: colour, "stroke-width": 2, "stroke-dasharray": "7 6" }, g);
          SS.svgEl("text", { x: a.sx(T_MAX) - 4, y: a.sy(speed) - 6, "text-anchor": "end", fill: colour, "font-size": font, "font-family": "system-ui, sans-serif" }, svg).textContent = label;
        };
        dashed(vt0, "rgba(255,255,255,0.7)", `terminal ${vt0.toFixed(1)} m/s`);
        if (chute) dashed(terminalSpeed(m, k), "#4DD9FF", `with parachute ${terminalSpeed(m, k).toFixed(1)} m/s`);
        SS.svgEl("path", { d: SS.pathD(points.map((p) => [a.sx(p.t), a.sy(p.v)])), fill: "none", stroke: "#FFB300", "stroke-width": 3, "stroke-linejoin": "round" }, g);
        SS.svgEl("circle", { cx: a.sx(t), cy: a.sy(v), r: 6, fill: "#FFB300", stroke: "#000", "stroke-width": 2 }, svg);

        // Forces: weight (down) vs drag (up), on the same scale
        const weight = m * G, drag = k * v * v, top = Math.max(weight, drag) * 1.05;
        fillW.style.width = (weight / top) * 100 + "%";
        fillD.style.width = (drag / top) * 100 + "%";
        root.querySelector('[data-f="w"]').textContent = Math.round(weight) + " N";
        root.querySelector('[data-f="d"]').textContent = Math.round(drag) + " N";

        set("v", v.toFixed(1) + " m/s");
        set("vt", terminalSpeed(m, running || chute ? k : k0).toFixed(1) + " m/s");
        set("t", t.toFixed(1) + " s");
      }

      function jump() {
        if (running) return;
        running = true; btnJump.disabled = true; btnChute.disabled = false;
        note.textContent = "Falling…";
        const m = Number(sM.value);
        stopLoop = SS.loop((dtReal) => {
          const target = Math.min(T_MAX, t + dtReal * SIM_SPEED);
          while (t < target - 1e-9) {
            v = step(v, m, k, DT);
            t += DT;
            if (t - points[points.length - 1].t >= 0.1) points.push({ t, v });
          }
          draw();
          if (t >= T_MAX - 1e-9) { running = false; btnChute.disabled = true; note.textContent = "Landed! (Well, the graph ran out.) Press Reset to go again."; return false; }
        });
      }

      btnJump.addEventListener("click", jump);
      btnChute.addEventListener("click", () => {
        if (chute || !running) return;
        chute = true; k *= PARACHUTE; btnChute.disabled = true;
        note.textContent = "Parachute open! Drag is now much bigger than weight, so the skydiver slows down.";
      });
      root.querySelector('[data-act="reset"]').addEventListener("click", reset);
      sM.addEventListener("input", reset);
      sK.addEventListener("input", reset);

      reset();
      const unwatch = SS.watchWidth(svg.parentElement, draw);
      return () => { if (stopLoop) stopLoop(); unwatch(); };
    },
  });
})();
