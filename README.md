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
  - Scores last for the current visit only; nothing is saved.

## Files
| File | What it does |
|---|---|
| `index.html` | Page shell (header, `<main id="app">`, footer) and the list of scripts |
| `style.css` | All styling (black #000000, amber #FFB300, cyan, red, green) |
| `core.js` | Shared toolbox: concept list, question store, slider builder, SVG helpers |
| `quiz.js` | The "Test yourself" quiz screen, plus `checkAnswer()`, the single function every answer goes through |
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

## Adding points / power levels later
Every answer goes through `checkAnswer()` in `quiz.js`, so that's the one place to award points. It isn't built yet.

## Updating the live site
Push to `main` and Vercel redeploys automatically. **Always bump `CACHE_VERSION` in `sw.js`** (e.g. `v3` → `v4`) when you change files, so installed phones fetch the new version.
