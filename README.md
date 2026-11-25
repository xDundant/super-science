# Super Science

Interactive maths and physics concepts from [@super.science9](https://instagram.com/super.science9). It's an installable, offline-ready web app (PWA). Plain HTML, CSS and JavaScript: no framework, no build step, no backend.

## Concepts
| Link | Concept | Tag |
|---|---|---|
| `#taylor` | Taylor series of sin(x): add terms and watch the polynomial hug sin(x) | Maths |
| `#vectors` | Adding vectors tip to tail, with live magnitude and angle of A + B | Maths |
| `#projectile` | Projectile motion: angle and speed sliders, a Launch animation, and live range, max height and time of flight | Physics |

The home screen is a grid of cards. Each concept has its own link (e.g. `yoursite.vercel.app/#vectors`), and the browser back button works.

## Files
- `index.html`: page shell (header, `<main id="app">`, footer) and the list of scripts
- `style.css`: all styling (navy #0B1026, amber #FFB300, cyan, red)
- `core.js`: shared toolbox (concept list, slider builder, SVG helpers)
- `concepts/*.js`: one file per concept, containing its maths plus its drawing code
- `app.js`: home screen and `#hash` routing
- `manifest.json`, `sw.js`, `icons/`: make it installable and work offline
- `tests/`: maths and physics checks

## Adding a new concept
1. Copy one of the files in `concepts/` (e.g. `vectors.js`) to `concepts/my-thing.js`. Change the `id`, `title`, `description`, `tag` (`"Maths"` or `"Physics"`) and the `render` code. The home card is created automatically from those details.
2. In `index.html`, add `<script src="concepts/my-thing.js"></script>` next to the other concept scripts, before `app.js`.
3. In `sw.js`, add `"concepts/my-thing.js"` to `FILES` and bump `CACHE_VERSION`.

## Running the tests
```
node tests/run-all.js
```

## Updating the live site
Push to `main` and Vercel redeploys automatically. **Always bump `CACHE_VERSION` in `sw.js`** (e.g. `v2` → `v3`) when you change files, so installed phones fetch the new version.
