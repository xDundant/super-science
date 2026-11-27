/* Questions: Pendulum (g = 9.8 m/s²)
 * Numeric answers are re-calculated in tests/checks/pendulum.js.
 */
(function () {
  const QUESTIONS = [
    {
      id: "pendulum-1m",
      question: "A 1 m pendulum with a small swing. What does T = 2π√(L/g) give?",
      options: ["1.00 s", "2.01 s", "6.28 s", "3.13 s"],
      correct: 1,
      difficulty: "expert",
      explanation: "2π × √(1 ÷ 9.8) = 6.283 × 0.319 ≈ 2.01 s. A 1 m pendulum takes about 2 s per full swing.",
    },
    {
      id: "pendulum-4x-length",
      question: "Make the string 4 times longer. The period…",
      options: ["Becomes 4 times longer", "Stays the same", "Halves", "Doubles"],
      correct: 3,
      difficulty: "medium",
      explanation: "T depends on √L, and √4 = 2, so the period doubles.",
    },
    {
      id: "pendulum-80-degrees",
      question: "Start the swing at 80°. Compared with the formula, the real period is…",
      options: ["Longer", "Shorter", "Exactly the same", "Zero"],
      correct: 0,
      difficulty: "hard",
      explanation: "At big angles the pull back (which depends on sin θ) is weaker than the formula assumes, so the real swing takes longer, about 13% longer at 80°.",
    },
    {
      id: "pendulum-approximation",
      question: "The formula T = 2π√(L/g) relies on which approximation?",
      options: ["cos θ ≈ 1 − θ", "g ≈ 10", "sin θ ≈ θ", "θ ≈ 0"],
      correct: 2,
      difficulty: "hard",
      explanation: "It replaces sin θ with θ (in radians), the first term of the Taylor series for sin. That's very accurate for small angles only.",
    },
    {
      id: "pendulum-mass",
      question: "Does making the bob heavier change the period?",
      options: ["Yes, heavier swings faster", "No, the mass cancels out", "Yes, heavier swings slower", "Only at big angles"],
      correct: 1,
      difficulty: "medium",
      explanation: "A heavier bob feels more gravity but is also harder to speed up, so the two effects cancel. Mass isn't in the formula at all.",
    },
  ];

  if (typeof module !== "undefined" && module.exports) module.exports = QUESTIONS;
  if (typeof window !== "undefined" && window.SuperScience) window.SuperScience.addQuestions("pendulum", QUESTIONS);
})();
