/* Super Science: sidebar navigation.
 *   Wide screens (1000px+): a permanent sidebar on the left.
 *   Phones / narrow: a slide-out drawer opened by the ☰ button, with a dimmed backdrop.
 *   Closes with the backdrop, Escape, the ✕ button, or choosing an item.
 * The current page is highlighted with aria-current="page" (the router sends "ss:route").
 */
(function () {
  const SS = window.SuperScience;
  const esc = SS.escapeHTML;
  const SUBJECTS = ["Maths", "Physics", "Chemistry", "Biology"];

  const sidebar = document.getElementById("sidebar");
  const backdrop = document.getElementById("backdrop");
  const menuBtn = document.getElementById("menu-btn");
  const wideQuery = window.matchMedia("(min-width: 1000px)");
  const pageParts = () => [document.querySelector(".site-header"), document.getElementById("app"), document.querySelector(".site-footer")];
  let open = false;
  let route = "home";

  /* ---------- Build the sidebar ---------- */
  function render() {
    const bySubject = (s) => SS.concepts.filter((c) => c.tag === s);
    sidebar.innerHTML = `
      <div class="sb-top">
        <a class="sb-logo" href="#" aria-label="Super Science home">SUPER <span>SCIENCE</span></a>
        <button type="button" class="sb-close" aria-label="Close menu">✕</button>
      </div>
      <ul class="sb-list">
        <li><a class="sb-item" href="#" data-route="home"><span class="sb-ico" aria-hidden="true">🏠</span>Home</a></li>
        <li>
          <button type="button" class="sb-item sb-toggle" aria-expanded="true" aria-controls="sb-concepts">
            <span class="sb-ico" aria-hidden="true">📚</span>Concepts<span class="sb-chev" aria-hidden="true">›</span>
          </button>
          <ul class="sb-sub" id="sb-concepts">
            ${SUBJECTS.map((s) => `
              <li>
                <button type="button" class="sb-subject sb-toggle" aria-expanded="false" aria-controls="sb-${s}" data-subject="${s}">
                  <i class="dot dot-${s.toLowerCase()}" aria-hidden="true"></i>${s}
                  <span class="sb-count">${bySubject(s).length}</span><span class="sb-chev" aria-hidden="true">›</span>
                </button>
                <ul class="sb-concepts" id="sb-${s}" hidden>
                  ${bySubject(s).map((c) => `<li><a class="sb-link" href="#${c.id}" data-route="${c.id}">${esc(c.title)}</a></li>`).join("")}
                </ul>
              </li>`).join("")}
          </ul>
        </li>
        <li><a class="sb-item" href="#games" data-route="games"><span class="sb-ico" aria-hidden="true">🎮</span>Minigames</a></li>
        <li><a class="sb-item" href="#profile" data-route="profile"><span class="sb-ico" aria-hidden="true">👤</span>Profile</a></li>
        <li><button type="button" class="sb-item" data-sound-toggle="label"></button></li>
      </ul>
      <a class="sb-power" href="#profile" data-route="profile-bar">
        <span class="sb-power-top"><b class="sb-rank"></b><span class="sb-level"></span><span class="sb-streak"></span></span>
        <span class="sb-track" aria-hidden="true"><span class="sb-fill"></span></span>
        <span class="sb-xp"></span>
      </a>`;
    if (window.SFX) SFX.refreshButtons();
    if (SS.xp) updatePower();
  }

  // Mini Power Level bar (same numbers as the header bar)
  function updatePower(detail) {
    const box = sidebar.querySelector(".sb-power");
    if (!box || !SS.xp) return;
    const E = window.SuperScienceXPEngine;
    const info = detail ? detail.info : E.levelInfo(SS.xp.state.xp);
    const streak = detail ? detail.streak : E.currentStreak(SS.xp.state);
    box.querySelector(".sb-rank").textContent = info.rank;
    box.querySelector(".sb-level").textContent = `Lv ${info.level}`;
    box.querySelector(".sb-streak").textContent = `🔥 ${streak}`;
    box.querySelector(".sb-xp").textContent = info.maxed ? "Max level" : `${info.xpIntoLevel} / ${info.xpForNextLevel} XP`;
    box.querySelector(".sb-fill").style.transform = `scaleX(${info.progress.toFixed(4)})`;
    box.setAttribute("aria-label", `Power level: ${info.rank}, level ${info.level}, ${streak} day streak. Open profile.`);
  }

  /* ---------- Highlight the current page ---------- */
  function highlight() {
    const section = route.startsWith("games") ? "games" : route;
    sidebar.querySelectorAll("[data-route]").forEach((a) => {
      if (a.dataset.route === section) a.setAttribute("aria-current", "page");
      else a.removeAttribute("aria-current");
    });
    // Open the subject that contains the current concept
    const concept = SS.concepts.find((c) => c.id === route);
    if (concept) setExpanded(sidebar.querySelector(`.sb-subject[data-subject="${concept.tag}"]`), true);
  }

  function setExpanded(btn, yes) {
    if (!btn) return;
    btn.setAttribute("aria-expanded", String(yes));
    document.getElementById(btn.getAttribute("aria-controls")).hidden = !yes;
  }

  /* ---------- Opening and closing the drawer (narrow screens) ---------- */
  function sync() {
    const wide = wideQuery.matches;
    // A closed drawer is "inert": hidden from Tab and screen readers.
    sidebar.inert = !wide && !open;
    pageParts().forEach((el) => { if (el) el.inert = !wide && open; });
    menuBtn.setAttribute("aria-expanded", String(open && !wide));
    sidebar.classList.toggle("is-open", open && !wide);
    document.body.classList.toggle("drawer-open", open && !wide);
  }

  function openDrawer() {
    if (open || wideQuery.matches) return;
    open = true;
    backdrop.hidden = false;
    requestAnimationFrame(() => backdrop.classList.add("is-open")); // next frame, so it fades in
    sync();
    // Move focus into the drawer (the current page's item, or the first item)
    const target = sidebar.querySelector('[aria-current="page"]:not(.sb-power)') || sidebar.querySelector(".sb-item");
    target.focus({ preventScroll: true });
  }

  function closeDrawer(returnFocus) {
    if (!open) return;
    open = false;
    backdrop.classList.remove("is-open");
    const hide = () => { if (!open) backdrop.hidden = true; };
    backdrop.addEventListener("transitionend", hide, { once: true });
    setTimeout(hide, 400); // clean-up backup in case the transition doesn't run
    sync();
    if (returnFocus) menuBtn.focus({ preventScroll: true });
  }

  /* ---------- Events ---------- */
  menuBtn.addEventListener("click", () => (open ? closeDrawer(true) : openDrawer()));
  backdrop.addEventListener("click", () => closeDrawer(true));
  document.addEventListener("keydown", (e) => {
    if (!open) return;
    if (e.key === "Escape") return closeDrawer(true);
    // Keep Tab inside the open drawer: past the last item wraps to the first, and back.
    if (e.key === "Tab") {
      const items = [...sidebar.querySelectorAll("a[href], button")].filter((el) => !el.closest("[hidden]") && el.offsetParent !== null);
      const first = items[0], last = items[items.length - 1];
      const inside = sidebar.contains(document.activeElement);
      if (e.shiftKey && (document.activeElement === first || !inside)) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && (document.activeElement === last || !inside)) { e.preventDefault(); first.focus(); }
    }
  });
  sidebar.addEventListener("click", (e) => {
    const toggle = e.target.closest(".sb-toggle");
    if (toggle) return setExpanded(toggle, toggle.getAttribute("aria-expanded") !== "true");
    if (e.target.closest(".sb-close")) return closeDrawer(true);
    // Choosing a page closes the drawer; the router then moves focus to the new page's heading.
    if (e.target.closest("a[href]")) closeDrawer(false);
  });
  wideQuery.addEventListener("change", () => { open = false; backdrop.classList.remove("is-open"); backdrop.hidden = true; sync(); });
  document.addEventListener("ss:route", (e) => { route = e.detail.route; highlight(); });
  document.addEventListener("ss:xp", (e) => updatePower(e.detail));

  render();
  sync();
  SS.nav = { open: openDrawer, close: closeDrawer, refresh: () => { render(); highlight(); } };
})();
