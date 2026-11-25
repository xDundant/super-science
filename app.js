/* Super Science: home screen + simple hash routing.
 *   (no hash)    -> home grid of concept cards
 *   #taylor etc. -> that concept
 * Concepts come from SuperScience.register(...) in concepts/*.js.
 */
(function () {
  const SS = window.SuperScience;
  const app = document.getElementById("app");
  const SITE_TITLE = "Super Science";
  let cleanup = null;      // undo function for the concept currently on screen
  let cameFromHome = false; // so the on-page back button behaves like the browser's
  let current = null;       // "home", a concept id, or null before the first screen

  const escapeHTML = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  function renderHome() {
    document.title = SITE_TITLE;
    app.innerHTML = `
      <p class="intro">Pick a concept and play with it.</p>
      <ul class="cards">
        ${SS.concepts.map((c) => `
          <li>
            <a class="card" href="#${c.id}">
              <span class="tag tag-${c.tag.toLowerCase()}">${escapeHTML(c.tag)}</span>
              <span class="card-title">${escapeHTML(c.title)}</span>
              <span class="card-desc">${escapeHTML(c.description)}</span>
              <span class="card-go" aria-hidden="true">Open →</span>
            </a>
          </li>`).join("")}
      </ul>`;
  }

  function renderConcept(concept) {
    document.title = `${concept.title} · ${SITE_TITLE}`;
    app.innerHTML = `
      <a class="back" href="#">← All concepts</a>
      <section class="concept" aria-labelledby="concept-title">
        <h2 class="concept-title" id="concept-title" tabindex="-1">${escapeHTML(concept.title)}</h2>
      </section>`;

    app.querySelector(".back").addEventListener("click", (e) => {
      // If we got here from the home screen, step back in history instead of piling up entries.
      if (cameFromHome) { e.preventDefault(); history.back(); }
    });

    const section = app.querySelector(".concept");
    const result = concept.render(section);
    cleanup = typeof result === "function" ? result : null;
    SS.renderQuiz(app, concept.id); // "Test yourself" card, if this concept has questions
    section.querySelector(".concept-title").focus({ preventScroll: true });
  }

  function route() {
    if (cleanup) { cleanup(); cleanup = null; }
    const id = decodeURIComponent(location.hash.slice(1));
    const concept = SS.concepts.find((c) => c.id === id);
    if (concept) {
      cameFromHome = current === "home";
      renderConcept(concept);
      current = concept.id;
    } else {
      renderHome();
      current = "home";
    }
    window.scrollTo(0, 0);
  }

  window.addEventListener("hashchange", route);
  route();

  /* ---------- Offline support (service worker) ---------- */
  if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("sw.js").catch(() => {});
    });
  }
})();
