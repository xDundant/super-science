/* Questions: Taylor series of sin(x)
 * Each question: id, question, options (4), correct (index 0-3), difficulty, explanation.
 * Numeric answers are re-calculated in tests/questions.test.js.
 */
(function () {
  const QUESTIONS = [
    {
      id: "taylor-3-terms",
      question: "Set the slider to 3 terms. Which polynomial is drawn in amber?",
      options: ["x + x³/3! + x⁵/5!", "x − x³/3! + x⁵/5!", "1 − x²/2! + x⁴/4!", "x − x³/3 + x⁵/5"],
      correct: 1,
      difficulty: "medium",
      explanation: "The signs alternate (+, −, +) and each term divides by a factorial: x − x³/3! + x⁵/5!. The cosine-style even powers belong to cos(x), not sin(x).",
    },
    {
      id: "taylor-1-term",
      question: "With the slider on 1 term, what shape is the amber curve?",
      options: ["The flat line y = 0", "The flat line y = 1", "The straight line y = x", "Exactly sin(x)"],
      correct: 2,
      difficulty: "easy",
      explanation: "The first term is just x, so the amber curve is the line y = x. It matches sin(x) well only close to x = 0.",
    },
    {
      id: "taylor-value-at-1",
      question: "With 2 terms the polynomial is x − x³/3!. What does it give at x = 1 (to 3 decimal places)?",
      options: ["0.667", "0.841", "0.833", "1.167"],
      correct: 2,
      difficulty: "expert",
      explanation: "1 − 1/6 = 0.833. That's already close to the true sin(1) ≈ 0.841, after only two terms.",
    },
    {
      id: "taylor-most-accurate",
      question: "Where does the Taylor polynomial match sin(x) best?",
      options: ["Near x = 0", "Near x = 2π", "Equally well everywhere", "Only at x = π"],
      correct: 0,
      difficulty: "medium",
      explanation: "This series is built around x = 0, so it hugs sin(x) there first. Adding terms stretches the good fit further out in both directions.",
    },
    {
      id: "taylor-4th-term",
      question: "Move the slider from 3 to 4 terms. Which term gets added?",
      options: ["+x⁷/7!", "−x⁷/7!", "−x⁶/6!", "−x⁸/8!"],
      correct: 1,
      difficulty: "hard",
      explanation: "The powers go 1, 3, 5, 7 (odd only) and the signs alternate +, −, +, −. So the 4th term is −x⁷/7!.",
    },
  ];

  if (typeof module !== "undefined" && module.exports) module.exports = QUESTIONS;
  if (typeof window !== "undefined" && window.SuperScience) window.SuperScience.addQuestions("taylor", QUESTIONS);
})();
