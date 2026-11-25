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

  const SUBJECTS = ["All", "Maths", "Physics", "Chemistry", "Biology"];
  let subject = "All"; // home screen filter (remembered while the app is open)

  function renderHome() {
    document.title = SITE_TITLE;
    const count = (s) => SS.concepts.filter((c) => s === "All" || c.tag === s).length;
    app.innerHTML = `
      <p class="intro">Pick a concept and play with it.</p>
      <div class="chips" role="group" aria-label="Filter by subject">
        ${SUBJECTS.map((s) => `
          <button type="button" class="chip chip-${s.toLowerCase()}" data-subject="${s}" aria-pressed="${s === subject}">
            ${s} <span class="chip-count">${count(s)}</span>
          </button>`).join("")}
      </div>
      <p class="empty" hidden>No concepts here yet. Coming soon!</p>
      <ul class="cards">
        ${SS.concepts.map((c) => `
          <li data-subject="${escapeHTML(c.tag)}">
            <a class="card" href="#${c.id}">
              <span class="tag tag-${c.tag.toLowerCase()}">${escapeHTML(c.tag)}</span>
              <span class="card-title">${escapeHTML(c.title)}</span>
              <span class="card-desc">${escapeHTML(c.description)}</span>
              <span class="card-go" aria-hidden="true">Open →</span>
            </a>
          </li>`).join("")}
      </ul>`;

    function applyFilter() {
      app.querySelectorAll(".chip").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.subject === subject)));
      app.querySelectorAll(".cards li").forEach((li) => { li.hidden = subject !== "All" && li.dataset.subject !== subject; });
      app.querySelector(".empty").hidden = count(subject) > 0;
    }
    app.querySelectorAll(".chip").forEach((b) => b.addEventListener("click", () => { subject = b.dataset.subject; applyFilter(); }));
    applyFilter();
  }

  // A page with a back link and a titled card. fill(section) adds the content
  // and may return a cleanup function.
  function renderPage(title, fill) {
    document.title = `${title} · ${SITE_TITLE}`;
    app.innerHTML = `
      <a class="back" href="#">← All concepts</a>
      <section class="concept" aria-labelledby="concept-title">
        <h2 class="concept-title" id="concept-title" tabindex="-1">${escapeHTML(title)}</h2>
      </section>`;

    app.querySelector(".back").addEventListener("click", (e) => {
      // If we got here from the home screen, step back in history instead of piling up entries.
      if (cameFromHome) { e.preventDefault(); history.back(); }
    });

    const section = app.querySelector(".concept");
    const result = fill(section);
    cleanup = typeof result === "function" ? result : null;
    section.querySelector(".concept-title").focus({ preventScroll: true });
  }

  function renderConcept(concept) {
    renderPage(concept.title, (section) => {
      const undo = concept.render(section);
      SS.renderQuiz(app, concept.id); // "Test yourself" card, if this concept has questions
      if (SS.xp) SS.xp.award({ type: "openConcept", conceptId: concept.id }, section.querySelector(".concept-title"));
      return undo;
    });
  }

  function route() {
    if (cleanup) { cleanup(); cleanup = null; }
    window.scrollTo(0, 0); // before drawing, so XP popups appear in the right place
    const id = decodeURIComponent(location.hash.slice(1));
    const concept = SS.concepts.find((c) => c.id === id);
    if (concept) {
      cameFromHome = current === "home";
      renderConcept(concept);
      current = concept.id;
    } else if (id === "profile" && SS.xp) {
      cameFromHome = current === "home";
      renderPage("Your Power Level", (section) => SS.xp.renderProfile(section));
      current = "profile";
    } else {
      renderHome();
      current = "home";
    }
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
