/* Super Science: saving progress.
 * ALL saving code lives here. To move to a real account/backend later, keep
 * the same three functions (load, save, clear) and change what's inside them.
 *
 * Saved under ONE localStorage key as JSON:
 *   { version: 1, xp, level, streak, lastActiveDate, completedQuestions,
 *     seenConcepts, perfectConcepts, unlockedAuras, chosenAura }
 */
(function () {
  const Engine = typeof window !== "undefined" && window.SuperScienceXPEngine
    ? window.SuperScienceXPEngine
    : require("./engine.js");

  const KEY = "superscience.progress";
  let memoryCopy = null; // used if the browser blocks storage (e.g. some private modes)

  function storage() {
    try { return globalThis.localStorage || null; } catch (e) { return null; }
  }

  // Always returns a valid progress object, never throws.
  function load() {
    try {
      const store = storage();
      const text = store ? store.getItem(KEY) : null;
      if (text) return Engine.normalizeState(JSON.parse(text));
    } catch (e) { /* blocked or corrupted: fall through */ }
    return memoryCopy ? Engine.normalizeState(memoryCopy) : Engine.freshState();
  }

  // Returns true if it was really saved on the device.
  function save(state) {
    memoryCopy = JSON.parse(JSON.stringify(state));
    try {
      const store = storage();
      if (!store) return false;
      store.setItem(KEY, JSON.stringify(state));
      return true;
    } catch (e) {
      return false;
    }
  }

  function clear() {
    memoryCopy = null;
    try {
      const store = storage();
      if (store) store.removeItem(KEY);
      return true;
    } catch (e) {
      return false;
    }
  }

  const STORAGE = { KEY, load, save, clear };
  if (typeof module !== "undefined" && module.exports) module.exports = STORAGE;
  if (typeof window !== "undefined") window.SuperScienceXPStorage = STORAGE;
})();
