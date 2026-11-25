/* Super Science: XP / Power Level settings.
 * ALL the numbers live here. Change them, bump CACHE_VERSION in sw.js, push.
 */
(function () {
  const XP_CONFIG = {
    // How much XP each thing is worth. Each one pays out only ONCE, ever.
    firstOpenConcept: 10,      // first time you open a concept
    firstCorrectQuestion: 10,  // first time you get a particular question right
    perfectScore: 25,          // first perfect score (5/5) on a concept's questions

    // Daily streak bonus, added the first time you earn XP on a new day.
    // Day 1 = start, day 2 = start + perDay, ... never more than max.
    streak: { start: 5, perDay: 1, max: 15 },

    // Level curve. XP needed to go from level L to L+1 = firstLevelUp + extraPerLevel × (L − 1)
    // So: L1→2 needs 50, L2→3 needs 70, L3→4 needs 90 ... each level a bit slower.
    levels: { firstLevelUp: 50, extraPerLevel: 20, maxLevel: 99 },

    // A new rank every `levelsPerRank` levels (levels 1–4 Spark, 5–9 Charged, ...).
    // The last rank continues for every level after it.
    levelsPerRank: 5,
    ranks: ["Spark", "Charged", "Surge", "Overdrive", "Supernova", "Singularity"],

    // Cosmetic header-bar auras. `level` = the level that unlocks it.
    auras: [
      { id: "amber", name: "Amber", level: 1, color: "#FFB300", glow: "rgba(255, 179, 0, 0.45)" },
      { id: "cyan", name: "Cyan", level: 5, color: "#4DD9FF", glow: "rgba(77, 217, 255, 0.45)" },
      { id: "red", name: "Red", level: 10, color: "#FF4D5E", glow: "rgba(255, 77, 94, 0.45)" },
      { id: "whitegold", name: "White-gold", level: 15, color: "#FFE9A8", glow: "rgba(255, 244, 214, 0.55)" },
    ],
  };

  if (typeof module !== "undefined" && module.exports) module.exports = XP_CONFIG;
  if (typeof window !== "undefined") window.SuperScienceXPConfig = XP_CONFIG;
})();
