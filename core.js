/* Super Science: shared toolbox used by every concept.
 *
 * A concept file calls SuperScience.register({...}) with:
 *   id           used in the link, e.g. "vectors" -> #vectors
 *   title        card + page heading
 *   description  one line for the home card
 *   tag          "Maths" or "Physics"
 *   render(el)   draws the concept into el; may return a cleanup function
 */
window.SuperScience = (function () {
  const NS = "http://www.w3.org/2000/svg";
  const concepts = [];

  function register(concept) {
    concepts.push(concept);
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

  return { concepts, register, svgEl, slider, watchWidth, arrow };
})();
