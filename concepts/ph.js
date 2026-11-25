/* Concept: the pH scale (at 25 °C) */
(function () {
  /* ---------- Chemistry ---------- */
  const hConc = (pH) => Math.pow(10, -pH);          // [H⁺] in mol/L
  const ohConc = (pH) => Math.pow(10, -(14 - pH));  // [OH⁻] in mol/L (pH + pOH = 14 at 25 °C)
  const pOH = (pH) => 14 - pH;
  const classify = (pH) => (Math.abs(pH - 7) < 1e-9 ? "Neutral" : pH < 7 ? "Acidic" : "Basic");

  // Approximate universal-indicator colours at each whole pH (a simplified model)
  const INDICATOR = ["#E0001B", "#F0301E", "#FF5B1F", "#FF8C1A", "#FFC21A", "#F5E51B", "#C7E61F", "#4CC43D",
    "#1FA88A", "#1F7FC4", "#2A4FBF", "#4733A8", "#5E2B97", "#6A1E86", "#5A136F"];
  function indicatorColour(pH) {
    const i = Math.max(0, Math.min(13, Math.floor(pH))), f = Math.max(0, Math.min(1, pH - i));
    const a = INDICATOR[i], b = INDICATOR[i + 1];
    const mix = (k) => Math.round(parseInt(a.substr(k, 2), 16) * (1 - f) + parseInt(b.substr(k, 2), 16) * f);
    return `rgb(${mix(1)}, ${mix(3)}, ${mix(5)})`;
  }

  // Everyday examples (typical approximate values; real ones vary)
  const EXAMPLES = [
    { name: "Lemon juice", pH: 2 }, { name: "Tomato", pH: 4 }, { name: "Coffee", pH: 5 },
    { name: "Pure water", pH: 7 }, { name: "Baking soda", pH: 8.3 }, { name: "Soapy water", pH: 10 },
    { name: "Ammonia", pH: 11.5 }, { name: "Bleach", pH: 12.5 },
  ];

  if (typeof module !== "undefined" && module.exports) module.exports = { hConc, ohConc, pOH, classify, indicatorColour, EXAMPLES };
  if (typeof window === "undefined" || !window.SuperScience) return;

  /* ---------- Drawing ---------- */
  const SS = window.SuperScience;
  const SUP = { "-": "⁻", "−": "⁻", 0: "⁰", 1: "¹", 2: "²", 3: "³", 4: "⁴", 5: "⁵", 6: "⁶", 7: "⁷", 8: "⁸", 9: "⁹" };
  // 0.001 -> "1.0 × 10⁻³"
  function sci(x) {
    let e = Math.floor(Math.log10(x) + 1e-9), m = x / Math.pow(10, e);
    if (m >= 9.95) { m /= 10; e += 1; }
    return `${m.toFixed(1)} × 10${String(e).split("").map((c) => SUP[c]).join("")}`;
  }

  SS.register({
    id: "ph",
    title: "How much more acidic is lemon juice than water?",
    description: "Slide along the pH scale. Every step is ten times stronger.",
    tag: "Chemistry",

    render(root) {
      root.insertAdjacentHTML("beforeend", `
        <div class="graph-wrap"><svg role="img" aria-label="A beaker coloured like universal indicator above the pH scale from 0 to 14 with everyday examples"></svg></div>
        <p class="note" aria-live="polite"></p>`);
      const svg = root.querySelector("svg");
      const note = root.querySelector(".note");
      const set = SS.stats(root, [
        { key: "h", label: "[H⁺] (mol/L)" },
        { key: "oh", label: "[OH⁻] (mol/L)", cls: "stat-cyan" },
        { key: "type", label: "Type", cls: "stat-white" },
      ]);
      const slider = SS.slider(root, { id: "ph-v", label: "pH", min: 0, max: 14, step: 0.1, value: 2, format: (v) => v.toFixed(1) });
      root.insertAdjacentHTML("beforeend", `
        <p class="caption">pH = −log₁₀[H⁺]. Each step down the scale means <b>10 times more H⁺ ions</b>, so pH 2 is 100 000 times more acidic than pure water (pH 7). At 25 °C, pH + pOH = 14. Indicator colours here are a simplified guide.</p>`);

      function draw() {
        const pH = Number(slider.value);
        const { W, font } = SS.fit(svg, 0.82, 0.42);
        const left = 18, right = W - 18, bar = (v) => left + (v / 14) * (right - left);
        const colour = indicatorColour(pH);
        // Layout from the top down, then size the picture to fit it
        const bw = Math.min(110, W * 0.28), bh = Math.min(130, W * 0.3), bx = W / 2 - bw / 2, by = 14;
        const barY = by + bh + 66, barH = 24;
        const H = barY + barH + font * 2 + 26;
        svg.setAttribute("viewBox", `0 0 ${W} ${H}`);

        // beaker with liquid
        SS.svgEl("rect", { x: bx + 4, y: by + bh * 0.3, width: bw - 8, height: bh * 0.7 - 4, rx: 8, fill: colour }, svg);
        SS.svgEl("path", { d: `M${bx},${by} L${bx},${by + bh - 8} Q${bx},${by + bh} ${bx + 8},${by + bh} L${bx + bw - 8},${by + bh} Q${bx + bw},${by + bh} ${bx + bw},${by + bh - 8} L${bx + bw},${by}`, fill: "none", stroke: "#FFFFFF", "stroke-width": 3 }, svg);
        SS.svgEl("text", { x: W / 2, y: by + bh * 0.68, "text-anchor": "middle", fill: "#FFFFFF", "font-size": font + 9, "font-weight": 900, "font-family": "system-ui, sans-serif", stroke: "rgba(0,0,0,0.55)", "stroke-width": 3, "paint-order": "stroke" }, svg).textContent = "pH " + pH.toFixed(1);

        // colour scale
        const grad = SS.svgEl("linearGradient", { id: "ph-grad", x1: 0, x2: 1, y1: 0, y2: 0 }, SS.svgEl("defs", {}, svg));
        INDICATOR.forEach((c, i) => SS.svgEl("stop", { offset: i / 14, "stop-color": c }, grad));
        SS.svgEl("rect", { x: left, y: barY, width: right - left, height: barH, rx: 6, fill: "url(#ph-grad)" }, svg);
        const txt = { "font-family": "system-ui, sans-serif", "text-anchor": "middle" };
        for (let v = 0; v <= 14; v += W < 500 ? 2 : 1) {
          SS.svgEl("text", Object.assign({ x: bar(v), y: barY + barH + font + 4, fill: "#4DD9FF", "font-size": font }, txt), svg).textContent = v;
        }
        SS.svgEl("text", Object.assign({ x: bar(1.2), y: barY - 46, fill: "#FF4D5E", "font-size": font, "font-weight": 800 }, txt), svg).textContent = "ACIDIC";
        SS.svgEl("text", Object.assign({ x: bar(12.8), y: barY - 46, fill: "#B388FF", "font-size": font, "font-weight": 800 }, txt), svg).textContent = "BASIC";

        // everyday examples: labels alternate above / below the bar so they don't overlap
        EXAMPLES.forEach((ex, i) => {
          const x = bar(ex.pH), above = i % 2 === 0;
          const y = above ? barY - 14 : barY + barH + font * 2 + 14;
          SS.svgEl("line", { x1: x, y1: above ? barY - 10 : barY + barH, x2: x, y2: above ? barY : barY + barH + 6, stroke: "#FFFFFF", "stroke-width": 1.5 }, svg);
          SS.svgEl("text", Object.assign({ x, y, fill: "rgba(255,255,255,0.85)", "font-size": font - 1 }, txt), svg).textContent = ex.name;
        });

        // current pH marker
        SS.svgEl("rect", { x: bar(pH) - 4, y: barY - 6, width: 8, height: barH + 12, rx: 3, fill: "#FFFFFF", stroke: "#000", "stroke-width": 2 }, svg);

        const type = classify(pH);
        set("h", sci(hConc(pH)));
        set("oh", sci(ohConc(pH)));
        set("type", type);
        const times = Math.pow(10, Math.abs(7 - pH));
        const nice = times >= 10 ? Math.round(times).toLocaleString("en-US") : times.toFixed(1);
        const nearest = EXAMPLES.reduce((best, ex) => (Math.abs(ex.pH - pH) < Math.abs(best.pH - pH) ? ex : best));
        note.textContent = (type === "Neutral" ? "Same [H⁺] as pure water." : `${nice}× ${type === "Acidic" ? "more" : "less"} H⁺ than pure water.`) +
          ` Nearest everyday example: ${nearest.name} (about pH ${nearest.pH}).`;
      }

      slider.addEventListener("input", draw);
      draw();
      return SS.watchWidth(svg.parentElement, draw);
    },
  });
})();
