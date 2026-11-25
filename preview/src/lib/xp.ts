// Same level curve and ranks as xp/config.js + xp/engine.js in the live app (sample data only here).
const FIRST_LEVEL_UP = 50, EXTRA_PER_LEVEL = 20, LEVELS_PER_RANK = 5
const RANKS = ["Spark", "Charged", "Surge", "Overdrive", "Supernova", "Singularity"]

export function levelInfo(xp: number) {
  let level = 1, floor = 0
  const cost = (l: number) => FIRST_LEVEL_UP + EXTRA_PER_LEVEL * (l - 1)
  while (xp >= floor + cost(level)) { floor += cost(level); level++ }
  return {
    level,
    rank: RANKS[Math.min(Math.floor(level / LEVELS_PER_RANK), RANKS.length - 1)],
    into: xp - floor,
    needed: cost(level),
  }
}
