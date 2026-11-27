/* Questions: Atom builder
 * Numeric answers are re-calculated in tests/checks/atom.js.
 */
(function () {
  const QUESTIONS = [
    {
      id: "atom-11-protons",
      question: "An atom has 11 protons. Which element is it?",
      options: ["Neon", "Sodium", "Sulfur", "Potassium"],
      correct: 1,
      difficulty: "medium",
      explanation: "The number of protons (the atomic number) decides the element. Number 11 is sodium (Na).",
    },
    {
      id: "atom-carbon-14",
      question: "Carbon with 6 protons and 8 neutrons. What is its mass number?",
      options: ["8", "6", "14", "20"],
      correct: 2,
      difficulty: "easy",
      explanation: "Mass number = protons + neutrons = 6 + 8 = 14. This is carbon-14, the isotope used in carbon dating.",
    },
    {
      id: "atom-oxide-charge",
      question: "An atom has 8 protons and 10 electrons. What is its charge?",
      options: ["+2", "0", "+18", "−2"],
      correct: 3,
      difficulty: "hard",
      explanation: "Charge = protons − electrons = 8 − 10 = −2. It's an oxide ion, O²⁻.",
    },
    {
      id: "atom-sodium-shells",
      question: "How are the electrons arranged in a neutral sodium atom (11 electrons)?",
      options: ["2, 8, 1", "2, 9", "8, 2, 1", "2, 8, 8, 2"],
      correct: 0,
      difficulty: "hard",
      explanation: "Fill the shells in order: 2 in the first, 8 in the second, and the last 1 in the third: 2, 8, 1.",
    },
    {
      id: "atom-isotopes",
      question: "Two atoms have the same number of protons but different numbers of neutrons. They are…",
      options: ["Different elements", "Ions", "Isotopes of the same element", "Molecules"],
      correct: 2,
      difficulty: "easy",
      explanation: "Same protons means same element. Different neutrons just changes the mass, so they're isotopes.",
    },
  ];

  if (typeof module !== "undefined" && module.exports) module.exports = QUESTIONS;
  if (typeof window !== "undefined" && window.SuperScience) window.SuperScience.addQuestions("atom", QUESTIONS);
})();
