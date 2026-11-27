/* Questions: the pH scale (25 °C)
 * Numeric answers are re-calculated in tests/checks/ph.js.
 */
(function () {
  const QUESTIONS = [
    {
      id: "ph-h-at-3",
      question: "Set pH to 3. What is the concentration of H⁺ ions?",
      options: ["3 mol/L", "1 × 10⁻³ mol/L", "1 × 10³ mol/L", "3 × 10⁻¹ mol/L"],
      correct: 1,
      difficulty: "hard",
      explanation: "[H⁺] = 10^(−pH) = 10⁻³ = 0.001 mol/L.",
    },
    {
      id: "ph-2-vs-5",
      question: "How many times more H⁺ ions does a pH 2 solution have than a pH 5 solution?",
      options: ["3×", "10×", "100×", "1000×"],
      correct: 3,
      difficulty: "hard",
      explanation: "3 steps on the pH scale, and each step is 10 times more: 10 × 10 × 10 = 1000.",
    },
    {
      id: "ph-poh",
      question: "A solution has pH 9. What is its pOH (at 25 °C)?",
      options: ["5", "9", "14", "23"],
      correct: 0,
      difficulty: "medium",
      explanation: "pH + pOH = 14 at 25 °C, so pOH = 14 − 9 = 5.",
    },
    {
      id: "ph-bleach",
      question: "Bleach has a pH of about 12.5. Bleach is…",
      options: ["Acidic", "Neutral", "Basic (alkaline)", "Impossible to tell"],
      correct: 2,
      difficulty: "easy",
      explanation: "Anything above pH 7 is basic (alkaline). At 12.5 bleach is strongly basic.",
    },
    {
      id: "ph-neutral",
      question: "At pH 7 (25 °C), how do [H⁺] and [OH⁻] compare?",
      options: ["More H⁺", "They're equal", "More OH⁻", "Both are zero"],
      correct: 1,
      difficulty: "medium",
      explanation: "At pH 7 both are 10⁻⁷ mol/L. That's what neutral means.",
    },
  ];

  if (typeof module !== "undefined" && module.exports) module.exports = QUESTIONS;
  if (typeof window !== "undefined" && window.SuperScience) window.SuperScience.addQuestions("ph", QUESTIONS);
})();
