# Super Science

Interactive maths and physics concepts from [@super.science9](https://instagram.com/super.science9). It's an installable, offline-ready web app (PWA). Plain HTML, CSS and JavaScript: no framework, no build step, no backend, no accounts.

## Concepts
| Link | Concept | Tag |
|---|---|---|
| `#taylor` | Taylor series of sin(x): add terms and watch the polynomial hug sin(x) | Maths |
| `#vectors` | Adding vectors tip to tail, with live magnitude and angle of A + B | Maths |
| `#projectile` | Projectile motion: angle and speed sliders, a Launch animation, and live range, max height and time of flight | Physics |
| `#euler-e` | Euler's number e from compound interest: (1 + 1/n)ⁿ creeping up to 2.71828 | Maths |
| `#euler-identity` | Euler's identity: e^(iθ) on the unit circle, "Go to π" gives e^(iπ) + 1 = 0, × i turns 90° | Maths |
| `#integration` | Integration as area: left strips under v = t² from 0 to 3 s converge to 9 m | Maths |
| `#centripetal` | Centripetal force F = mv²/r: orbiting ball, Release to fly off along the tangent | Physics |
| `#terminal-velocity` | Skydiver with drag kv²: speed climbs to √(mg/k); parachute multiplies k by 10 | Physics |
| `#pendulum` | Real pendulum (numerical) vs the small-angle formula T = 2π√(L/g) | Physics |
| `#ph` | pH 0–14: [H⁺], [OH⁻], indicator colour and everyday examples | Chemistry |
| `#gas` | Particles in a box: P = nRT/V with temperature and volume sliders | Chemistry |
| `#atom` | Atom builder for elements 1–20: mass number, charge, ions, isotopes, 2-8-8-2 shells | Chemistry |
| `#natural-selection` | Light/dark bugs, predator pressure, generations and a % dark chart (seeded random) | Biology |
| `#punnett` | Punnett square for pea flower colour (B purple, b white) | Biology |
| `#enzymes` | Enzyme activity vs temperature and pH (amylase, pepsin), with permanent denaturing | Biology |

> **Simplified models:** the natural-selection simulation, the enzyme activity curves and the pH indicator colours are deliberately simple teaching models, not real lab data. The everyday pH values are typical approximate values (real ones vary).

- **Home screen:** a grid of cards with **subject filter chips** (All / Maths / Physics / Chemistry / Biology). Each concept has its own link (e.g. `yoursite.vercel.app/#vectors`), and the browser back button works.
- **"Test yourself" quiz:** under each concept, 5 multiple-choice questions, one at a time.
  - After each answer it shows green (right) or red (wrong) with a short explanation, then a Next button.
  - At the end it shows your score with a Try again button that reshuffles the order.
  - The quiz score itself lasts for the current visit only, but the XP you earn is saved (see below).
- **Sidebar:** 🏠 Home, 📚 Concepts (by subject), 🎮 Minigames, 👤 Profile, 🔊 Sound, and a mini Power Level bar. Always visible on laptops; on phones the ☰ button opens it as a drawer (close it with the backdrop, Escape, ✕ or by choosing an item).
- **Minigames (`#games`):** the **3-Second Quiz** (`#games/quiz`). Pick a subject, then answer 8 questions (2 each 🟢 Easy, 🟡 Medium, 🟠 Hard, 🔴 Expert) with 3 seconds per question. Best scores are saved per subject; "Copy my score" copies a shareable line.
- **Power Level / XP:** a bar in the header on every page shows your rank, level, XP progress and 🔥 day streak. Tap it to open your **Profile** (`#profile`).

## Files
| File | What it does |
|---|---|
| `index.html` | Page shell (header, `<main id="app">`, footer) and the list of scripts |
| `style.css` | All styling (black #000000, amber #FFB300, cyan, red, green) |
| `core.js` | Shared toolbox: concept list, question store, slider, dropdown, number tiles, graph axes, animation loop |
| `quiz.js` | The "Test yourself" quiz screen, plus `checkAnswer()`, the single function every answer goes through |
| `xp/config.js` | **All XP numbers**: rewards, streak bonus, level curve, rank names, auras |
| `xp/engine.js` | XP rules: levels, ranks, streaks, anti-farming (no screen code; tested) |
| `xp/storage.js` | **All saving code** (localStorage). Swap this file for a real backend later |
| `xp/ui.js` | Power Level bar, "+10 XP" popups, POWER UP! banner, Profile screen |
| `sound/sfx.js` | **All sound effects**, generated in code (no audio files), plus the 🔊/🔇 button |
| `concepts/<id>.js` | One file per concept: its maths, home-card details and drawing code |
| `questions/<id>.js` | One file per concept: its quiz questions as plain data |
| `nav.js` | Sidebar: permanent on laptops, slide-out drawer (☰) on phones |
| `games/hub.js` | Minigames hub (`#games`) and the "Coming soon" cards |
| `games/<id>.js` | One file per minigame (e.g. `games/quiz.js`, the 3-Second Quiz at `#games/quiz`) |
| `app.js` | Home screen and `#hash` routing (adds the quiz under each concept automatically) |
| `manifest.json`, `sw.js`, `icons/` | Make it installable and work offline |
| `tests/*.test.js` | All tests (run together by `tests/run-all.js`) |
| `tests/animation.test.js` | Checks the animation helpers with fake screen refreshes (60/120 Hz, tab switches, fixed physics steps) |
| `tests/checks/<id>.js` | One file per concept: **calculates** the right answer to each of its quiz questions |

## How to add a new concept
Use an id that is short, lowercase, with no spaces, e.g. `waves`. It becomes the link `#waves`.

**1. Create `concepts/waves.js`.** Copy an existing concept file (e.g. `concepts/vectors.js`) and change:
- The maths functions at the top. Keep the `module.exports` line so tests can use them.
- The **home card**, which is the `SS.register({ ... })` block:
  - `id: "waves"`
  - `description`: one line for the card
  - `tag`: `"Maths"`, `"Physics"`, `"Chemistry"` or `"Biology"` (this also puts it under that filter chip)
  - `title`: write it as a curious question ending in "?", e.g. "Why don't skydivers keep speeding up?"

  The home card is created automatically from these details. There is no separate card list to edit.
- `render(root)`: draws the interactive part into `root`. Return a cleanup function if you start timers or animations. Use the helpers in `core.js` to stay consistent: `SS.slider`, `SS.select`, `SS.stats` (live number tiles), `SS.fit` + `SS.axes` (graphs) and `SS.loop` (animation).

**2. Create `questions/waves.js`.** Copy an existing questions file and write 5 questions:
```js
{
  id: "waves-speed",              // unique, starts with the concept id
  question: "…?",
  options: ["…", "…", "…", "…"],  // exactly 4, no duplicates
  correct: 2,                     // index of the right option: 0, 1, 2 or 3
  difficulty: "medium",           // easy | medium | hard | expert (used by the 3-Second Quiz tiers)
  explanation: "1–2 sentences on why.",
}
```
Change the last line to `addQuestions("waves", QUESTIONS)`.

**3. Register the scripts in `index.html`:**
- Add `<script src="concepts/waves.js"></script>` after the other concept scripts. The order of these lines is the order of the home cards.
- Add `<script src="questions/waves.js"></script>` after the other question scripts.
- XP for the new concept and its questions works automatically, with nothing else to register.

Both must come before `app.js`.

**4. Add both files to `sw.js`.** Put `"concepts/waves.js"` and `"questions/waves.js"` in `FILES`, then bump `CACHE_VERSION`.

**5. Add tests:**
- Create `tests/checks/waves.js`. For every question whose answer is a number, add a check that **calculates** the answer with the concept's own code and returns the option text that must be marked correct. List idea-only questions under `conceptual`. Copy `tests/checks/pendulum.js` as a template.
- Create `tests/waves.test.js` for the concept's own maths. It runs automatically, with no list to update.

`node tests/run-all.js` will fail if any of these are missing, if the concept isn't in `index.html` or `sw.js`, or if a marked answer doesn't match the maths.

**Files to create, in short:** `concepts/waves.js`, `questions/waves.js`, `tests/checks/waves.js`, `tests/waves.test.js`. **Files to edit:** `index.html` (2 script lines; this registers the home card) and `sw.js` (2 file names + bump `CACHE_VERSION`).

## Animation rules (keep every concept smooth)
Every concept should feel smooth at 60 fps on phones and laptops. Use the helpers in `core.js`:

1. **Only `requestAnimationFrame`** for anything that moves. Never use `setInterval`/`setTimeout` to animate. Use `SS.loop((dt) => { ... })`; return `false` to stop. It runs once per screen refresh and stops itself when you leave the page (return its stop function from `render`).
2. **Time-based, not frame-based.** Move things by `speed × dt` (dt = real seconds since the last frame, capped at 0.05 s). Then they move at the same speed on 60 Hz and 120 Hz screens, and a pause or tab switch never causes a big jump. `SS.loop` also restarts its clock when the tab becomes visible again.
3. **Physics uses a fixed step.** Use `SS.physicsLoop({ step(h) { ... }, render(alpha) { ... } })`. `step` advances the simulation by exactly 1/240 s, as many times as needed. `render` draws `SS.lerp(previous, current, alpha)`, i.e. in between the last two steps. Keep a `prev` copy of the state for this. Examples: `concepts/pendulum.js`, `gas.js`, `centripetal.js`, `terminal-velocity.js`.
4. **Slider drags: at most one redraw per frame.** Wrap the handler: `const onSlide = SS.perFrame(draw); slider.addEventListener("input", onSlide);` and call `onSlide.cancel()` in the clean-up. If something must react to *every* value (e.g. "did it get too hot?"), check that in the event and only batch the drawing.
5. **Build the picture once, then move it.** Draw axes, grids and labels once (and again only on resize). Each frame, change attributes of existing elements (`setAttribute`, `SS.setArrow`) instead of deleting and re-creating SVG. Many identical dots can be one `<path>`. Only write text to the page when it actually changes.
6. **Ease, don't snap.** For a value following the user (like the Taylor slider), glide with `shown = SS.smooth(shown, target, dt, 0.07)`. For one-off moves use an ease-out curve over about 150–300 ms (up to ~0.8 s for a big turn).
7. **CSS: animate only `transform` and `opacity`** (never `width`, `top`, `left`). Use `var(--ease-out)` and 150–300 ms. Add `will-change` only on things that animate often (the XP bar fill, popups).
8. **Reduced motion** (`SS.reducedMotion()`): keep it calm. Use shorter, fades instead of big sweeping movement, but still smooth, never a hard jump.
9. **Sliders** already have `touch-action: pan-y`, so a sideways drag moves the slider and a vertical swipe still scrolls. Don't block touch on graphs that aren't draggable, or people can't scroll past them.
10. **Sharp drawings:** everything is SVG, which is sharp on every screen. If you ever add a `<canvas>`, scale it by `Math.min(devicePixelRatio, 2)`.

**Check it:** add `?fps=1` to the address (e.g. `yoursite.vercel.app/?fps=1#pendulum`) to show a small frame counter in the corner. Green means 55 fps or more; red means it's dropping frames.

## Running the tests
```
node tests/run-all.js
```
The question tests check that every question has exactly 4 different options, one correct answer and an explanation. They also **recalculate every numeric answer** with the same maths code the graphs use, and fail if the marked answer is wrong.

## How XP works
| You do this | You get | How often |
|---|---|---|
| Open a concept for the first time | +10 XP | Once per concept, ever |
| Get a question right for the first time | +10 XP | Once per question, ever |
| Score 5/5 on a concept's questions | +25 XP | Once per concept, ever |
| Earn any XP on a new day (daily streak) | +5 XP, then +1 more for each day in a row, max +15 | Once per day |

| Finish a minigame | +2 XP per correct answer, +10 for a perfect 8/8 | Up to 40 minigame XP per day, then "for fun" |

- **Anti-farming:** everything pays once. Retaking a question you already got right shows "XP already collected" and earns 0. A day with no *new* XP doesn't earn a streak bonus.
- **Streak:** counts the days in a row on which you earned XP. Miss a day and it starts again at 1 (+5).
- **Levels:** Level 2 needs 50 XP. Each level after that needs 20 XP more than the one before (50, 70, 90, 110…). So Level 5 is at 320 XP and Level 10 at 1,170 XP.
- **Ranks:** a new rank every 5 levels: Spark (1–4), Charged (5–9), Surge (10–14), Overdrive (15–19), Supernova (20–24), Singularity (25+).
- **Auras:** cosmetic glow colours for the header bar. Amber from the start, then Cyan at level 5, Red at 10 and White-gold at 15. Pick one on the Profile screen; locked ones are greyed out.
- **Level up:** a "POWER UP!" banner, an amber glow, and a short vibration on phones that support it. With "reduce motion" turned on in the device settings, these become simple fades, with no movement or pulsing.
- **Saved** on the device in `localStorage` under the key `superscience.progress`, as `{ version: 2, xp, level, streak, lastActiveDate, completedQuestions, seenConcepts, perfectConcepts, unlockedAuras, chosenAura, minigames: { quiz: { best: { Physics: 6, … } } }, minigameXP: { date, earned } }`. Version 1 saves (before minigames) are upgraded automatically with all progress kept. If the browser blocks storage, XP still works for that visit and the Profile screen shows a warning. **Reset progress** (with a confirm step) is at the bottom of the Profile screen.

## Sound effects
All sounds are made in code with the Web Audio API in **`sound/sfx.js`**. There are no audio files, so nothing to download and no copyright issues. They are simple original synth tones.

| Sound | When | Length |
|---|---|---|
| Bright "ding" (quick rising pitch) | XP earned | ~0.15 s |
| Sparkle (four quick high notes) | XP earned with a daily streak bonus | ~0.25 s |
| Two-note chime | Correct answer | ~0.3 s |
| Soft low "bonk" | Wrong answer | ~0.15 s |
| Rising sweep then a punchy chord | Level up, together with the POWER UP! banner | ~1 s |

- **Quiet by default.** Change `VOLUME` at the top of `sound/sfx.js` (0 to 1, currently 0.18). A built-in limiter stops sounds stacking up loudly.
- **No overlaps.** Sounds asked for at the same moment play only the most important one (level-up > correct/wrong > streak > XP ding). A small sound won't cut off a bigger one that's still playing. So a level-up plays only the level-up sound, not the XP ding as well.
- **Phones:** browsers block audio until you tap, so audio switches on at your first tap or click anywhere. On iPhone, the silent switch also mutes these sounds.
- **Mute:** the 🔊/🔇 button next to the Power Level bar. The choice is saved on the device (`localStorage` key `superscience.sound`; still works this visit if storage is blocked). If the device has "reduce motion" turned on, sound starts **muted** until you switch it on.
- **Using sounds in new code (one line):** `SFX.playXP()`, `SFX.playCorrect()`, `SFX.playWrong()`, `SFX.playLevelUp()` or `SFX.playStreak()`. To add a brand-new sound, add a function to `SOUNDS` in `sound/sfx.js`, give it a `PRIORITY`, and add a `playX` line at the bottom.

## How to add a new minigame
Use a short id, e.g. `estimate`. Its page is `#games/estimate`.

1. **Create `games/estimate.js`.** Copy `games/quiz.js` and keep the same shape:
   - Game rules at the top (no screen code) with a `module.exports` line, so they can be tested.
   - The **hub card**, which is the `SS.registerGame({ ... })` block: `id`, `icon` (an emoji), `title`, `description`, `status: "live"`, `maxScore`. The card appears on the hub automatically; there is no separate card list.
   - `render(root)`: draws the game into `root`. Return a clean-up function that stops timers and loops.
   - When a game ends, call `SuperScience.xp.recordMinigame({ game: "estimate", subject, score, total }, element)`. It saves the best score and pays XP within the daily cap.
2. **Remove its "Coming soon" entry** from the list at the top of `games/hub.js` (if it has one).
3. **Register the script in `index.html`:** add `<script src="games/estimate.js"></script>` after `games/hub.js` and before `app.js`.
4. **Add it to `sw.js`** (`"games/estimate.js"` in `FILES`) and bump `CACHE_VERSION`.
5. **Add `tests/estimate.test.js`** for its rules. `tests/structure.test.js` fails if the file isn't loaded and cached.
6. Follow the **Animation rules** above: timers use `SS.loop`/`performance.now()`, never `setInterval`.

### Changing the numbers
Edit **`xp/config.js`**. Every reward (including `minigames.perCorrect`, `perfectBonus` and `dailyCap`), the streak bonus and cap, the level curve (`firstLevelUp`, `extraPerLevel`), the rank names and the aura unlock levels are there. Then run the tests, bump `CACHE_VERSION` in `sw.js`, and push.

> With today's 15 concepts there are 1,275 XP of one-off rewards (85 XP per concept: 10 for opening it, 50 for its 5 questions, 25 for a perfect score). That's enough for Level 10 (1,170 XP) without any streak bonuses, so the cyan (Level 5) and red (Level 10) auras are both reachable. White-gold (Level 15) needs more concepts or streak days.

### Earning XP from new code
Call `SuperScience.xp.award({ type: "openConcept", conceptId })`, `{ type: "correctAnswer", questionId }` or `{ type: "perfectScore", conceptId }`. The optional second argument is the element the "+XP" popup floats from. The rules live in `award()` in `xp/engine.js`. Quiz answers are checked by `checkAnswer()` in `quiz.js`, and then the quiz calls `SuperScience.xp.award`.

## Updating the live site
Push to `main` and Vercel redeploys automatically. **Always bump `CACHE_VERSION` in `sw.js`** (e.g. `v3` → `v4`) when you change files, so installed phones fetch the new version.
