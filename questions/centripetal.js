/* Questions: Centripetal force
 * Numeric answers are re-calculated in tests/checks/centripetal.js.
 */
(function () {
  const QUESTIONS = [
    {
      id: "centripetal-force-16",
      question: "Mass 2 kg, speed 4 m/s, radius 2 m. What is the centripetal force F = mv²/r?",
      options: ["8 N", "16 N", "4 N", "32 N"],
      correct: 1,
      difficulty: "hard",
      explanation: "F = 2 × 4² ÷ 2 = 2 × 16 ÷ 2 = 16 N.",
    },
    {
      id: "centripetal-double-speed",
      question: "Double the speed, keeping mass and radius the same. The force needed…",
      options: ["Doubles", "Halves", "Becomes 4 times bigger", "Stays the same"],
      correct: 2,
      difficulty: "medium",
      explanation: "F depends on v², so twice the speed needs 2² = 4 times the force.",
    },
    {
      id: "centripetal-double-radius",
      question: "Double the radius, keeping mass and speed the same. The force needed…",
      options: ["Halves", "Doubles", "Becomes 4 times bigger", "Stays the same"],
      correct: 0,
      difficulty: "medium",
      explanation: "F = mv²/r, so a bigger circle (gentler curve) needs less force: twice the radius, half the force.",
    },
    {
      id: "centripetal-release",
      question: "You press Release. Which way does the ball go?",
      options: ["Straight out, away from the centre", "Keeps going round the circle", "Spirals into the centre", "Straight on, along the tangent"],
      correct: 3,
      difficulty: "easy",
      explanation: "With no string there's no force, so (Newton's 1st law) the ball keeps the velocity it had: along the tangent, at right angles to the string.",
    },
    {
      id: "centripetal-force-20",
      question: "A 1 kg ball on a 5 m string moves at 10 m/s. What is the force?",
      options: ["50 N", "2 N", "20 N", "100 N"],
      correct: 2,
      difficulty: "hard",
      explanation: "F = 1 × 10² ÷ 5 = 100 ÷ 5 = 20 N.",
    },
  ];

  if (typeof module !== "undefined" && module.exports) module.exports = QUESTIONS;
  if (typeof window !== "undefined" && window.SuperScience) window.SuperScience.addQuestions("centripetal", QUESTIONS);
})();
