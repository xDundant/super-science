# Super Science

Interactive maths and physics concepts from [@super.science9](https://instagram.com/super.science9). It's an installable, offline-ready web app (PWA). Plain HTML, CSS and JavaScript: no framework, no build step, no backend, no accounts.

## Concepts
| Link | Concept | Tag |
|---|---|---|
| `#taylor` | Taylor series of sin(x): add terms and watch the polynomial hug sin(x) | Maths |
| `#vectors` | Adding vectors tip to tail, with live magnitude and angle of A + B | Maths |
| `#projectile` | Projectile motion: angle and speed sliders, a Launch animation, and live range, max height and time of flight | Physics |

- **Home screen:** a grid of cards. Each concept has its own link (e.g. `yoursite.vercel.app/#vectors`), and the browser back button works.
- **"Test yourself" quiz:** under each concept, 5 multiple-choice questions, one at a time.
  - After each answer it shows green (right) or red (wrong) with a short explanation, then a Next button.
  - At the end it shows your score with a Try again button that reshuffles the order.
  - The quiz score itself lasts for the current visit only, but the XP you earn is saved (see below).
- **Power Level / XP:** a bar in the header on every page shows your rank, level, XP progress and 🔥 day streak. Tap it to open your **Profile** (`#profile`).

## Files
| File | What it does |
|---|---|
| `index.html` | Page shell (header, `<main id="app">`, footer) and the list of scripts |
| `style.css` | All styling (black #000000, amber #FFB300, cyan, red, green) |
| `core.js` | Shared toolbox: concept list, question store, slider builder, SVG helpers |
| `quiz.js` | The "Test yourself" quiz screen, plus `checkAnswer()`, the single function every answer goes through |
| `xp/config.js` | **All XP numbers**: rewards, streak bonus, level curve, rank names, auras |
| `xp/engine.js` | XP rules: levels, ranks, streaks, anti-farming (no screen code; tested) |
| `xp/storage.js` | **All saving code** (localStorage). Swap this file for a real backend later |
| `xp/ui.js` | Power Level bar, "+10 XP" popups, POWER UP! banner, Profile screen |
| `sound/sfx.js` | **All sound effects**, generated in code (no audio files), plus the 🔊/🔇 button |
| `concepts/<id>.js` | One file per concept: its maths, home-card details and drawing code |
| `questions/<id>.js` | One file per concept: its quiz questions as plain data |
| `app.js` | Home screen and `#hash` routing (adds the quiz under each concept automatically) |
| `manifest.json`, `sw.js`, `icons/` | Make it installable and work offline |
| `tests/` | Maths, physics and quiz-question checks |

## How to add a new concept
Use an id that is short, lowercase, with no spaces, e.g. `waves`. It becomes the link `#waves`.

**1. Create `concepts/waves.js`.** Copy an existing concept file (e.g. `concepts/vectors.js`) and change:
- The maths functions at the top. Keep the `module.exports` line so tests can use them.
- The **home card**, which is the `SS.register({ ... })` block:
  - `id: "waves"`
  - `title`: the card and page heading
  - `description`: one line for the card
  - `tag: "Maths"` or `"Physics"`

  The home card is created automatically from these details. There is no separate card list to edit.
- `render(root)`: draws the interactive part into `root`. Return a cleanup function if you start timers or animations.

**2. Create `questions/waves.js`.** Copy an existing questions file and write 5 questions:
```js
{
  id: "waves-speed",              // unique, starts with the concept id
  question: "…?",
  options: ["…", "…", "…", "…"],  // exactly 4, no duplicates
  correct: 2,                     // index of the right option: 0, 1, 2 or 3
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
- Create `tests/waves.test.js` for the concept's maths, and add it to `tests/run-all.js`.
- In `tests/questions.test.js`:
  - Add `waves: require("../questions/waves.js")` to `BANKS`.
  - For every question whose answer is a number, add a check to `CHECKS` that **calculates** the answer with the concept's own code.
  - List any idea-only questions in `CONCEPTUAL`.

  The test fails if a question has neither.

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

- **Anti-farming:** everything pays once. Retaking a question you already got right shows "XP already collected" and earns 0. A day with no *new* XP doesn't earn a streak bonus.
- **Streak:** counts the days in a row on which you earned XP. Miss a day and it starts again at 1 (+5).
- **Levels:** Level 2 needs 50 XP. Each level after that needs 20 XP more than the one before (50, 70, 90, 110…). So Level 5 is at 320 XP and Level 10 at 1,170 XP.
- **Ranks:** a new rank every 5 levels: Spark (1–4), Charged (5–9), Surge (10–14), Overdrive (15–19), Supernova (20–24), Singularity (25+).
- **Auras:** cosmetic glow colours for the header bar. Amber from the start, then Cyan at level 5, Red at 10 and White-gold at 15. Pick one on the Profile screen; locked ones are greyed out.
- **Level up:** a "POWER UP!" banner, an amber glow, and a short vibration on phones that support it. With "reduce motion" turned on in the device settings, these become simple fades, with no movement or pulsing.
- **Saved** on the device in `localStorage` under the key `superscience.progress`, as `{ version: 1, xp, level, streak, lastActiveDate, completedQuestions, seenConcepts, perfectConcepts, unlockedAuras, chosenAura }`. If the browser blocks storage, XP still works for that visit and the Profile screen shows a warning. **Reset progress** (with a confirm step) is at the bottom of the Profile screen.

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

### Changing the numbers
Edit **`xp/config.js`**. Every reward, the streak bonus and cap, the level curve (`firstLevelUp`, `extraPerLevel`), the rank names and the aura unlock levels are there. Then run the tests, bump `CACHE_VERSION` in `sw.js`, and push.

> With today's 3 concepts there are 255 XP of one-off rewards. That's enough for about Level 4 in one go; Level 5 then comes from a few days of streak bonuses. Each new concept adds 85 XP.

### Earning XP from new code
Call `SuperScience.xp.award({ type: "openConcept", conceptId })`, `{ type: "correctAnswer", questionId }` or `{ type: "perfectScore", conceptId }`. The optional second argument is the element the "+XP" popup floats from. The rules live in `award()` in `xp/engine.js`. Quiz answers are checked by `checkAnswer()` in `quiz.js`, and then the quiz calls `SuperScience.xp.award`.

## Updating the live site
Push to `main` and Vercel redeploys automatically. **Always bump `CACHE_VERSION` in `sw.js`** (e.g. `v3` → `v4`) when you change files, so installed phones fetch the new version.
