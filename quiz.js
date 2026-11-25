/* Super Science: "Test yourself" quiz, shared by every concept.
 *
 * Questions live in questions/<concept>.js as plain data:
 *   { id, question, options: [4 strings], correct: <index 0-3>, explanation }
 */
(function () {
  /* ---------- Logic (no screen code, so it can be tested in Node) ---------- */

  // THE answer check. Every answer in the app goes through here, so this is the
  // one place to add points / power levels later.
  function checkAnswer(question, chosenIndex) {
    return {
      correct: chosenIndex === question.correct,
      correctIndex: question.correct,
      explanation: question.explanation,
    };
  }

  // Random order without changing the original list (Fisher–Yates shuffle).
  function shuffle(list) {
    const copy = list.slice();
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  function scoreMessage(score, total) {
    if (score === total) return "Perfect score! You've nailed this one.";
    if (score >= total - 1) return "So close! One more go for full marks?";
    if (score >= total / 2) return "Nice work. Play with the graph above, then try again.";
    return "Have another play with the sliders above, then give it another go.";
  }

  if (typeof module !== "undefined" && module.exports) {
    module.exports = { checkAnswer, shuffle, scoreMessage };
  }
  if (typeof window === "undefined" || !window.SuperScience) return;

  /* ---------- Screen ---------- */
  const SS = window.SuperScience;
  const esc = SS.escapeHTML;
  const LETTERS = ["A", "B", "C", "D"];
  SS.checkAnswer = checkAnswer;

  // Adds the quiz card to `parent` for this concept (if it has questions).
  SS.renderQuiz = function (parent, conceptId) {
    const all = SS.questions[conceptId];
    if (!all || !all.length) return;

    const card = document.createElement("section");
    card.className = "quiz";
    card.setAttribute("aria-labelledby", "quiz-title");
    card.innerHTML = `<h2 class="quiz-title" id="quiz-title">Test yourself</h2><div class="quiz-body"></div>`;
    parent.appendChild(card);
    const body = card.querySelector(".quiz-body");

    let order, index, score, results;

    function start() {
      order = shuffle(all);
      index = 0;
      score = 0;
      results = [];
      showQuestion();
    }

    function dots() {
      return order.map((_, k) => {
        const state = k < results.length ? (results[k] ? "right" : "wrong") : k === index ? "now" : "";
        return `<i class="quiz-dot ${state}"></i>`;
      }).join("");
    }

    function showQuestion() {
      const q = order[index];
      body.innerHTML = `
        <div class="quiz-progress">
          <span>Question ${index + 1} of ${order.length}</span>
          <span class="quiz-dots" aria-hidden="true">${dots()}</span>
        </div>
        <p class="quiz-q" id="quiz-q">${esc(q.question)}</p>
        <div class="quiz-options" role="group" aria-labelledby="quiz-q">
          ${q.options.map((opt, k) => `
            <button type="button" class="quiz-option" data-k="${k}">
              <span class="quiz-letter" aria-hidden="true">${LETTERS[k]}</span>
              <span class="quiz-text">${esc(opt)}</span>
            </button>`).join("")}
        </div>
        <div class="quiz-feedback" aria-live="polite"></div>`;
      body.querySelectorAll(".quiz-option").forEach((btn) => {
        btn.addEventListener("click", () => answer(Number(btn.dataset.k)));
      });
    }

    function answer(chosen) {
      const q = order[index];
      const result = checkAnswer(q, chosen);
      results.push(result.correct);
      if (result.correct) score++;

      // XP: pays only the first time this question is ever answered correctly.
      const chosenBtn = body.querySelector(`.quiz-option[data-k="${chosen}"]`);
      const xp = result.correct && SS.xp ? SS.xp.award({ type: "correctAnswer", questionId: q.id }, chosenBtn) : null;
      const xpNote = !xp ? "" : xp.total > 0
        ? `<p class="quiz-xp gain">+${xp.total} XP</p>`
        : `<p class="quiz-xp">XP already collected for this question.</p>`;

      body.querySelectorAll(".quiz-option").forEach((btn, k) => {
        btn.disabled = true;
        if (k === result.correctIndex) btn.classList.add("is-correct");
        else if (k === chosen) btn.classList.add("is-wrong");
        else btn.classList.add("is-faded");
      });
      body.querySelector(".quiz-dots").innerHTML = dots();

      const last = index === order.length - 1;
      const feedback = body.querySelector(".quiz-feedback");
      feedback.innerHTML = `
        <div class="quiz-result ${result.correct ? "right" : "wrong"}">
          <p class="quiz-verdict">${result.correct ? "✓ Correct!" : "✗ Not quite."}</p>
          <p class="quiz-explain">${esc(result.explanation)}</p>
          ${xpNote}
        </div>
        <button type="button" class="btn btn-next">${last ? "See my score" : "Next →"}</button>`;

      const next = feedback.querySelector(".btn-next");
      next.addEventListener("click", () => {
        if (last) showScore();
        else { index++; showQuestion(); }
        keepTopVisible();
      });
      next.focus({ preventScroll: true });
      next.scrollIntoView({ block: "nearest" }); // make sure Next is on screen
    }

    // If the top of the quiz has scrolled off screen, bring it back into view.
    function keepTopVisible() {
      if (card.getBoundingClientRect().top < 0) {
        const smooth = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        card.scrollIntoView({ block: "start", behavior: smooth ? "smooth" : "auto" });
      }
    }

    function showScore() {
      body.innerHTML = `
        <div class="quiz-end" aria-live="polite">
          <span class="quiz-dots" aria-hidden="true">${dots()}</span>
          <p class="quiz-score"><b>${score}</b>/${order.length}</p>
          <p class="quiz-message">${esc(scoreMessage(score, order.length))}</p>
          <button type="button" class="btn btn-retry">Try again</button>
        </div>`;
      // XP: perfect-score bonus, once per concept.
      if (score === order.length && SS.xp) {
        const xp = SS.xp.award({ type: "perfectScore", conceptId }, body.querySelector(".quiz-score"));
        body.querySelector(".quiz-message").insertAdjacentHTML("afterend", xp.total > 0
          ? `<p class="quiz-xp gain">Perfect bonus: +${xp.total} XP</p>`
          : `<p class="quiz-xp">Perfect bonus already collected.</p>`);
      }
      const retry = body.querySelector(".btn-retry");
      retry.addEventListener("click", () => {
        start();
        keepTopVisible();
        body.querySelector(".quiz-option").focus({ preventScroll: true });
      });
      retry.focus({ preventScroll: true });
    }

    start();
  };
})();
