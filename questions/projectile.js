/* Questions: Projectile motion (g = 9.8 m/s², no air resistance)
 * Each question: id, question, options (4), correct (index 0-3), explanation.
 * Numeric answers are re-calculated in tests/questions.test.js.
 */
(function () {
  const QUESTIONS = [
    {
      id: "projectile-best-angle",
      question: "Keep the speed fixed. Which launch angle sends the ball furthest?",
      options: ["30°", "45°", "60°", "90°"],
      correct: 1,
      explanation: "Range = v² × sin(2θ) ÷ g, and sin(2θ) is biggest (1) when 2θ = 90°, so θ = 45°.",
    },
    {
      id: "projectile-range-20-45",
      question: "Launch at 45° and 20 m/s. What is the range?",
      options: ["20.4 m", "40.8 m", "81.6 m", "10.2 m"],
      correct: 1,
      explanation: "Range = v² × sin(2θ) ÷ g = 20² × sin(90°) ÷ 9.8 = 400 ÷ 9.8 ≈ 40.8 m.",
    },
    {
      id: "projectile-same-landing",
      question: "At 20 m/s, a 30° launch lands 35.3 m away. Which other angle lands in exactly the same spot?",
      options: ["45°", "15°", "60°", "90°"],
      correct: 2,
      explanation: "Angles that add up to 90° give the same range, because sin(2 × 30°) = sin(2 × 60°). The 60° shot goes higher but lands in the same place.",
    },
    {
      id: "projectile-straight-up-time",
      question: "Launch straight up (90°) at 20 m/s. How long is the ball in the air?",
      options: ["2.04 s", "2.89 s", "4.08 s", "8.16 s"],
      correct: 2,
      explanation: "Time = 2 × v × sin(θ) ÷ g = 2 × 20 × 1 ÷ 9.8 ≈ 4.08 s. It takes about 2.04 s to go up and the same to come down.",
    },
    {
      id: "projectile-double-speed",
      question: "Keep the angle the same and double the launch speed. What happens to the range?",
      options: ["It doubles", "It stays the same", "It becomes 8 times bigger", "It becomes 4 times bigger"],
      correct: 3,
      explanation: "Range depends on v², so doubling v multiplies the range by 2² = 4.",
    },
  ];

  if (typeof module !== "undefined" && module.exports) module.exports = QUESTIONS;
  if (typeof window !== "undefined" && window.SuperScience) window.SuperScience.addQuestions("projectile", QUESTIONS);
})();
