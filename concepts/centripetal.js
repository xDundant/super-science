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

      // State now and one physics step ago (prev*), so drawing can sit smoothly in between.
      let angle = 0, prevAngle = 0, released = false, pos = null, prevPos = null, vel = null;
      let W = 400, scale = 1, c = 200, el = null;
      const sx = (x) => c + x * scale, sy = (y) => c - y * scale;
      const shown = {};
      const setOnce = (key, text) => { if (shown[key] !== text) { shown[key] = text; set(key, text); } };
      const put = (node, attrs) => { for (const k in attrs) node.setAttribute(k, typeof attrs[k] === "number" ? attrs[k].toFixed(1) : attrs[k]); };

      // Grid plus all moving parts, created once (and again only on resize).
      function drawStatic() {
        const f = SS.fit(svg, 1, 1);
        W = f.W; c = W / 2; scale = (W / 2 - 10) / VIEW;
        const grid = SS.svgEl("g", { stroke: "rgba(77,217,255,0.10)", "stroke-width": 1 }, svg);
        for (let m = -12; m <= 12; m += 2) {
          SS.svgEl("line", { x1: sx(m), y1: 0, x2: sx(m), y2: W }, grid);
          SS.svgEl("line", { x1: 0, y1: sy(m), x2: W, y2: sy(m) }, grid);
        }
        el = {
          path: SS.svgEl("circle", { cx: c, cy: c, fill: "none", stroke: "rgba(255,255,255,0.18)", "stroke-width": 1.5, "stroke-dasharray": "5 6" }, svg),
          centre: SS.svgEl("circle", { cx: c, cy: c, r: 5, fill: "#4DD9FF" }, svg),
          string: SS.svgEl("line", { x1: c, y1: c, stroke: "#FFFFFF", "stroke-width": 2 }, svg),
          force: SS.arrow(svg, 0, 0, 0, 0, "#FF4D5E", 3.5),
          velocity: SS.arrow(svg, 0, 0, 0, 0, "#4DD9FF", 3),
          ball: SS.svgEl("circle", { fill: "#FFB300", stroke: "#000", "stroke-width": 2 }, svg),
        };
      }

      function render(alpha) {
        const v = Number(sV.value), r = Number(sR.value), m = Number(sM.value);
        const ballR = 6 + m * 2;
        put(el.path, { r: r * scale });
        put(el.ball, { r: ballR });
        let bx, by, ux, uy;
        if (!released) {
          const a = SS.lerp(prevAngle, angle, alpha);
          bx = r * Math.cos(a); by = r * Math.sin(a);
          el.string.style.display = "";
          put(el.string, { x2: sx(bx), y2: sy(by) });
          // force arrow towards the centre (longer for bigger force)
          const F = force(m, v, r);
          const len = Math.min(r * scale - ballR, 14 + 70 * Math.sqrt(F / 2000));
          el.force.style.visibility = "";
          SS.setArrow(el.force, sx(bx), sy(by), sx(bx) - Math.cos(a) * len, sy(by) + Math.sin(a) * len);
          const u = releaseVelocity(a, 1); ux = u.x; uy = u.y;
        } else {
          bx = SS.lerp(prevPos.x, pos.x, alpha); by = SS.lerp(prevPos.y, pos.y, alpha);
          el.string.style.display = "none";
          el.force.style.visibility = "hidden";
          const s2 = Math.hypot(vel.x, vel.y); ux = vel.x / s2; uy = vel.y / s2;
        }
        const vl = 16 + v * 3;
        SS.setArrow(el.velocity, sx(bx), sy(by), sx(bx) + ux * vl, sy(by) - uy * vl);
        put(el.ball, { cx: sx(bx), cy: sy(by) });

        setOnce("f", force(m, v, r).toFixed(1) + " N");
        setOnce("a", acceleration(v, r).toFixed(1) + " m/s²");
        setOnce("lap", lapTime(v, r).toFixed(2) + " s");
      }

      // Fixed 1/240 s physics steps; drawing interpolates between them.
      const stop = SS.physicsLoop({
        step(h) {
          const v = Number(sV.value), r = Number(sR.value);
          if (!released) {
            prevAngle = angle;
            angle += (v / r) * h;
            // keep the numbers small, shifting both together so the in-between drawing is unaffected
            if (angle > 2 * Math.PI) { angle -= 2 * Math.PI; prevAngle -= 2 * Math.PI; }
          } else {
            prevPos = { x: pos.x, y: pos.y };
            if (Math.abs(pos.x) < VIEW + 2 && Math.abs(pos.y) < VIEW + 2) { pos.x += vel.x * h; pos.y += vel.y * h; }
          }
        },
        render,
      });

      btnRelease.addEventListener("click", () => {
        if (released) return;
        const v = Number(sV.value), r = Number(sR.value);
        released = true;
        pos = { x: r * Math.cos(angle), y: r * Math.sin(angle) };
        prevPos = { x: pos.x, y: pos.y };
        vel = releaseVelocity(angle, v);
        btnRelease.disabled = true;
        note.textContent = "No string, no force towards the centre: the ball carries straight on.";
      });
      root.querySelector('[data-act="reset"]').addEventListener("click", () => {
        released = false; prevAngle = angle; btnRelease.disabled = false; note.textContent = "";
      });

      drawStatic();
      render(1);
      const unwatch = SS.watchWidth(svg.parentElement, () => { drawStatic(); render(1); });
      return () => { stop(); unwatch(); };
    },
  });
})();
