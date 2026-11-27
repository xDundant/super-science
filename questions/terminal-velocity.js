/* Questions: Terminal velocity (g = 9.8 m/s², drag = kv²)
 * Numeric answers are re-calculated in tests/checks/terminal-velocity.js.
 */
(function () {
  const QUESTIONS = [
    {
      id: "terminal-velocity-value",
      question: "Mass 80 kg, drag coefficient k = 0.2 kg/m. What is the terminal speed √(mg/k)?",
      options: ["62.6 m/s", "39.2 m/s", "9.8 m/s", "3920 m/s"],
      correct: 0,
      difficulty: "expert",
      explanation: "√(80 × 9.8 ÷ 0.2) = √3920 ≈ 62.6 m/s (about 225 km/h).",
    },
    {
      id: "terminal-velocity-balance",
      question: "At terminal velocity, how big is the drag force?",
      options: ["Zero", "Equal to the weight", "Twice the weight", "Half the weight"],
      correct: 1,
      difficulty: "easy",
      explanation: "The speed stops changing when the forces balance: drag (kv²) = weight (mg), so there's no overall force.",
    },
    {
      id: "terminal-velocity-parachute",
      question: "Opening the parachute makes k 10 times bigger. The new terminal speed is…",
      options: ["10 times faster", "1/10 as fast", "About 1/3 as fast", "The same"],
      correct: 2,
      difficulty: "expert",
      explanation: "Terminal speed = √(mg/k), so 10× the k gives 1/√10 ≈ 0.32 of the speed, about a third.",
    },
    {
      id: "terminal-velocity-heavier",
      question: "A heavier skydiver (same k) has a terminal speed that is…",
      options: ["Lower", "The same", "Zero", "Higher"],
      correct: 3,
      difficulty: "medium",
      explanation: "More weight (mg) needs more drag to balance it, and drag only grows by going faster, so the terminal speed is higher.",
    },
    {
      id: "terminal-velocity-start",
      question: "Right at the start of the jump (speed 0), what is the acceleration?",
      options: ["9.8 m/s²", "0 m/s²", "4.9 m/s²", "19.6 m/s²"],
      correct: 0,
      difficulty: "medium",
      explanation: "At 0 m/s there's no drag yet (k × 0² = 0), so only gravity acts: the acceleration is g = 9.8 m/s².",
    },
  ];

  if (typeof module !== "undefined" && module.exports) module.exports = QUESTIONS;
  if (typeof window !== "undefined" && window.SuperScience) window.SuperScience.addQuestions("terminal-velocity", QUESTIONS);
})();
