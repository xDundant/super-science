/* Super Science: Minigames hub (#games).
 * Shows a card for every game registered with SuperScience.registerGame().
 * Games that aren't built yet are registered here with status "soon".
 */
(function () {
  const SS = window.SuperScience;
  const esc = SS.escapeHTML;

  // Coming soon (cards only, no game yet)
  [
    { id: "predict", icon: "🔮", title: "Predict & Reveal", description: "Guess what happens next, then watch the simulation." },
    { id: "match-graph", icon: "📈", title: "Match the Graph", description: "Drag the sliders until your curve matches the target." },
    { id: "estimate", icon: "🎯", title: "Estimate It", description: "No calculator: how close can your gut feeling get?" },
    { id: "mistake", icon: "🕵️", title: "Spot the Mistake", description: "One step in the working is wrong. Can you find it?" },
  ].forEach((g) => SS.registerGame(Object.assign({ status: "soon" }, g)));

  // "Best: 7/8 (Physics)", from the saved best scores
  function bestText(game) {
    const best = SS.xp && SS.xp.state.minigames && SS.xp.state.minigames[game.id] && SS.xp.state.minigames[game.id].best;
    if (!best || !Object.keys(best).length) return "";
    const [subject, score] = Object.entries(best).sort((a, b) => b[1] - a[1])[0];
    return `Best: ${score}/${game.maxScore || 8} (${subject})`;
  }

  SS.renderGamesHub = function (section) {
    const live = SS.games.filter((g) => g.status === "live");
    const soon = SS.games.filter((g) => g.status !== "live");
    section.insertAdjacentHTML("beforeend", `
      <p class="intro">Quick games to test what you know. Correct answers earn XP (up to a daily limit).</p>
      <ul class="cards game-cards">
        ${live.map((g) => `
          <li>
            <a class="card game-card" href="#games/${g.id}">
              <span class="game-icon" aria-hidden="true">${g.icon}</span>
              <span class="card-title">${esc(g.title)}</span>
              <span class="card-desc">${esc(g.description)}</span>
              <span class="game-best">${esc(bestText(g))}</span>
              <span class="card-go" aria-hidden="true">Play →</span>
            </a>
          </li>`).join("")}
        ${soon.map((g) => `
          <li>
            <div class="card game-card is-soon" aria-disabled="true">
              <span class="game-icon" aria-hidden="true">${g.icon}</span>
              <span class="card-title">${esc(g.title)}</span>
              <span class="card-desc">${esc(g.description)}</span>
              <span class="soon-badge">Coming soon</span>
            </div>
          </li>`).join("")}
      </ul>`);
  };
})();
