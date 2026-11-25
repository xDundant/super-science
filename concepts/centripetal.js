/* Concept: Centripetal force (ball on a string, seen from above) */
(function () {
  /* ---------- Physics ---------- */
  const force = (m, v, r) => (m * v * v) / r;          // F = mv²/r (N)
  const acceleration = (v, r) => (v * v) / r;          // a = v²/r (m/s²)
  const lapTime = (v, r) => (2 * Math.PI * r) / v;     // time for one circle (s)
  // Velocity just as you let go at angle `a` (moving anticlockwise): along the tangent.
  const releaseVelocity = (a, v) => ({ x: -v * Math.sin(a), y: v * Math.cos(a) });

  if (typeof module !== "undefined" && module.exports) module.exports = { force, acceleration, lapTime, releaseVelocity };
  if (typeof window === "undefined" || !window.SuperScience) return;

  /* ---------- Drawing ---------- */
  const SS = window.SuperScience;
  const VIEW = 12; // metres from the centre to the edge of the picture

  SS.register({
    id: "centripetal",
    title: "What happens if you let go of the string?",
    description: "Swing a ball in a circle, feel the pull to the centre, then release it.",
    tag: "Physics",

    render(root) {
      root.insertAdjacentHTML("beforeend", `
        <div class="legend" aria-hidden="true">
          <span class="legend-item"><i class="swatch swatch-red"></i>force (to centre)</span>
          <span class="legend-item"><i class="swatch swatch-cyan"></i>velocity</span>
        </div>
        <div class="graph-wrap graph-wrap--square"><svg role="img" aria-label="Top view of a ball swinging in a circle on a string"></svg></div>
        <p class="note" aria-live="polite"></p>`);
      const svg = root.querySelector("svg");
      const note = root.querySelector(".note");
      const set = SS.stats(root, [
        { key: "f", label: "Force F = mv²/r" },
        { key: "a", label: "Acceleration v²/r", cls: "stat-white" },
        { key: "lap", label: "Time per lap", cls: "stat-cyan" },
      ]);
      const sV = SS.slider(root, { id: "cf-v", label: "Speed", min: 1, max: 20, step: 1, value: 6, format: (v) => v + " m/s" });
      const sR = SS.slider(root, { id: "cf-r", label: "Radius", min: 1, max: 10, step: 0.5, value: 6, format: (v) => v + " m" });
      const sM = SS.slider(root, { id: "cf-m", label: "Mass", min: 1, max: 5, step: 0.5, value: 2, format: (v) => v + " kg" });
      root.insertAdjacentHTML("beforeend", `
        <div class="btn-row">
          <button type="button" class="btn" data-act="release">Release</button>
          <button type="button" class="btn-secondary" data-act="reset">Reset</button>
        </div>
        <p class="caption">The string pulls the ball <b>towards the centre</b>. That force, F = mv²/r, keeps bending its path into a circle. Let go and there's no force left, so the ball flies off in a <b>straight line along the tangent</b> (Newton's 1st law).</p>`);
      const btnRelease = root.querySelector('[data-act="release"]');

      let angle = 0, released = false, pos = null, vel = null;
      let W = 400, scale = 1, c = 200, layer = null;
      const sx = (x) => c + x * scale, sy = (y) => c - y * scale;

      function drawStatic() {
        const f = SS.fit(svg, 1, 1);
        W = f.W; c = W / 2; scale = (W / 2 - 10) / VIEW;
        const grid = SS.svgEl("g", { stroke: "rgba(77,217,255,0.10)", "stroke-width": 1 }, svg);
        for (let m = -12; m <= 12; m += 2) {
          SS.svgEl("line", { x1: sx(m), y1: 0, x2: sx(m), y2: W }, grid);
          SS.svgEl("line", { x1: 0, y1: sy(m), x2: W, y2: sy(m) }, grid);
        }
        layer = SS.svgEl("g", {}, svg);
      }

      function frame() {
        const v = Number(sV.value), r = Number(sR.value), m = Number(sM.value);
        layer.innerHTML = "";
        const ballR = 6 + m * 2;
        // the circular path
        SS.svgEl("circle", { cx: c, cy: c, r: r * scale, fill: "none", stroke: "rgba(255,255,255,0.18)", "stroke-width": 1.5, "stroke-dasharray": "5 6" }, layer);
        SS.svgEl("circle", { cx: c, cy: c, r: 5, fill: "#4DD9FF" }, layer);
        let bx, by;
        if (!released) {
          bx = r * Math.cos(angle); by = r * Math.sin(angle);
          SS.svgEl("line", { x1: c, y1: c, x2: sx(bx), y2: sy(by), stroke: "#FFFFFF", "stroke-width": 2 }, layer);
          // force arrow towards the centre (longer for bigger force)
          const F = force(m, v, r);
          const len = Math.min(r * scale - ballR, 14 + 70 * Math.sqrt(F / 2000));
          SS.arrow(layer, sx(bx), sy(by), sx(bx) - Math.cos(angle) * len, sy(by) + Math.sin(angle) * len, "#FF4D5E", 3.5);
          const u = releaseVelocity(angle, 1);
          const vl = 16 + v * 3;
          SS.arrow(layer, sx(bx), sy(by), sx(bx) + u.x * vl, sy(by) - u.y * vl, "#4DD9FF", 3);
        } else {
          bx = pos.x; by = pos.y;
          const s = Math.hypot(vel.x, vel.y), vl = 16 + s * 3;
          SS.arrow(layer, sx(bx), sy(by), sx(bx) + (vel.x / s) * vl, sy(by) - (vel.y / s) * vl, "#4DD9FF", 3);
        }
        SS.svgEl("circle", { cx: sx(bx), cy: sy(by), r: ballR, fill: "#FFB300", stroke: "#000", "stroke-width": 2 }, layer);

        set("f", force(m, v, r).toFixed(1) + " N");
        set("a", acceleration(v, r).toFixed(1) + " m/s²");
        set("lap", lapTime(v, r).toFixed(2) + " s");
      }

      const stop = SS.loop((dt) => {
        const v = Number(sV.value), r = Number(sR.value);
        if (!released) angle = (angle + (v / r) * dt) % (2 * Math.PI);
        else if (Math.abs(pos.x) < VIEW + 2 && Math.abs(pos.y) < VIEW + 2) { pos.x += vel.x * dt; pos.y += vel.y * dt; }
        frame();
      });

      btnRelease.addEventListener("click", () => {
        if (released) return;
        const v = Number(sV.value), r = Number(sR.value);
        released = true;
        pos = { x: r * Math.cos(angle), y: r * Math.sin(angle) };
        vel = releaseVelocity(angle, v);
        btnRelease.disabled = true;
        note.textContent = "No string, no force towards the centre: the ball carries straight on.";
      });
      root.querySelector('[data-act="reset"]').addEventListener("click", () => {
        released = false; btnRelease.disabled = false; note.textContent = "";
      });

      drawStatic();
      frame();
      const unwatch = SS.watchWidth(svg.parentElement, () => { drawStatic(); frame(); });
      return () => { stop(); unwatch(); };
    },
  });
})();
