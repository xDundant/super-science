/* Questions: Punnett square (B = purple, dominant; b = white, recessive)
 * Numeric answers are re-calculated in tests/checks/punnett.js.
 */
(function () {
  const QUESTIONS = [
    {
      id: "punnett-bb-x-bb-white",
      question: "Cross Bb × Bb. What percentage of the offspring have white flowers?",
      options: ["50%", "25%", "75%", "0%"],
      correct: 1,
      difficulty: "medium",
      explanation: "Only bb is white, and 1 of the 4 boxes is bb: 25%. The other 75% are purple.",
    },
    {
      id: "punnett-BB-x-bb",
      question: "Cross BB × bb. What percentage of the offspring are Bb?",
      options: ["100%", "50%", "25%", "0%"],
      correct: 0,
      difficulty: "medium",
      explanation: "One parent can only give B and the other only b, so every baby is Bb (purple).",
    },
    {
      id: "punnett-Bb-x-bb-purple",
      question: "Cross Bb × bb. What percentage have purple flowers?",
      options: ["25%", "75%", "50%", "100%"],
      correct: 2,
      difficulty: "hard",
      explanation: "Half the boxes are Bb (purple) and half are bb (white): 50% purple.",
    },
    {
      id: "punnett-white-genotype",
      question: "Which genotype gives white flowers?",
      options: ["BB", "Bb", "bb", "Any of them"],
      correct: 2,
      difficulty: "easy",
      explanation: "B is dominant, so one B is enough for purple. Only bb (no B at all) gives white.",
    },
    {
      id: "punnett-purple-parents",
      question: "Can two purple-flowered parents have a white-flowered baby?",
      options: ["No, never", "Yes, if both are Bb", "Yes, if both are BB", "Only if one is BB"],
      correct: 1,
      difficulty: "expert",
      explanation: "Two Bb parents are both purple but each can pass on b. A bb baby (white) happens 25% of the time.",
    },
  ];

  if (typeof module !== "undefined" && module.exports) module.exports = QUESTIONS;
  if (typeof window !== "undefined" && window.SuperScience) window.SuperScience.addQuestions("punnett", QUESTIONS);
})();
