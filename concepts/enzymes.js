/* Concept: Enzyme activity vs temperature and pH (a simplified model) */
(function () {
  /* ---------- Biology model ---------- */
  const ENZYMES = {
    amylase: { name: "Amylase", T: 37, pH: 7, where: "saliva and small intestine", job: "breaks starch into sugars" },
    pepsin: { name: "Pepsin", T: 37, pH: 2, where: "the stomach", job: "breaks proteins into smaller pieces" },
  };
  const DENATURE_ABOVE = 13;   // permanently denatured at optimum + 13 °C (50 °C here)
  const PH_WIDTH = 2;          // how far from the optimum pH activity falls to ~37%

  // Below the optimum: activity doubles every 10 °C (slow climb).
  // Above it: falls away sharply as the enzyme loses its shape.
  function tempFactor(T, Topt) {
    return T <= Topt ? Math.pow(2, (T - Topt) / 10) : Math.exp(-Math.pow((T - Topt) / 5, 2));
  }
  const pHFactor = (pH, pHopt) => Math.exp(-Math.pow((pH - pHopt) / PH_WIDTH, 2));
  const denatureTemp = (id) => ENZYMES[id].T + DENATURE_ABOVE;

  // Relative activity, 0 to 100 %
  function activity(T, pH, id, denatured = false) {
    if (denatured || T >= denatureTemp(id)) return 0;
    const e = ENZYMES[id];
    return 100 * tempFactor(T, e.T) * pHFactor(pH, e.pH);
  }

  // Take one sample through a list of temperatures (in order). Once it has been
  // too hot it stays denatured. Returns the activity at the last temperature.
  function runSample(temperatures, pH, id) {
    let denatured = false;
    temperatures.forEach((T) => { if (T >= denatureTemp(id)) denatured = true; });
    return activity(temperatures[temperatures.length - 1], pH, id, denatured);
  }

  if (typeof module !== "undefined" && module.exports) {
    module.exports = { ENZYMES, DENATURE_ABOVE, tempFactor, pHFactor, denatureTemp, activity, runSample };
  }
  if (typeof window === "undefined" || !window.SuperScience) return;

  /* ---------- Drawing ---------- */
  const SS = window.SuperScience;

  SS.register({
    id: "enzymes",
    title: "What happens when you cook an enzyme?",
    description: "Change temperature and pH to see when an enzyme works best, or breaks for good.",
    tag: "Biology",

    render(root) {
      const sel = SS.select(root, { id: "enz-type", label: "Enzyme", options: [["amylase", "Amylase (saliva, best at pH 7)"], ["pepsin", "Pepsin (stomach, best at pH 2)"]], value: "amylase" });
      root.insertAdjacentHTML("beforeend", `
        <div class="graph-pair">
          <div><p class="graph-title">Activity vs temperature</p><div class="graph-wrap"><svg class="g-temp" role="img" aria-label="Enzyme activity against temperature"></svg></div></div>
          <div><p class="graph-title">Activity vs pH</p><div class="graph-wrap"><svg class="g-ph" role="img" aria-label="Enzyme activity against pH"></svg></div></div>
        </div>
        <p class="warn" aria-live="polite"></p>`);
      const gT = root.querySelector("svg.g-temp"), gP = root.querySelector("svg.g-ph");
      const warn = root.querySelector(".warn");
      const set = SS.stats(root, [
        { key: "act", label: "Relative activity" },
        { key: "opt", label: "Best conditions", cls: "stat-white stat-wrap" },
        { key: "state", label: "Enzyme shape", cls: "stat-cyan" },
      ]);
      const sT = SS.slider(root, { id: "enz-t", label: "Temperature", min: 0, max: 70, step: 1, value: 37, format: (v) => v + " °C" });
      const sP = SS.slider(root, { id: "enz-ph", label: "pH", min: 0, max: 14, step: 0.1, value: 7, format: (v) => v.toFixed(1), accent: "cyan" });
      root.insertAdjacentHTML("beforeend", `
        <div class="btn-row"><button type="button" class="btn-secondary" data-act="fresh">Fresh enzyme sample</button></div>
        <p class="caption">Enzymes speed up reactions. Warmer means faster-moving molecules, so activity <b>climbs slowly</b> up to the optimum (body temperature, 37 °C). Past that, heat shakes the enzyme <b>out of shape</b> so its active site no longer fits, and activity crashes. Heat it too far and the change is <b>permanent</b> (denatured): cooling it down won't fix it. Each enzyme also has a favourite pH. <i>The curves are a simplified model.</i></p>`);

      let denatured = false;

      function curve(svg, id, xs, fn, x, xRange, xTicks, xFmt, shade) {
        const { W, H, font } = SS.fit(svg, 0.62, 0.62);
        const a = SS.axes(svg, { W, H, font, id, x: xRange, y: [0, 105], xTicks, yTicks: [0, 50, 100], xFmt, yFmt: (v) => v + "%", pad: { left: 44 } });
        if (shade) {
          SS.svgEl("rect", { x: a.sx(shade), y: a.sy(105), width: a.sx(xRange[1]) - a.sx(shade), height: a.sy(0) - a.sy(105), fill: "rgba(255,77,94,0.15)" }, svg);
          SS.svgEl("text", { x: (a.sx(shade) + a.sx(xRange[1])) / 2, y: a.sy(92), "text-anchor": "middle", fill: "#FF4D5E", "font-size": font, "font-family": "system-ui, sans-serif" }, svg).textContent = "denatures";
        }
        SS.svgEl("path", { d: SS.pathD(xs.map((v) => [a.sx(v), a.sy(fn(v))])), fill: "none", stroke: denatured ? "rgba(255,179,0,0.3)" : "#FFB300", "stroke-width": 3 }, svg);
        SS.svgEl("circle", { cx: a.sx(x), cy: a.sy(fn(x, true)), r: 7, fill: denatured ? "#FF4D5E" : "#FFB300", stroke: "#000", "stroke-width": 2 }, svg);
      }

      function draw() {
        const id = sel.value, e = ENZYMES[id], T = Number(sT.value), pH = Number(sP.value);
        if (T >= denatureTemp(id)) denatured = true;
        const temps = []; for (let t = 0; t <= 70; t += 0.5) temps.push(t);
        const phs = []; for (let p = 0; p <= 14; p += 0.1) phs.push(p);
        curve(gT, "enz-t", temps, (t, now) => activity(t, pH, id, now && denatured), T, [0, 70], [0, 20, 40, 60], (v) => v + "°", denatureTemp(id));
        curve(gP, "enz-p", phs, (p, now) => activity(T, p, id, now && denatured), pH, [0, 14], [0, 2, 4, 6, 8, 10, 12, 14]);

        const act = activity(T, pH, id, denatured);
        set("act", Math.round(act) + "%");
        set("opt", `${e.T} °C, pH ${e.pH}`);
        set("state", denatured ? "Denatured" : T > e.T + 3 ? "Losing shape" : "Normal");
        warn.className = denatured || T > e.T + 3 ? "warn" : "note";
        warn.textContent = denatured
          ? `Denatured! Heat has permanently changed ${e.name.toLowerCase()}'s shape. Cooling it won't fix it. Try a fresh sample.`
          : T > e.T + 3 ? "Too hot: the enzyme is starting to lose its shape."
          : T < 15 ? "Cold: molecules move slowly, so the reaction is slow (but the enzyme isn't damaged)."
          : Math.abs(pH - e.pH) > 2.5 ? `Wrong pH: ${e.name.toLowerCase()} works best around pH ${e.pH} (${e.where}).`
          : `${e.name} ${e.job}.`;
      }

      function fresh() { denatured = false; draw(); }
      sel.addEventListener("change", fresh);
      // Slider drags: redraw at most once per frame. The "too hot" check runs on EVERY
      // event, so a quick drag past 50 °C and back still denatures the enzyme.
      const onSlide = SS.perFrame(draw);
      sT.addEventListener("input", () => { if (Number(sT.value) >= denatureTemp(sel.value)) denatured = true; onSlide(); });
      sP.addEventListener("input", onSlide);
      root.querySelector('[data-act="fresh"]').addEventListener("click", fresh);
      draw();
      const unwatch = SS.watchWidth(gT.parentElement, draw);
      return () => { onSlide.cancel(); unwatch(); };
    },
  });
})();
