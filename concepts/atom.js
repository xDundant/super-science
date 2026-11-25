/* Concept: Atom builder (first 20 elements) */
(function () {
  /* ---------- Chemistry ---------- */
  // [symbol, name, neutrons in the most common (most abundant) isotope], index = protons − 1
  const ELEMENTS = [
    ["H", "Hydrogen", 0], ["He", "Helium", 2], ["Li", "Lithium", 4], ["Be", "Beryllium", 5],
    ["B", "Boron", 6], ["C", "Carbon", 6], ["N", "Nitrogen", 7], ["O", "Oxygen", 8],
    ["F", "Fluorine", 10], ["Ne", "Neon", 10], ["Na", "Sodium", 12], ["Mg", "Magnesium", 12],
    ["Al", "Aluminium", 14], ["Si", "Silicon", 14], ["P", "Phosphorus", 16], ["S", "Sulfur", 16],
    ["Cl", "Chlorine", 18], ["Ar", "Argon", 22], ["K", "Potassium", 20], ["Ca", "Calcium", 20],
  ];
  const LIMITS = { protons: [1, 20], neutrons: [0, 30], electrons: [0, 20] };
  const SHELLS = [2, 8, 8, 2]; // simple model: electrons fill shells of 2, 8, 8, 2

  const element = (protons) => {
    const [symbol, name, commonNeutrons] = ELEMENTS[protons - 1];
    return { symbol, name, commonNeutrons };
  };
  const massNumber = (protons, neutrons) => protons + neutrons;
  const charge = (protons, electrons) => protons - electrons;
  function shells(electrons) {
    const out = [];
    let left = electrons;
    for (const size of SHELLS) { if (left <= 0) break; out.push(Math.min(size, left)); left -= size; }
    return out;
  }
  const chargeText = (q) => (q === 0 ? "0" : (q > 0 ? "+" : "−") + Math.abs(q));

  // Everything the screen needs to describe an atom
  function describe(p, n, e) {
    const el = element(p), q = charge(p, e), A = massNumber(p, n);
    return {
      name: el.name, symbol: el.symbol, mass: A, charge: q,
      isIon: q !== 0,
      isCommonIsotope: n === el.commonNeutrons,
      commonMass: p + el.commonNeutrons,
    };
  }

  if (typeof module !== "undefined" && module.exports) module.exports = { ELEMENTS, LIMITS, SHELLS, element, massNumber, charge, shells, chargeText, describe };
  if (typeof window === "undefined" || !window.SuperScience) return;

  /* ---------- Drawing ---------- */
  const SS = window.SuperScience;
  const SUP = { "+": "⁺", "−": "⁻", 0: "⁰", 1: "¹", 2: "²", 3: "³", 4: "⁴", 5: "⁵", 6: "⁶", 7: "⁷", 8: "⁸", 9: "⁹" };
  const sup = (t) => String(t).split("").map((c) => SUP[c] || c).join("");
  // Ion symbol, e.g. O with charge −2 -> "O²⁻", Na +1 -> "Na⁺"
  const ionSymbol = (symbol, q) => (q === 0 ? symbol : symbol + sup((Math.abs(q) > 1 ? Math.abs(q) : "") + (q > 0 ? "+" : "−")));
  const COLOURS = { protons: "#FF4D5E", neutrons: "#A9B4D6", electrons: "#4DD9FF" };

  SS.register({
    id: "atom",
    title: "What turns one element into another?",
    description: "Add protons, neutrons and electrons to build any of the first 20 elements.",
    tag: "Chemistry",

    render(root) {
      root.insertAdjacentHTML("beforeend", `
        <div class="atom-top">
          <div class="element-card" aria-live="polite">
            <span class="el-z"></span><span class="el-a"></span>
            <span class="el-symbol"></span><span class="el-name"></span>
          </div>
          <div class="graph-wrap graph-wrap--square atom-pic"><svg role="img" aria-label="Shell diagram of the atom"></svg></div>
        </div>
        <p class="ok atom-status" aria-live="polite"></p>`);
      const svg = root.querySelector("svg");
      const status = root.querySelector(".atom-status");
      const set = SS.stats(root, [
        { key: "mass", label: "Mass number (p + n)" },
        { key: "charge", label: "Charge (p − e)", cls: "stat-cyan" },
        { key: "shells", label: "Electron shells", cls: "stat-white" },
      ]);
      const counts = { protons: 6, neutrons: 6, electrons: 6 };
      const counters = document.createElement("div");
      counters.className = "counters";
      counters.innerHTML = Object.keys(counts).map((k) => `
        <div class="counter">
          <span class="counter-label"><i class="dot" style="background:${COLOURS[k]}"></i>${k[0].toUpperCase() + k.slice(1)}</span>
          <button type="button" class="counter-btn" data-k="${k}" data-d="-1" aria-label="Remove one ${k.slice(0, -1)}">−</button>
          <span class="counter-val" data-v="${k}"></span>
          <button type="button" class="counter-btn" data-k="${k}" data-d="1" aria-label="Add one ${k.slice(0, -1)}">+</button>
        </div>`).join("");
      root.appendChild(counters);
      root.insertAdjacentHTML("beforeend", `
        <p class="caption">The number of <b>protons</b> decides the element. <b>Neutrons</b> change the mass but not the element (different versions are called isotopes). <b>Electrons</b> change the charge: gain or lose some and you get an ion. This simple model fills electron shells with 2, 8, 8 then 2.</p>`);

      function drawAtom(d) {
        const { W } = SS.fit(svg, 1, 1);
        const c = W / 2, nucleusR = W * 0.11;
        const ring = shells(counts.electrons);
        // shells
        SHELLS.forEach((_, i) => {
          const r = nucleusR + 22 + i * ((c - nucleusR - 32) / 4);
          SS.svgEl("circle", { cx: c, cy: c, r, fill: "none", stroke: i < ring.length ? "rgba(77,217,255,0.45)" : "rgba(255,255,255,0.08)", "stroke-width": 1.5 }, svg);
          for (let k = 0; k < (ring[i] || 0); k++) {
            const a = -Math.PI / 2 + (k / ring[i]) * Math.PI * 2;
            SS.svgEl("circle", { cx: c + r * Math.cos(a), cy: c + r * Math.sin(a), r: 6, fill: COLOURS.electrons, stroke: "#000", "stroke-width": 1.5 }, svg);
          }
        });
        // nucleus: protons and neutrons packed in a sunflower spiral
        const total = counts.protons + counts.neutrons;
        // spread the neutrons evenly among the protons (exactly `neutrons` of them)
        const n = counts.neutrons;
        const balls = Array.from({ length: total }, (_, i) =>
          Math.floor(((i + 1) * n) / total) > Math.floor((i * n) / total) ? "neutrons" : "protons");
        const r = Math.max(3.5, Math.min(7, (nucleusR * 0.9) / Math.sqrt(total)));
        balls.forEach((kind, i) => {
          const dist = r * 1.25 * Math.sqrt(i + 0.5), a = i * 2.39996;
          SS.svgEl("circle", { cx: c + dist * Math.cos(a), cy: c + dist * Math.sin(a), r, fill: COLOURS[kind], stroke: "#000", "stroke-width": 1 }, svg);
        });
      }

      function update() {
        const d = describe(counts.protons, counts.neutrons, counts.electrons);
        Object.keys(counts).forEach((k) => {
          root.querySelector(`[data-v="${k}"]`).textContent = counts[k];
          root.querySelector(`[data-k="${k}"][data-d="-1"]`).disabled = counts[k] <= LIMITS[k][0];
          root.querySelector(`[data-k="${k}"][data-d="1"]`).disabled = counts[k] >= LIMITS[k][1];
        });
        root.querySelector(".el-z").textContent = counts.protons;
        root.querySelector(".el-a").textContent = d.mass;
        root.querySelector(".el-symbol").textContent = ionSymbol(d.symbol, d.charge);
        root.querySelector(".el-name").textContent = `${d.name}-${d.mass}`;

        const ion = d.charge === 0 ? "Neutral atom"
          : d.charge > 0 ? `Positive ion (lost ${d.charge} electron${d.charge > 1 ? "s" : ""})`
          : `Negative ion (gained ${-d.charge} electron${d.charge < -1 ? "s" : ""})`;
        const iso = d.isCommonIsotope ? `the most common form of ${d.name.toLowerCase()}`
          : `an isotope (the most common is ${d.name.toLowerCase()}-${d.commonMass})`;
        status.textContent = `${ion} · ${iso}`;
        status.className = (d.isIon || !d.isCommonIsotope ? "note" : "ok") + " atom-status";

        set("mass", d.mass);
        set("charge", chargeText(d.charge));
        set("shells", shells(counts.electrons).join(", ") || "none");
        drawAtom(d);
      }

      counters.addEventListener("click", (e) => {
        const btn = e.target.closest(".counter-btn");
        if (!btn || btn.disabled) return;
        const k = btn.dataset.k, [lo, hi] = LIMITS[k];
        counts[k] = Math.max(lo, Math.min(hi, counts[k] + Number(btn.dataset.d)));
        update();
      });
      update();
      return SS.watchWidth(svg.parentElement, update);
    },
  });
})();
