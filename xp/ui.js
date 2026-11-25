/* Super Science: XP on screen.
 *   - Power Level bar in the header (every page)
 *   - floating "+10 XP" popups
 *   - "POWER UP!" level-up banner (+ short vibration where supported)
 *   - Profile screen (#profile): stats, aura picker, reset
 * Other code earns XP by calling SuperScience.xp.award({ type, ... }, elementToPopFrom).
 */
(function () {
  const SS = window.SuperScience;
  const Engine = window.SuperScienceXPEngine;
  const Storage = window.SuperScienceXPStorage;
  const C = Engine.CONFIG;
  const esc = SS.escapeHTML;

  const reduceMotion = () => !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  const auraOf = (id) => C.auras.find((a) => a.id === id) || C.auras[0];

  let state = Storage.load();
  const canSave = Storage.save(state); // false if the browser blocks storage

  const bar = document.getElementById("power");
  const live = document.createElement("p"); // read out by screen readers
  live.className = "sr-only";
  live.setAttribute("aria-live", "polite");
  document.body.appendChild(live);
  const announce = (text) => { live.textContent = ""; setTimeout(() => { live.textContent = text; }, 50); };

  function applyAura(el) {
    const aura = auraOf(state.chosenAura);
    el.style.setProperty("--aura", aura.color);
    el.style.setProperty("--aura-glow", aura.glow);
  }

  /* ---------- Header Power Level bar ---------- */
  function renderBar() {
    if (!bar) return;
    const info = Engine.levelInfo(state.xp);
    const streak = Engine.currentStreak(state);
    applyAura(bar);
    bar.innerHTML = `
      <span class="power-rank">${esc(info.rank)}</span>
      <span class="power-level">Lv <b>${info.level}</b></span>
      <span class="power-track" aria-hidden="true"><span class="power-fill" style="width:${(info.progress * 100).toFixed(1)}%"></span></span>
      <span class="power-xp">${info.maxed ? "MAX" : `${info.xpIntoLevel}/${info.xpForNextLevel}`}</span>
      <span class="power-streak${streak ? "" : " is-cold"}" title="Day streak">🔥 ${streak}</span>`;
    bar.setAttribute("aria-label",
      `Power level: ${info.rank}, level ${info.level}. ` +
      (info.maxed ? "Max level. " : `${info.xpIntoLevel} of ${info.xpForNextLevel} XP to the next level. `) +
      `${streak} day streak. Open profile.`);
  }

  /* ---------- Floating "+10 XP" ---------- */
  function popups(gains, anchor) {
    const from = anchor && anchor.isConnected ? anchor : bar;
    if (!from) return;
    const rect = from.getBoundingClientRect();
    const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
    gains.forEach((gain, i) => {
      const pop = document.createElement("div");
      pop.className = "xp-pop" + (gain.streak ? " xp-pop--streak" : "");
      pop.setAttribute("aria-hidden", "true");
      pop.textContent = gain.streak ? `🔥 +${gain.amount} XP streak` : `+${gain.amount} XP`;
      pop.style.left = clamp(rect.left + rect.width / 2, 70, window.innerWidth - 70) + "px";
      pop.style.top = clamp(rect.top + 6, 60, window.innerHeight - 20) + "px";
      pop.style.animationDelay = i * 0.55 + "s"; // one after another, same spot, floating up
      document.body.appendChild(pop);
      setTimeout(() => pop.remove(), 1600 + i * 550);
    });
  }

  /* ---------- Level-up banner ---------- */
  function levelUp(result) {
    const old = document.querySelector(".levelup");
    if (old) old.remove();
    const info = Engine.levelInfo(state.xp);

    const banner = document.createElement("div");
    banner.className = "levelup";
    banner.setAttribute("role", "status");
    banner.innerHTML = `
      <div class="levelup-card">
        <p class="levelup-title">POWER UP!</p>
        <p class="levelup-level">Level ${result.newLevel}</p>
        <p class="levelup-rank">${result.newRank ? "New rank: " : ""}${esc(info.rank)}</p>
        ${result.newAuras.map((a) => `
          <p class="levelup-aura"><i class="aura-dot" style="--c:${a.color}"></i> ${esc(a.name)} aura unlocked! Pick it in your Profile.</p>`).join("")}
        <p class="levelup-hint">Tap to continue</p>
      </div>`;
    document.body.appendChild(banner);

    if (bar) {
      bar.classList.remove("is-charged");
      void bar.offsetWidth; // restart the glow animation
      bar.classList.add("is-charged");
      setTimeout(() => bar.classList.remove("is-charged"), 1800);
    }
    // Short buzz, only where supported and after the visitor has tapped the page (browsers require that).
    try {
      const tapped = !navigator.userActivation || navigator.userActivation.hasBeenActive;
      if (navigator.vibrate && tapped) navigator.vibrate([70, 50, 120]);
    } catch (e) { /* not supported */ }

    let closed = false;
    function close() {
      if (closed) return;
      closed = true;
      document.removeEventListener("keydown", onKey);
      banner.classList.add("is-leaving");
      setTimeout(() => banner.remove(), reduceMotion() ? 0 : 280);
    }
    function onKey(e) { if (e.key === "Escape" || e.key === "Enter" || e.key === " ") close(); }
    banner.addEventListener("click", close);
    document.addEventListener("keydown", onKey);
    setTimeout(close, 3600);
  }

  /* ---------- Earning XP ---------- */
  function award(event, anchor) {
    const result = Engine.award(state, event, new Date());
    if (result.total > 0) {
      state = result.state;
      Storage.save(state);
      renderBar();
      popups(result.gains, anchor);
      let msg = `Plus ${result.total} XP.`;
      if (result.leveledUp) msg += ` Power up! Level ${result.newLevel}.`;
      announce(msg);
      if (result.leveledUp) setTimeout(() => levelUp(result), reduceMotion() ? 0 : 450);
    }
    return result;
  }

  /* ---------- Profile screen ---------- */
  function renderProfile(root) {
    const info = Engine.levelInfo(state.xp);
    const streak = Engine.currentStreak(state);
    const today = Engine.dateKey(new Date());
    const nextBonus = Engine.streakBonus(streak + 1);
    const streakTip = state.lastActiveDate === today
      ? `Come back tomorrow for a +${nextBonus} XP streak bonus.`
      : streak > 0
        ? `Earn XP today to keep your streak (+${nextBonus} XP).`
        : `Earn XP today to start a streak (+${Engine.streakBonus(1)} XP).`;

    const totalQuestions = Object.values(SS.questions).reduce((n, list) => n + list.length, 0);
    const quizConcepts = Object.keys(SS.questions).length;
    const allQuestionIds = new Set([].concat(...Object.values(SS.questions)).map((q) => q.id));
    const mastered = state.completedQuestions.filter((id) => allQuestionIds.has(id)).length;
    const explored = state.seenConcepts.filter((id) => SS.concepts.some((c) => c.id === id)).length;
    const perfect = state.perfectConcepts.filter((id) => SS.questions[id]).length;

    root.querySelectorAll(":scope > :not(.concept-title)").forEach((el) => el.remove());
    root.insertAdjacentHTML("beforeend", `
      <div class="profile-hero">
        <p class="profile-rank">${esc(info.rank)}</p>
        <p class="profile-level">Level <b>${info.level}</b></p>
        <div class="profile-track" aria-hidden="true"><span style="width:${(info.progress * 100).toFixed(1)}%"></span></div>
        <p class="profile-next">${info.maxed ? "Max level reached!" : `${info.xpIntoLevel} / ${info.xpForNextLevel} XP to Level ${info.level + 1}`}</p>
      </div>

      <div class="stats">
        <div class="stat"><span class="stat-label">Total XP</span><span class="stat-value">${state.xp}</span></div>
        <div class="stat"><span class="stat-label">Day streak</span><span class="stat-value">🔥 ${streak}</span></div>
        <div class="stat"><span class="stat-label">Rank</span><span class="stat-value">${esc(info.rank)}</span></div>
      </div>
      <p class="profile-note">${esc(streakTip)}</p>

      <div class="stats">
        <div class="stat"><span class="stat-label">Concepts explored</span><span class="stat-value">${explored}/${SS.concepts.length}</span></div>
        <div class="stat"><span class="stat-label">Questions mastered</span><span class="stat-value">${mastered}/${totalQuestions}</span></div>
        <div class="stat"><span class="stat-label">Perfect sets</span><span class="stat-value">${perfect}/${quizConcepts}</span></div>
      </div>

      <h3 class="profile-h">Aura</h3>
      <p class="profile-note">The glow colour of your Power Level bar.</p>
      <div class="aura-grid" role="radiogroup" aria-label="Aura colour">
        ${C.auras.map((a) => {
          const unlocked = state.unlockedAuras.includes(a.id);
          const chosen = state.chosenAura === a.id;
          return `
            <button type="button" class="aura-option" role="radio" data-aura="${a.id}"
              aria-checked="${chosen}" ${unlocked ? "" : "disabled"}>
              <i class="aura-dot" style="--c:${a.color}"></i>
              <span class="aura-name">${esc(a.name)}</span>
              <span class="aura-sub">${!unlocked ? `🔒 Unlocks at level ${a.level}` : chosen ? "✓ In use" : "Tap to use"}</span>
            </button>`;
        }).join("")}
      </div>

      <h3 class="profile-h">How to earn XP</h3>
      <ul class="xp-rules">
        <li><b>+${C.firstOpenConcept}</b> first time you open a concept</li>
        <li><b>+${C.firstCorrectQuestion}</b> first time you get a question right</li>
        <li><b>+${C.perfectScore}</b> first perfect score on a concept's questions</li>
        <li><b>+${C.streak.start}</b> daily streak bonus, +${C.streak.perDay} for each day in a row (up to +${C.streak.max})</li>
      </ul>
      <p class="profile-note">Each one pays once, so retaking a question you already got right earns 0 XP.</p>

      ${canSave ? "" : `<p class="profile-warn">This browser is blocking storage, so your progress will reset when you close the page.</p>`}

      <div class="reset">
        <button type="button" class="btn-outline-danger" data-act="reset">Reset progress</button>
        <div class="reset-confirm" hidden>
          <p><b>Reset everything?</b> This deletes all your XP, levels, streak and unlocked auras. It can't be undone.</p>
          <div class="reset-actions">
            <button type="button" class="btn-danger" data-act="confirm">Yes, reset</button>
            <button type="button" class="btn-ghost" data-act="cancel">Cancel</button>
          </div>
        </div>
      </div>`);

    applyAura(root.querySelector(".profile-hero"));

    root.querySelectorAll(".aura-option").forEach((btn) => {
      btn.addEventListener("click", () => {
        state = Engine.chooseAura(state, btn.dataset.aura);
        Storage.save(state);
        renderBar();
        renderProfile(root);
        root.querySelector(`.aura-option[data-aura="${btn.dataset.aura}"]`).focus();
        announce(`${auraOf(state.chosenAura).name} aura selected.`);
      });
    });

    const confirmBox = root.querySelector(".reset-confirm");
    const resetBtn = root.querySelector('[data-act="reset"]');
    resetBtn.addEventListener("click", () => {
      confirmBox.hidden = false;
      resetBtn.hidden = true;
      root.querySelector('[data-act="cancel"]').focus();
    });
    root.querySelector('[data-act="cancel"]').addEventListener("click", () => {
      confirmBox.hidden = true;
      resetBtn.hidden = false;
      resetBtn.focus();
    });
    root.querySelector('[data-act="confirm"]').addEventListener("click", () => {
      Storage.clear();
      state = Engine.freshState();
      renderBar();
      renderProfile(root);
      announce("Progress reset.");
      root.querySelector(".concept-title").focus();
    });
  }

  // Keep in step with other tabs, and refresh the streak when you come back to the app.
  window.addEventListener("storage", (e) => {
    if (e.key !== Storage.KEY) return;
    try { state = e.newValue ? Engine.normalizeState(JSON.parse(e.newValue)) : Engine.freshState(); } catch (err) { return; }
    renderBar();
  });
  document.addEventListener("visibilitychange", () => { if (!document.hidden) renderBar(); });
  window.addEventListener("hashchange", renderBar);

  SS.xp = {
    award,
    renderProfile,
    get state() { return state; },
  };
  renderBar();
})();
