/* Super Science: shared toolbox used by every concept.
 *
 * A concept file calls SuperScience.register({...}) with:
 *   id           used in the link, e.g. "vectors" -> #vectors
 *   title        card + page heading
 *   description  one line for the home card
 *   tag          "Maths" or "Physics"
 *   render(el)   draws the concept into el; may return a cleanup function
 *
 * A questions file calls SuperScience.addQuestions("vectors", [...]) and the
 * concept page shows a "Test yourself" quiz automatically.
 */
window.SuperScience = (function () {
  const NS = "http://www.w3.org/2000/svg";
  const concepts = [];
  const questions = {}; // concept id -> list of questions

  function register(concept) {
    concepts.push(concept);
  }

  function addQuestions(conceptId, list) {
    questions[conceptId] = list;
  }

  function escapeHTML(text) {
    return String(text).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }

  // Create an SVG element with attributes, optionally adding it to a parent.
  function svgEl(name, attrs, parent) {
    const node = document.createElementNS(NS, name);
    for (const key in attrs) node.setAttribute(key, attrs[key]);
    if (parent) parent.appendChild(node);
    return node;
  }

  // Build a labelled slider. Returns the <input>; listen to its "input" event.
  //   opts: { id, label, min, max, step, value, format(v), accent: "amber" | "cyan" }
  function slider(parent, opts) {
    const format = opts.format || String;
    const wrap = document.createElement("div");
    wrap.className = "control control--" + (opts.accent || "amber");
    wrap.innerHTML =
      `<label class="control-label" for="${opts.id}">${opts.label}: <strong></strong></label>` +
      `<input type="range" id="${opts.id}" min="${opts.min}" max="${opts.max}" step="${opts.step}" value="${opts.value}">` +
      `<div class="control-ends" aria-hidden="true"><span>${format(opts.min)}</span><span>${format(opts.max)}</span></div>`;
    const input = wrap.querySelector("input");
    const out = wrap.querySelector("strong");

    function sync() {
      const v = Number(input.value);
      out.textContent = format(v);
      input.setAttribute("aria-valuetext", format(v));
      input.style.setProperty("--fill", ((v - opts.min) / (opts.max - opts.min)) * 100 + "%");
    }
    input.addEventListener("input", sync);
    sync();
    parent.appendChild(wrap);
    return input;
  }

  // Call fn(width) whenever el changes width (phone rotation, window resize).
  // Returns a function that stops watching.
  function watchWidth(el, fn) {
    let last = el.clientWidth;
    if (typeof ResizeObserver === "undefined") {
      const onResize = () => { if (el.clientWidth !== last) { last = el.clientWidth; fn(last); } };
      window.addEventListener("resize", onResize);
      return () => window.removeEventListener("resize", onResize);
    }
    const ro = new ResizeObserver(() => {
      const w = el.clientWidth;
      if (w && w !== last) { last = w; fn(w); }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }

  // Draw an arrow from (x1,y1) to (x2,y2) in screen coordinates.
  function arrow(parent, x1, y1, x2, y2, color, width) {
    const g = svgEl("g", {}, parent);
    const len = Math.hypot(x2 - x1, y2 - y1);
    if (len < 1) return g;
    const head = Math.min(14, len * 0.45);
    const ux = (x2 - x1) / len, uy = (y2 - y1) / len;
    // Stop the line short so it doesn't poke through the arrowhead.
    svgEl("line", {
      x1, y1, x2: x2 - ux * head * 0.8, y2: y2 - uy * head * 0.8,
      stroke: color, "stroke-width": width || 3, "stroke-linecap": "round",
    }, g);
    const bx = x2 - ux * head, by = y2 - uy * head;
    const px = -uy * head * 0.5, py = ux * head * 0.5;
    svgEl("polygon", {
      points: `${x2},${y2} ${bx + px},${by + py} ${bx - px},${by - py}`,
      fill: color,
    }, g);
    return g;
  }

  /* ---------- Helpers shared by the concepts ---------- */

  const reducedMotion = () => { try { return window.matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (e) { return false; } };

  // Number with a proper minus sign, e.g. fmt(-2.5, 1) -> "−2.5"
  function fmt(value, dp) {
    const text = dp === undefined ? String(value) : value.toFixed(dp);
    return text.replace(/^-/, "−").replace(/^−(0\.?0*)$/, "$1"); // no "−0.00"
  }

  // Animation loop: calls fn(dt) every frame with dt in seconds (max 0.05).
  // Return false from fn to stop. Returns a stop() function.
  function loop(fn) {
    let last = null, id = 0, stopped = false;
    function frame(now) {
      if (stopped) return;
      const dt = last === null ? 0 : Math.min(0.05, (now - last) / 1000);
      last = now;
      if (fn(dt) === false) { stopped = true; return; }
      id = requestAnimationFrame(frame);
    }
    id = requestAnimationFrame(frame);
    return () => { stopped = true; cancelAnimationFrame(id); };
  }

  // Row of live number tiles. items: [{ key, label, cls }]. Returns set(key, text).
  function stats(parent, items) {
    const wrap = document.createElement("div");
    wrap.className = "stats" + (items.length === 4 ? " stats--4" : items.length === 2 ? " stats--2" : "");
    wrap.innerHTML = items.map((i) =>
      `<div class="stat"><span class="stat-label">${i.label}</span><span class="stat-value ${i.cls || ""}" data-k="${i.key}"></span></div>`).join("");
    parent.appendChild(wrap);
    return (key, text) => { wrap.querySelector(`[data-k="${key}"]`).textContent = text; };
  }

  // Labelled dropdown. opts: { id, label, options: [[value, text], ...], value }. Returns the <select>.
  function select(parent, opts) {
    const wrap = document.createElement("div");
    wrap.className = "select-control";
    wrap.innerHTML = `<label for="${opts.id}">${opts.label}</label><select id="${opts.id}">` +
      opts.options.map(([v, t]) => `<option value="${v}"${v === opts.value ? " selected" : ""}>${t}</option>`).join("") + `</select>`;
    parent.appendChild(wrap);
    return wrap.querySelector("select");
  }

  // Size an <svg> to its container and clear it. ratio = height / width (phone, wider screens).
  function fit(svg, ratioPhone, ratioWide) {
    const W = Math.max(260, Math.round(svg.parentElement.clientWidth || 600));
    const H = Math.round(W * (W < 600 ? ratioPhone : ratioWide));
    svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
    svg.innerHTML = "";
    return { W, H, font: W < 500 ? 11 : 13 };
  }

  // Grid, axes and tick labels for a graph. Returns { sx, sy, clip } where sx/sy turn
  // data values into screen positions and clip is a clip-path URL for the plot area.
  //   o: { W, H, font, x: [min, max], y: [min, max], xTicks, yTicks, xFmt, yFmt, xLabel, yLabel, pad, id }
  function axes(svg, o) {
    const pad = Object.assign({ left: 40, right: 12, top: 14, bottom: 30 }, o.pad);
    const sx = (v) => pad.left + ((v - o.x[0]) / (o.x[1] - o.x[0])) * (o.W - pad.left - pad.right);
    const sy = (v) => o.H - pad.bottom - ((v - o.y[0]) / (o.y[1] - o.y[0])) * (o.H - pad.top - pad.bottom);
    const xFmt = o.xFmt || ((v) => fmt(v)), yFmt = o.yFmt || ((v) => fmt(v));
    const id = (o.id || "plot") + "-clip";
    const clip = svgEl("clipPath", { id }, svgEl("defs", {}, svg));
    svgEl("rect", { x: pad.left, y: pad.top, width: o.W - pad.left - pad.right, height: o.H - pad.top - pad.bottom }, clip);

    const grid = svgEl("g", { stroke: "rgba(77, 217, 255, 0.12)", "stroke-width": 1 }, svg);
    const labels = svgEl("g", { fill: "#4DD9FF", "font-size": o.font, "font-family": "system-ui, sans-serif" }, svg);
    (o.xTicks || []).forEach((v) => {
      svgEl("line", { x1: sx(v), y1: sy(o.y[0]), x2: sx(v), y2: sy(o.y[1]) }, grid);
      svgEl("text", { x: sx(v), y: o.H - pad.bottom + o.font + 6, "text-anchor": "middle" }, labels).textContent = xFmt(v);
    });
    (o.yTicks || []).forEach((v) => {
      svgEl("line", { x1: sx(o.x[0]), y1: sy(v), x2: sx(o.x[1]), y2: sy(v) }, grid);
      svgEl("text", { x: pad.left - 6, y: sy(v) + o.font * 0.35, "text-anchor": "end" }, labels).textContent = yFmt(v);
    });
    const ax = svgEl("g", { stroke: "#4DD9FF", "stroke-width": 1.5, opacity: 0.8 }, svg);
    const x0 = o.x[0] <= 0 && o.x[1] >= 0 ? 0 : o.x[0];
    const y0 = o.y[0] <= 0 && o.y[1] >= 0 ? 0 : o.y[0];
    svgEl("line", { x1: sx(o.x[0]), y1: sy(y0), x2: sx(o.x[1]), y2: sy(y0) }, ax);
    svgEl("line", { x1: sx(x0), y1: sy(o.y[0]), x2: sx(x0), y2: sy(o.y[1]) }, ax);
    if (o.xLabel) svgEl("text", { x: o.W - pad.right, y: sy(y0) - 6, "text-anchor": "end", opacity: 0.75 }, labels).textContent = o.xLabel;
    if (o.yLabel) svgEl("text", { x: sx(x0) + 6, y: pad.top + o.font, opacity: 0.75 }, labels).textContent = o.yLabel;
    return { sx, sy, clip: `url(#${id})`, pad };
  }

  // SVG path through points [[x, y], ...] already in screen coordinates.
  const pathD = (pts) => pts.map((p, i) => (i ? "L" : "M") + p[0].toFixed(1) + "," + p[1].toFixed(1)).join("");

  return {
    concepts, register, questions, addQuestions, escapeHTML, svgEl, slider, watchWidth, arrow,
    reducedMotion, fmt, loop, stats, select, fit, axes, pathD,
  };
})();
