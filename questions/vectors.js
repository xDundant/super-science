/* Questions: Adding vectors
 * Each question: id, question, options (4), correct (index 0-3), explanation.
 * Numeric answers are re-calculated in tests/questions.test.js.
 */
(function () {
  const QUESTIONS = [
    {
      id: "vectors-tip-to-tail",
      question: "When you add A + B tip to tail, where does B start?",
      options: ["At the origin, on top of A", "At the tip (end) of A", "At the tail (start) of A, pointing backwards", "Halfway along A"],
      correct: 1,
      explanation: "Tip to tail means B's tail sits on A's tip. Then A + B is the arrow from A's start to B's end.",
    },
    {
      id: "vectors-3-4-magnitude",
      question: "Set A to length 3 at 0° and B to length 4 at 90°. What is |A + B|?",
      options: ["7", "1", "12", "5"],
      correct: 3,
      explanation: "A and B are at right angles, so use Pythagoras: √(3² + 4²) = √25 = 5. Not 7, because the arrows point in different directions.",
    },
    {
      id: "vectors-3-4-angle",
      question: "With the same A (3 at 0°) and B (4 at 90°), what is the angle of A + B, to the nearest degree?",
      options: ["53°", "37°", "45°", "90°"],
      correct: 0,
      explanation: "The angle is tan⁻¹(4 ÷ 3) ≈ 53°. It leans towards B because B is the longer vector.",
    },
    {
      id: "vectors-cancel",
      question: "Set A to length 4 at 0° and B to length 4 at 180°. What is |A + B|?",
      options: ["8", "4", "0", "16"],
      correct: 2,
      explanation: "B points exactly opposite to A with the same length, so it brings you straight back to the start. They cancel to 0.",
    },
    {
      id: "vectors-max-length",
      question: "A has length 5 and B has length 3. Turning the angle sliders, what's the biggest |A + B| can be?",
      options: ["5.83", "15", "8", "2"],
      correct: 2,
      explanation: "A + B is longest when both point the same way, so the lengths simply add: 5 + 3 = 8. (5.83 is when they're at right angles.)",
    },
  ];

  if (typeof module !== "undefined" && module.exports) module.exports = QUESTIONS;
  if (typeof window !== "undefined" && window.SuperScience) window.SuperScience.addQuestions("vectors", QUESTIONS);
})();
