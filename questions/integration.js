/* Questions: Integration as area
 * Numeric answers are re-calculated in tests/checks/integration.js.
 */
(function () {
  const QUESTIONS = [
    {
      id: "integration-exact",
      question: "What is the exact area under v = t² from t = 0 to t = 3?",
      options: ["27", "9", "3", "6"],
      correct: 1,
      explanation: "∫₀³ t² dt = 3³ ÷ 3 = 9. Because this is a speed-time graph, that's 9 metres travelled.",
    },
    {
      id: "integration-3-strips",
      question: "Set the slider to 3 strips. What do the left rectangles add up to?",
      options: ["5", "9", "14", "3"],
      correct: 0,
      explanation: "Strips 1 s wide with heights v(0), v(1), v(2) = 0, 1, 4. Total = 0 + 1 + 4 = 5.",
    },
    {
      id: "integration-1-strip",
      question: "With just 1 strip, what is the left-rectangle area?",
      options: ["9", "27", "0", "3"],
      correct: 2,
      explanation: "The single strip takes its height from the left edge, where v(0) = 0. So the area is 0. A very bad estimate!",
    },
    {
      id: "integration-6-strips",
      question: "With 6 strips (each 0.5 s wide), what do the rectangles add up to?",
      options: ["7.5", "6.875", "9", "5.625"],
      correct: 1,
      explanation: "0.5 × (0 + 0.25 + 1 + 2.25 + 4 + 6.25) = 0.5 × 13.75 = 6.875. Closer to 9, but still short.",
    },
    {
      id: "integration-too-small",
      question: "For this rising curve, left rectangles always give an answer that is…",
      options: ["Too big", "Exactly right", "Too small", "Negative"],
      correct: 2,
      explanation: "Each strip uses the speed at its left edge, the slowest point of that strip, so every strip sits under the curve.",
    },
  ];

  if (typeof module !== "undefined" && module.exports) module.exports = QUESTIONS;
  if (typeof window !== "undefined" && window.SuperScience) window.SuperScience.addQuestions("integration", QUESTIONS);
})();
