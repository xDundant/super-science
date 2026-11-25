/* Questions: Euler's number e (compound interest)
 * Each question: id, question, options (4), correct (index 0-3), explanation.
 * Numeric answers are re-calculated in tests/checks/euler-e.js.
 */
(function () {
  const QUESTIONS = [
    {
      id: "euler-e-yearly",
      question: "$1 at 100% interest, paid once at the end of the year. How much do you have?",
      options: ["$1.00", "$2.00", "$2.72", "$2.25"],
      correct: 1,
      explanation: "One payment of 100% doubles your money: (1 + 1/1)¹ = $2.",
    },
    {
      id: "euler-e-twice",
      question: "Set compounding to twice a year (50% each half-year). What does $1 become?",
      options: ["$2.00", "$2.50", "$2.25", "$3.00"],
      correct: 2,
      explanation: "After 6 months you have $1.50, then 50% more of that: 1.5 × 1.5 = (1 + 1/2)² = $2.25.",
    },
    {
      id: "euler-e-monthly",
      question: "Compounding monthly (n = 12), what does $1 become, to the nearest cent?",
      options: ["$2.61", "$2.59", "$2.72", "$2.70"],
      correct: 0,
      explanation: "(1 + 1/12)¹² ≈ 2.613. Monthly is better than yearly ($2), but it's still short of e.",
    },
    {
      id: "euler-e-daily",
      question: "Compounding daily (n = 365), what does $1 become, to the nearest cent?",
      options: ["$3.65", "$2.71", "$2.65", "$2.72"],
      correct: 1,
      explanation: "(1 + 1/365)³⁶⁵ ≈ 2.7146. Going from monthly to daily only adds about 10 cents.",
    },
    {
      id: "euler-e-limit",
      question: "As the compounding gets more and more frequent, the total gets closer and closer to…",
      options: ["Infinity", "π ≈ 3.142", "e ≈ 2.718", "$3"],
      correct: 2,
      explanation: "The payments get smaller as they get more frequent, so the total levels off at e ≈ 2.71828 instead of growing forever.",
    },
  ];

  if (typeof module !== "undefined" && module.exports) module.exports = QUESTIONS;
  if (typeof window !== "undefined" && window.SuperScience) window.SuperScience.addQuestions("euler-e", QUESTIONS);
})();
