/* Questions: Natural selection (simplified model)
 * Numeric answers are re-calculated in tests/checks/natural-selection.js.
 */
(function () {
  const QUESTIONS = [
    {
      id: "natural-selection-dark-bark",
      question: "Start with mostly light bugs on DARK bark, predator pressure 60%. After 30 generations the bugs are mostly…",
      options: ["Light", "Dark", "Exactly half and half", "All eaten"],
      correct: 1,
      explanation: "Light bugs stand out on dark bark and get eaten more. Dark survivors pass on their colour, so dark bugs take over.",
    },
    {
      id: "natural-selection-no-pressure",
      question: "Set predator pressure to 0%. What happens to the mix of colours?",
      options: ["It quickly turns all dark", "It quickly turns all light", "Every bug is eaten", "It stays roughly the same, drifting only by chance"],
      correct: 3,
      explanation: "With no predators neither colour has an advantage, so there's no selection. The mix only wanders randomly (and through rare mutations).",
    },
    {
      id: "natural-selection-individuals",
      question: "Do individual bugs change colour to match the bark?",
      options: ["Yes, within a day", "No, the population changes because survivors pass on their colour", "Yes, if they're scared", "Only the dark ones do"],
      correct: 1,
      explanation: "Each bug keeps its colour for life. What changes is which bugs survive to have babies, so the population shifts over generations.",
    },
    {
      id: "natural-selection-eaten",
      question: "Predator pressure is 50%. Of 20 light bugs on dark bark, how many are eaten on average?",
      options: ["10", "20", "0", "5"],
      correct: 0,
      explanation: "Light bugs stand out on dark bark, so each has a 50% chance of being eaten: 20 × 0.5 = 10 on average.",
    },
    {
      id: "natural-selection-mutations",
      question: "Each baby has a 2% chance of a colour mutation. In 50 babies, how many mutants do you expect on average?",
      options: ["2", "25", "1", "0"],
      correct: 2,
      explanation: "50 × 0.02 = 1. Mutations are rare, but they supply new variety for selection to act on.",
    },
  ];

  if (typeof module !== "undefined" && module.exports) module.exports = QUESTIONS;
  if (typeof window !== "undefined" && window.SuperScience) window.SuperScience.addQuestions("natural-selection", QUESTIONS);
})();
