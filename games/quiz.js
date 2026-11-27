/* Minigame: 3-Second Quiz (#games/quiz)
 * 8 questions from the concept question banks, 2 per tier (🟢 easy, 🟡 medium, 🟠 hard, 🔴 expert).
 * Each question has 3 seconds; no answer in time counts as wrong.
 */
(function () {
  /* ---------- Game rules (no screen code, so they can be tested in Node) ---------- */
  const TIERS = [
    { id: "easy", emoji: "🟢", name: "Easy" },
    { id: "medium", emoji: "🟡", name: "Medium" },
    { id: "hard", emoji: "🟠", name: "Hard" },
    { id: "expert", emoji: "🔴", name: "Expert" },
  ];
  const SUBJECTS = ["Maths", "Physics", "Chemistry", "Biology", "Mixed"];
  const PER_TIER = 2;
  const LIMIT_MS = 3000;

  function shuffle(list, random) {
    const a = list.slice();
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  }

  // Pick 2 questions per tier, easiest first. If a tier runs out, take from the nearest
  // tier (the easier one first on a tie). Never the same question twice in a game.
  // Returns [{ question, tier }] where tier is the slot it fills (0 = easy ... 3 = expert).
  function pickQuestions(pool, random) {
    const piles = TIERS.map((t) => shuffle(pool.filter((q) => q.difficulty === t.id), random));
    const picked = [];
    TIERS.forEach((_, slot) => {
      for (let k = 0; k < PER_TIER; k++) {
        const order = [0, 1, 2, 3].sort((a, b) => Math.abs(a - slot) - Math.abs(b - slot) || a - b);
        const from = order.find((t) => piles[t].length);
        if (from !== undefined) picked.push({ question: piles[from].pop(), tier: slot });
      }
    });
    return picked;
  }

  // Was this answer right? An answer at or after the 3-second limit (or no answer at all,
  // chosen = null) counts as wrong. Times are in milliseconds.
  function judge(question, chosen, startedAt, answeredAt, limit = LIMIT_MS) {
    const timedOut = chosen === null || answeredAt - startedAt >= limit;
    return { correct: !timedOut && chosen === question.correct, timedOut };
  }
  const timeLeft = (startedAt, now, limit = LIMIT_MS) => Math.max(0, limit - (now - startedAt));

  // Highest tier with at least one correct answer (-1 if none)
  function tierReached(results) {
    return results.reduce((best, r) => (r.correct ? Math.max(best, r.tier) : best), -1);
  }

  function rankMessage(score, total = 8) {
    if (score === total) return "Perfect! Science legend 🏆";
    if (score >= total - 2) return "Brilliant! You really know your stuff 🔥";
    if (score >= total / 2) return "Solid! A few more and you're unstoppable ⚡";
    if (score >= 2) return "Warming up! Have a play with the concepts and try again 💡";
    return "Tough round! Every expert started somewhere 🌱";
  }

  function shareText(subject, score, total, link) {
    const name = subject === "Mixed" ? "Super Science Mixed Quiz" : `Super Science ${subject} Quiz`;
    return `I got ${score}/${total} on the ${name} 🔥 Can you beat me? ${link}`;
  }

  if (typeof module !== "undefined" && module.exports) {
    module.exports = { TIERS, SUBJECTS, PER_TIER, LIMIT_MS, shuffle, pickQuestions, judge, timeLeft, tierReached, rankMessage, shareText };
  }
  if (typeof window === "undefined" || !window.SuperScience) return;

  /* ---------- On screen ---------- */
  const SS = window.SuperScience;
  const esc = SS.escapeHTML;
  const LETTERS = ["A", "B", "C", "D"];

  // All questions for a subject ("Mixed" = everything). A question's concept is the start of its id.
  function poolFor(subject) {
    const all = [];
    for (const [conceptId, list] of Object.entries(SS.questions)) {
      const concept = SS.concepts.find((c) => c.id === conceptId);
      if (concept && (subject === "Mixed" || concept.tag === subject)) all.push(...list);
    }
    return all;
  }

  // Copy text, with a fallback for older browsers. Resolves true if it worked.
  async function copyText(text) {
    try { await navigator.clipboard.writeText(text); return true; } catch (e) { /* try the old way */ }
    try {
      const t = document.createElement("textarea");
      t.value = text; t.setAttribute("readonly", ""); t.style.position = "fixed"; t.style.opacity = "0";
      document.body.appendChild(t); t.select();
      const ok = document.execCommand("copy");
      t.remove();
      return ok;
    } catch (e) { return false; }
  }

  // Wait using animation frames (no setTimeout). Returns a cancel function.
  function after(seconds, fn) {
    let waited = 0;
    return SS.loop((dt) => { waited += dt; if (waited >= seconds) { fn(); return false; } });
  }

  SS.registerGame({
    id: "quiz",
    icon: "⏱️",
    title: "3-Second Quiz",
    description: "8 questions, 3 seconds each, from easy to expert. How far can you climb?",
    status: "live",
    maxScore: 8,

    render(root) {
      const box = document.createElement("div");
      box.className = "q3";
      root.appendChild(box);
      let stopTimer = null, stopWait = null, subject = null, rounds = [], results = [], index = 0;
      const stopAll = () => { if (stopTimer) stopTimer(); if (stopWait) stopWait(); stopTimer = stopWait = null; };

      /* ----- 1. Pick a subject ----- */
      function showSubjects() {
        stopAll();
        const best = (SS.xp && SS.xp.state.minigames.quiz.best) || {};
        const left = SS.xp ? SS.xp.minigameXPLeft() : 0;
        box.innerHTML = `
          <p class="q3-lead">Pick a subject. You'll get <b>8 questions</b>, two from each tier:
            <span class="q3-tiers">${TIERS.map((t) => `${t.emoji} ${t.name}`).join(" · ")}</span>
            You have <b>3 seconds</b> for each one, and no pausing!</p>
          <div class="q3-subjects">
            ${SUBJECTS.map((s) => `
              <button type="button" class="q3-subject" data-subject="${s}">
                <span>${s}</span>
                <small>${best[s] !== undefined ? `Best ${best[s]}/8` : "Not played yet"}</small>
              </button>`).join("")}
          </div>
          <p class="note">${left > 0 ? `Minigame XP left today: ${left}` : "Daily XP cap reached, you can still play for fun."}</p>`;
        box.querySelectorAll(".q3-subject").forEach((b) => b.addEventListener("click", () => start(b.dataset.subject)));
        box.querySelector(".q3-subject").focus({ preventScroll: true });
      }

      /* ----- 2. Play ----- */
      function start(s) {
        subject = s;
        rounds = pickQuestions(poolFor(s), Math.random);
        results = [];
        index = 0;
        showQuestion();
      }

      function showQuestion() {
        stopAll();
        const { question: q, tier } = rounds[index];
        const t = TIERS[tier];
        box.innerHTML = `
          <div class="q3-top">
            <span class="q3-tier tier-${t.id}">${t.emoji} ${t.name}</span>
            <span class="q3-count">Question ${index + 1} of ${rounds.length}</span>
          </div>
          <div class="q3-timer" role="timer" aria-label="3 second timer"><span class="q3-timer-fill"></span></div>
          <p class="quiz-q" id="q3-q">${esc(q.question)}</p>
          <div class="quiz-options" role="group" aria-labelledby="q3-q">
            ${q.options.map((opt, k) => `
              <button type="button" class="quiz-option" data-k="${k}">
                <span class="quiz-letter" aria-hidden="true">${LETTERS[k]}</span><span class="quiz-text">${esc(opt)}</span>
              </button>`).join("")}
          </div>
          <p class="q3-feedback" aria-live="assertive"></p>`;
        const fill = box.querySelector(".q3-timer-fill");
        const startedAt = performance.now();
        let done = false;

        function finish(chosen) {
          if (done) return;
          done = true;
          if (stopTimer) { stopTimer(); stopTimer = null; }
          const r = judge(q, chosen, startedAt, performance.now());
          results.push({ correct: r.correct, timedOut: r.timedOut, tier });
          box.querySelectorAll(".quiz-option").forEach((btn, k) => {
            btn.disabled = true;
            if (k === q.correct) btn.classList.add("is-correct");
            else if (k === chosen) btn.classList.add("is-wrong");
            else btn.classList.add("is-faded");
          });
          const fb = box.querySelector(".q3-feedback");
          fb.textContent = r.correct ? "✓ Correct!" : r.timedOut ? "⏰ Time's up!" : "✗ Not quite";
          fb.className = "q3-feedback " + (r.correct ? "right" : "wrong");
          if (window.SFX) (r.correct ? SFX.playCorrect() : SFX.playWrong());
          stopWait = after(r.correct ? 0.7 : 1.1, () => {
            stopWait = null;
            index++;
            if (index < rounds.length) showQuestion(); else showResults();
          });
        }

        box.querySelectorAll(".quiz-option").forEach((btn) => btn.addEventListener("click", () => finish(Number(btn.dataset.k))));
        // The bar shrinks every frame from the real clock, so it can't be paused.
        stopTimer = SS.loop(() => {
          const left = timeLeft(startedAt, performance.now());
          fill.style.transform = `scaleX(${(left / LIMIT_MS).toFixed(4)})`;
          fill.classList.toggle("hurry", left < 1000);
          if (left <= 0) { stopTimer = null; finish(null); return false; }
        });
        box.querySelector(".quiz-option").focus({ preventScroll: true });
      }

      /* ----- 3. Results ----- */
      function showResults() {
        stopAll();
        const score = results.filter((r) => r.correct).length;
        const total = rounds.length;
        const reached = tierReached(results);
        const link = `${location.origin}${location.pathname}#games/quiz`;
        const text = shareText(subject, score, total, link);
        box.innerHTML = `
          <div class="q3-end">
            <span class="quiz-dots" aria-hidden="true">${results.map((r) => `<i class="quiz-dot ${r.correct ? "right" : "wrong"}"></i>`).join("")}</span>
            <p class="quiz-score"><b>${score}</b>/${total}</p>
            <p class="quiz-message">${esc(rankMessage(score, total))}</p>
            <p class="q3-reached">${reached >= 0 ? `Tier reached: ${TIERS[reached].emoji} <b>${TIERS[reached].name}</b>` : "Tier reached: none yet. Keep going!"}</p>
            <p class="q3-xp" aria-live="polite"></p>
            <div class="btn-row">
              <button type="button" class="btn" data-act="copy">Copy my score</button>
              <button type="button" class="btn-secondary" data-act="again">Play again</button>
              <button type="button" class="btn-secondary" data-act="subjects">Change subject</button>
            </div>
            <p class="q3-share" hidden></p>
          </div>`;

        // XP and best score (capped per day; see xp/config.js)
        const xpLine = box.querySelector(".q3-xp");
        if (SS.xp) {
          const r = SS.xp.recordMinigame({ game: "quiz", subject, score, total }, box.querySelector(".quiz-score"));
          const parts = [];
          if (r.paid > 0) parts.push(`+${r.paid} XP`);
          if (r.capped) parts.push("Daily XP cap reached, you can still play for fun.");
          else if (r.paid === 0) parts.push("No XP this time: get some right to earn XP!");
          if (r.newBest && r.previousBest !== null) parts.push(`New best for ${subject}! (was ${r.previousBest}/8)`);
          else if (r.newBest) parts.push(`First score for ${subject} saved.`);
          xpLine.textContent = parts.join(" · ");
        }

        const copyBtn = box.querySelector('[data-act="copy"]');
        copyBtn.addEventListener("click", async () => {
          const ok = await copyText(text);
          copyBtn.textContent = ok ? "Copied! ✓" : "Copy this:";
          const share = box.querySelector(".q3-share");
          share.textContent = text;
          share.hidden = ok; // if copying failed, show the text so it can be copied by hand
        });
        box.querySelector('[data-act="again"]').addEventListener("click", () => start(subject));
        box.querySelector('[data-act="subjects"]').addEventListener("click", showSubjects);
        box.querySelector('[data-act="copy"]').focus({ preventScroll: true });
      }

      showSubjects();
      return stopAll;
    },
  });
})();
