/* Concept: Natural selection (a simplified model of camouflaged bugs) */
(function () {
  /* ---------- Biology model ---------- */
  const POP = 50;            // bugs per generation
  const MUTATION = 0.02;     // chance a baby is the other colour
  const CAMO = 0.1;          // a well-camouflaged bug is eaten at only 10% of the predator pressure

  // Seedable random numbers (mulberry32): the same seed always gives the same run.
  function rng(seed) {
    let a = seed >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  // Chance a bug of `colour` ("L" light / "D" dark) is eaten on this `background` ("light" / "dark")
  function eatChance(colour, background, pressure) {
    const standsOut = (colour === "D") !== (background === "dark");
    return standsOut ? pressure : pressure * CAMO;
  }

  const startPopulation = (fractionDark) => {
    const dark = Math.round(POP * fractionDark);
    return Array.from({ length: POP }, (_, i) => (i < dark ? "D" : "L"));
  };
  const percentDark = (pop) => (pop.length ? (100 * pop.filter((c) => c === "D").length) / pop.length : 0);

  // One generation: predators eat some bugs, survivors have babies (back up to POP).
  function nextGeneration(pop, { background, pressure }, random) {
    const survivors = pop.filter((c) => random() >= eatChance(c, background, pressure));
    if (!survivors.length) return { survivors, eaten: pop.length, next: [] };
    const next = [];
    for (let i = 0; i < POP; i++) {
      const parent = survivors[Math.floor(random() * survivors.length)];
      next.push(random() < MUTATION ? (parent === "D" ? "L" : "D") : parent);
    }
    return { survivors, eaten: pop.length - survivors.length, next };
  }

  // A whole run, for tests: returns % dark after each generation (starting value first).
  function simulate({ seed, generations, background = "dark", pressure = 0.5, fractionDark = 0.1 }) {
    const random = rng(seed);
    let pop = startPopulation(fractionDark);
    const history = [percentDark(pop)];
    for (let g = 0; g < generations && pop.length; g++) {
      pop = nextGeneration(pop, { background, pressure }, random).next;
      history.push(percentDark(pop));
    }
    return history;
  }

  if (typeof module !== "undefined" && module.exports) {
    module.exports = { POP, MUTATION, CAMO, rng, eatChance, startPopulation, percentDark, nextGeneration, simulate };
  }
  if (typeof window === "undefined" || !window.SuperScience) return;

  /* ---------- Drawing ---------- */
  const SS = window.SuperScience;
  const BARK = { light: "#D9CBA3", dark: "#2A2622" };
  const BUG = { L: "#F1E9D2", D: "#2F2A25" };
  const START_DARK = 0.1, MAX_GENS = 60;

  SS.register({
    id: "natural-selection",
    title: "Can a hungry bird change a whole species?",
    description: "Predators eat the bugs that stand out. Watch the population change colour.",
    tag: "Biology",

    render(root) {
      root.insertAdjacentHTML("beforeend", `
        <div class="graph-wrap"><svg class="field" role="img" aria-label="Light and dark bugs resting on tree bark"></svg></div>
        <div class="btn-row" role="group" aria-label="Bark colour">
          <button type="button" class="btn-secondary" data-bg="light" aria-pressed="false">Light bark</button>
          <button type="button" class="btn-secondary" data-bg="dark" aria-pressed="true">Dark bark</button>
        </div>`);
      const field = root.querySelector("svg.field");
      const set = SS.stats(root, [
        { key: "gen", label: "Generation", cls: "stat-white" },
        { key: "dark", label: "Dark bugs" },
        { key: "light", label: "Light bugs", cls: "stat-cyan" },
        { key: "eaten", label: "Eaten last time", cls: "stat-red" },
      ]);
      const sP = SS.slider(root, { id: "ns-p", label: "Predator pressure", min: 0, max: 0.9, step: 0.05, value: 0.5, format: (v) => Math.round(v * 100) + "%" });
      root.insertAdjacentHTML("beforeend", `
        <div class="btn-row">
          <button type="button" class="btn" data-act="next">Next generation</button>
          <button type="button" class="btn-secondary" data-act="auto" aria-pressed="false">Auto-play</button>
          <button type="button" class="btn-secondary" data-act="reset">Reset</button>
        </div>
        <p class="warn" aria-live="polite"></p>
        <p class="graph-title">% of dark bugs over the generations</p>
        <div class="graph-wrap"><svg class="chart" role="img" aria-label="Line chart of the percentage of dark bugs each generation"></svg></div>
        <p class="caption">Birds spot and eat bugs that <b>stand out</b> from the bark (pressure = the chance a standing-out bug is eaten). Survivors have babies the <b>same colour</b> as them, with a small chance of a colour mutation. Over generations the population shifts to match the background. That's <b>natural selection</b>. <i>This is a simplified model; real populations are far more complex.</i></p>`);
      const chart = root.querySelector("svg.chart");
      const warn = root.querySelector(".warn");
      const btnAuto = root.querySelector('[data-act="auto"]');
      const btnNext = root.querySelector('[data-act="next"]');

      let background = "dark", random, pop, history, gen, eaten, timer = null, seed;

      function reset() {
        stopAuto();
        seed = (Date.now() ^ (Math.random() * 1e9)) >>> 0;
        random = rng(seed);
        pop = startPopulation(START_DARK);
        history = [percentDark(pop)];
        gen = 0; eaten = 0;
        warn.textContent = "";
        btnNext.disabled = false;
        draw();
      }

      function step() {
        if (!pop.length || gen >= MAX_GENS) return stopAuto();
        const r = nextGeneration(pop, { background, pressure: Number(sP.value) }, random);
        pop = r.next; eaten = r.eaten; gen++;
        history.push(percentDark(pop));
        if (!pop.length) { warn.textContent = "Every bug was eaten! Lower the pressure and press Reset."; btnNext.disabled = true; stopAuto(); }
        else if (gen >= MAX_GENS) { warn.textContent = `That's ${MAX_GENS} generations. Press Reset to start again.`; btnNext.disabled = true; stopAuto(); }
        draw();
      }

      function stopAuto() {
        if (timer) clearInterval(timer);
        timer = null;
        btnAuto.setAttribute("aria-pressed", "false");
        btnAuto.textContent = "Auto-play";
      }

      function drawField() {
        const { W, H } = SS.fit(field, 0.62, 0.36);
        SS.svgEl("rect", { x: 0, y: 0, width: W, height: H, fill: BARK[background] }, field);
        // bark texture
        const tex = rng(7);
        for (let i = 0; i < 26; i++) {
          const x = tex() * W;
          SS.svgEl("path", { d: `M${x},0 Q${x + (tex() - 0.5) * 40},${H / 2} ${x + (tex() - 0.5) * 30},${H}`, fill: "none", stroke: background === "dark" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.08)", "stroke-width": 2 + tex() * 4 }, field);
        }
        // bugs at repeatable positions for this generation
        const place = rng(seed + gen * 7919);
        const size = Math.max(7, Math.min(11, W / 40));
        pop.forEach((c) => {
          const x = size * 1.5 + place() * (W - size * 3), y = size * 1.5 + place() * (H - size * 3), turn = Math.round(place() * 360);
          const g = SS.svgEl("g", { transform: `translate(${x.toFixed(1)},${y.toFixed(1)}) rotate(${turn})` }, field);
          const edge = { stroke: "rgba(128,128,128,0.45)", "stroke-width": 0.8 };
          SS.svgEl("ellipse", Object.assign({ cx: -size * 0.55, cy: 0, rx: size * 0.7, ry: size * 0.45, fill: BUG[c] }, edge), g);
          SS.svgEl("ellipse", Object.assign({ cx: size * 0.55, cy: 0, rx: size * 0.7, ry: size * 0.45, fill: BUG[c] }, edge), g);
          SS.svgEl("ellipse", { cx: 0, cy: 0, rx: size * 0.22, ry: size * 0.6, fill: c === "D" ? "#1C1915" : "#CFC4A6" }, g);
        });
      }

      function drawChart() {
        const { W, H, font } = SS.fit(chart, 0.5, 0.26);
        const xMax = Math.max(20, Math.ceil(gen / 10) * 10);
        const xTicks = []; for (let x = 0; x <= xMax; x += xMax > 30 ? 10 : 5) xTicks.push(x);
        const a = SS.axes(chart, { W, H, font, id: "ns", x: [0, xMax], y: [0, 100], xTicks, yTicks: [0, 50, 100], yFmt: (v) => v + "%", pad: { left: 44 } });
        SS.svgEl("path", { d: SS.pathD(history.map((v, i) => [a.sx(i), a.sy(v)])), fill: "none", stroke: "#FFB300", "stroke-width": 3, "stroke-linejoin": "round" }, chart);
        SS.svgEl("circle", { cx: a.sx(gen), cy: a.sy(history[history.length - 1]), r: 5, fill: "#FFB300", stroke: "#000", "stroke-width": 2 }, chart);
      }

      function draw() {
        drawField();
        drawChart();
        const d = percentDark(pop);
        set("gen", gen);
        set("dark", pop.length ? Math.round(d) + "%" : "—");
        set("light", pop.length ? Math.round(100 - d) + "%" : "—");
        set("eaten", eaten);
      }

      root.querySelectorAll("[data-bg]").forEach((b) => b.addEventListener("click", () => {
        background = b.dataset.bg;
        root.querySelectorAll("[data-bg]").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
        drawField();
      }));
      btnNext.addEventListener("click", step);
      btnAuto.addEventListener("click", () => {
        if (timer) return stopAuto();
        btnAuto.setAttribute("aria-pressed", "true");
        btnAuto.textContent = "Pause";
        timer = setInterval(step, 700);
      });
      root.querySelector('[data-act="reset"]').addEventListener("click", reset);

      reset();
      const unwatch = SS.watchWidth(field.parentElement, draw);
      return () => { stopAuto(); unwatch(); };
    },
  });
})();
