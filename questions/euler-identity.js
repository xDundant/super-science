/* Questions: Euler's identity
 * Numeric answers are re-calculated in tests/checks/euler-identity.js.
 */
(function () {
  const QUESTIONS = [
    {
      id: "euler-identity-pi",
      question: "Press \"Go to π\". What is e^(iπ)?",
      options: ["1", "0", "i", "−1"],
      correct: 3,
      difficulty: "easy",
      explanation: "Half a turn round the unit circle lands on the left: cos π + i sin π = −1 + 0i = −1. Add 1 and you get 0.",
    },
    {
      id: "euler-identity-quarter",
      question: "Set θ = π/2 (90°). Where is e^(iθ)?",
      options: ["i", "1", "−1", "−i"],
      correct: 0,
      difficulty: "medium",
      explanation: "A quarter turn points straight up the imaginary axis: cos 90° + i sin 90° = 0 + 1i = i.",
    },
    {
      id: "euler-identity-i-squared",
      question: "Multiplying by i turns a point 90°. What is i × i?",
      options: ["1", "−1", "2i", "0"],
      correct: 1,
      difficulty: "hard",
      explanation: "Two quarter turns make a half turn, from 1 round to −1. So i² = −1.",
    },
    {
      id: "euler-identity-cos60",
      question: "At θ = 60°, what is the real part, cos θ?",
      options: ["0.87", "1", "0.5", "0.6"],
      correct: 2,
      difficulty: "hard",
      explanation: "cos 60° = 0.5, so the point is halfway along the real axis. (0.87 is sin 60°, the imaginary part.)",
    },
    {
      id: "euler-identity-radius",
      question: "How far is e^(iθ) from the centre of the circle?",
      options: ["It depends on θ", "Always 1", "θ", "e"],
      correct: 1,
      difficulty: "medium",
      explanation: "cos²θ + sin²θ = 1 for every angle, so e^(iθ) always sits on the circle of radius 1.",
    },
  ];

  if (typeof module !== "undefined" && module.exports) module.exports = QUESTIONS;
  if (typeof window !== "undefined" && window.SuperScience) window.SuperScience.addQuestions("euler-identity", QUESTIONS);
})();
