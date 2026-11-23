# Super Science

Interactive maths concepts from [@super.science9](https://instagram.com/super.science9). It's an installable, offline-ready web app (PWA).

**V1 has one concept:** the Taylor series of sin(x). Drag the slider to add terms and watch the amber polynomial hug the white sin(x) curve.

## Files
- `index.html`: page layout
- `style.css`: colours and layout (navy #0B1026, amber #FFB300, cyan)
- `app.js`: maths and SVG graph
- `manifest.json`, `sw.js`, `icons/`: make it installable and work offline
- `tests/taylor.test.js`: maths checks (`node tests/taylor.test.js`)

No build step. Any static host works (e.g. Vercel).

**When you update files:** bump `CACHE_VERSION` in `sw.js` (e.g. `v1` → `v2`) so installed phones fetch the new version.
