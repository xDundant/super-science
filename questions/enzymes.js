/* Questions: Enzyme activity (simplified model)
 * Numeric answers are re-calculated in tests/checks/enzymes.js.
 */
(function () {
  const QUESTIONS = [
    {
      id: "enzymes-optimum",
      question: "Amylase at its best conditions (37 °C, pH 7). What is its relative activity?",
      options: ["50%", "100%", "37%", "70%"],
      correct: 1,
      explanation: "At the optimum temperature and pH the enzyme works as fast as it can: 100% relative activity.",
    },
    {
      id: "enzymes-cooler",
      question: "In this model, cooling amylase from 37 °C to 27 °C makes it work at about…",
      options: ["0%", "90%", "100%", "50%"],
      correct: 3,
      explanation: "Below the optimum, activity roughly halves for every 10 °C cooler: about 50%. It's slower, but not damaged.",
    },
    {
      id: "enzymes-pepsin-ph",
      question: "Pepsin works in the stomach. At which pH does it work best?",
      options: ["2", "7", "10", "14"],
      correct: 0,
      explanation: "The stomach is very acidic, and pepsin is adapted to it: its optimum is about pH 2.",
    },
    {
      id: "enzymes-denatured",
      question: "Amylase is heated to 60 °C, then cooled back to 37 °C. What is its activity now?",
      options: ["Back to 100%", "About 50%", "Higher than before", "Still about 0%: it's denatured"],
      correct: 3,
      explanation: "60 °C changed the enzyme's shape permanently (denatured). Cooling it down doesn't bring the shape back.",
    },
    {
      id: "enzymes-pepsin-neutral",
      question: "Pepsin at 37 °C but pH 7. Its activity is about…",
      options: ["100%", "50%", "0%", "25%"],
      correct: 2,
      explanation: "pH 7 is far from pepsin's optimum of pH 2, so it barely works at all: about 0%.",
    },
  ];

  if (typeof module !== "undefined" && module.exports) module.exports = QUESTIONS;
  if (typeof window !== "undefined" && window.SuperScience) window.SuperScience.addQuestions("enzymes", QUESTIONS);
})();
