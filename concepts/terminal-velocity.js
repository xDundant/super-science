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
  const H_STEP = 1 / 240; // fixed physics step, in simulated seconds

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

      // prevT/prevV = state one physics step ago, for drawing in between steps.
      let t = 0, v = 0, prevT = 0, prevV = 0, k = 0, chute = false, running = false, stopLoop = null;
      let a = null, pathD = "", lastPointT = 0, el = null, font = 12;
      const txt = { w: root.querySelector('[data-f="w"]'), d: root.querySelector('[data-f="d"]') };
      let shown = {}; // last text written to each stat (only touch the page when it changes)
      const setOnce = (key, text) => { if (shown[key] !== text) { shown[key] = text; set(key, text); } };
      const setTxt = (node, text) => { if (node.textContent !== text) node.textContent = text; };

      function reset() {
        if (stopLoop) { stopLoop(); stopLoop = null; }
        t = v = prevT = prevV = 0; k = Number(sK.value); chute = false; running = false;
        btnJump.disabled = false; btnChute.disabled = true;
        note.textContent = "Press Jump to start the fall.";
        drawStatic();
        drawDynamic(1);
      }

      // Axes, grid and the terminal-speed line: drawn once per run (they don't move).
      function drawStatic() {
        const m = Number(sM.value), k0 = Number(sK.value);
        const vt0 = terminalSpeed(m, k0);
        const yMax = Math.ceil((vt0 * 1.15) / 10) * 10;
        const step10 = yMax > 80 ? 20 : 10;
        const ticks = []; for (let y = 0; y <= yMax; y += step10) ticks.push(y);
        const f = SS.fit(svg, 0.8, 0.5);
        font = f.font;
        a = SS.axes(svg, {
          W: f.W, H: f.H, font, id: "terminal", x: [0, T_MAX], y: [0, yMax], xTicks: [0, 5, 10, 15, 20, 25, 30], yTicks: ticks,
          xFmt: (x) => x + " s", yLabel: "speed (m/s)",
        });
        const g = SS.svgEl("g", { "clip-path": a.clip }, svg);
        dashed(g, vt0, "rgba(255,255,255,0.7)", `terminal ${vt0.toFixed(1)} m/s`);
        el = {
          g,
          path: SS.svgEl("path", { fill: "none", stroke: "#FFB300", "stroke-width": 3, "stroke-linejoin": "round" }, g),
          dot: SS.svgEl("circle", { r: 6, fill: "#FFB300", stroke: "#000", "stroke-width": 2 }, svg),
        };
        if (chute) dashed(g, terminalSpeed(m, k), "#4DD9FF", `with parachute ${terminalSpeed(m, k).toFixed(1)} m/s`);
        // The curve so far, rebuilt only here (e.g. after a resize); while falling it is extended.
        pathD = `M${a.sx(0).toFixed(1)},${a.sy(0).toFixed(1)}`;
        lastPointT = 0;
        if (history.length) history.forEach(([ht, hv]) => { pathD += `L${a.sx(ht).toFixed(1)},${a.sy(hv).toFixed(1)}`; lastPointT = ht; });
      }
      let history = []; // [t, v] every 0.05 s, so a resize can redraw the curve

      function dashed(g, speed, colour, label) {
        SS.svgEl("line", { x1: a.sx(0), y1: a.sy(speed), x2: a.sx(T_MAX), y2: a.sy(speed), stroke: colour, "stroke-width": 2, "stroke-dasharray": "7 6" }, g);
        SS.svgEl("text", { x: a.sx(T_MAX) - 4, y: a.sy(speed) - 6, "text-anchor": "end", fill: colour, "font-size": font, "font-family": "system-ui, sans-serif" }, svg).textContent = label;
      }

      // Every frame: extend the curve, move the dot, update bars and numbers.
      function drawDynamic(alpha) {
        const m = Number(sM.value);
        const tt = SS.lerp(prevT, t, alpha), vv = SS.lerp(prevV, v, alpha);
        const x = a.sx(tt).toFixed(1), y = a.sy(vv).toFixed(1);
        el.path.setAttribute("d", pathD + `L${x},${y}`);
        el.dot.setAttribute("cx", x);
        el.dot.setAttribute("cy", y);

        // Forces: weight (down) vs drag (up), on the same scale (transform = no page re-layout)
        const weight = m * G, drag = k * vv * vv, top = Math.max(weight, drag) * 1.05;
        fillW.style.transform = `scaleX(${(weight / top).toFixed(4)})`;
        fillD.style.transform = `scaleX(${(drag / top).toFixed(4)})`;
        setTxt(txt.w, Math.round(weight) + " N");
        setTxt(txt.d, Math.round(drag) + " N");
        setOnce("v", vv.toFixed(1) + " m/s");
        setOnce("vt", terminalSpeed(m, running || chute ? k : Number(sK.value)).toFixed(1) + " m/s");
        setOnce("t", tt.toFixed(1) + " s");
      }

      function jump() {
        if (running) return;
        running = true; btnJump.disabled = true; btnChute.disabled = false;
        note.textContent = "Falling…";
        const m = Number(sM.value);
        // Each fixed step is 1/240 s of falling; SIM_SPEED steps' worth run per real 1/240 s.
        stopLoop = SS.physicsLoop({
          h: H_STEP / SIM_SPEED,
          step() {
            if (t >= T_MAX) return;
            prevT = t; prevV = v;
            v = step(v, m, k, H_STEP);
            t = Math.min(T_MAX, t + H_STEP);
            if (t - lastPointT >= 0.05 - 1e-9) {
              lastPointT = t;
              history.push([t, v]);
              pathD += `L${a.sx(t).toFixed(1)},${a.sy(v).toFixed(1)}`;
            }
          },
          render(alpha) {
            drawDynamic(t >= T_MAX ? 1 : alpha);
            if (t >= T_MAX) {
              running = false; btnChute.disabled = true;
              note.textContent = "Landed! (Well, the graph ran out.) Press Reset to go again.";
              stopLoop = null;
              return false;
            }
          },
        });
      }

      btnJump.addEventListener("click", jump);
      btnChute.addEventListener("click", () => {
        if (chute || !running) return;
        chute = true; k *= PARACHUTE; btnChute.disabled = true;
        dashed(el.g, terminalSpeed(Number(sM.value), k), "#4DD9FF", `with parachute ${terminalSpeed(Number(sM.value), k).toFixed(1)} m/s`);
        note.textContent = "Parachute open! Drag is now much bigger than weight, so the skydiver slows down.";
      });
      const fullReset = () => { history = []; shown = {}; reset(); };
      root.querySelector('[data-act="reset"]').addEventListener("click", fullReset);
      // Slider drags: reset at most once per frame
      const onSlide = SS.perFrame(fullReset);
      sM.addEventListener("input", onSlide);
      sK.addEventListener("input", onSlide);

      fullReset();
      const unwatch = SS.watchWidth(svg.parentElement, () => { shown = {}; drawStatic(); drawDynamic(1); });
      return () => { if (stopLoop) stopLoop(); onSlide.cancel(); unwatch(); };
    },
  });
})();
