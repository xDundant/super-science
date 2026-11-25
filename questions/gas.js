/* Questions: Gas in a box (ideal gas law, P = nRT/V)
 * Numeric answers are re-calculated in tests/checks/gas.js.
 */
(function () {
  const QUESTIONS = [
    {
      id: "gas-double-t",
      question: "Double the temperature (in kelvin), keeping the volume the same. The pressure…",
      options: ["Doubles", "Halves", "Stays the same", "Becomes 4 times bigger"],
      correct: 0,
      explanation: "P = nRT/V, so pressure is proportional to temperature (in kelvin): twice the T, twice the P.",
    },
    {
      id: "gas-squeeze-and-heat",
      question: "Squeeze the gas to half the volume AND double the temperature (in kelvin). The pressure…",
      options: ["Stays the same", "Doubles", "Becomes 4 times bigger", "Halves"],
      correct: 2,
      explanation: "Halving V doubles P, and doubling T doubles it again: 2 × 2 = 4 times bigger.",
    },
    {
      id: "gas-value",
      question: "1 mol of gas at 300 K in a 25 L box. What is the pressure? (R = 8.314)",
      options: ["12.0 kPa", "249.4 kPa", "99.8 kPa", "0.1 kPa"],
      correct: 2,
      explanation: "P = nRT/V = 1 × 8.314 × 300 ÷ 25 ≈ 99.8 kPa, about normal air pressure.",
    },
    {
      id: "gas-why-heat",
      question: "Why does heating a gas in a sealed box raise its pressure?",
      options: ["The particles get bigger", "More particles appear", "The walls move inwards", "Particles move faster and hit the walls harder and more often"],
      correct: 3,
      explanation: "Temperature is a measure of how fast the particles move. Faster particles hit the walls harder and more often, so they push harder.",
    },
    {
      id: "gas-celsius",
      question: "A sealed gas is heated from 27 °C to 327 °C. The pressure…",
      options: ["Goes up about 12 times", "Doubles", "Stays the same", "Halves"],
      correct: 1,
      explanation: "Use kelvin: 27 °C ≈ 300 K and 327 °C ≈ 600 K. Twice the kelvin temperature means twice the pressure (not 12×!).",
    },
  ];

  if (typeof module !== "undefined" && module.exports) module.exports = QUESTIONS;
  if (typeof window !== "undefined" && window.SuperScience) window.SuperScience.addQuestions("gas", QUESTIONS);
})();
