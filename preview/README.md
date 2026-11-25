# Super Science: coss ui preview

A **preview only**: a small React rebuild of Super Science using [coss ui](https://coss.com/ui)
(React + Base UI + Tailwind CSS v4). It lives on the `coss-ui-preview` branch and does not affect `main`.

What's in it: home screen (coss ui Card, Badge, Tabs filter), the Taylor series page (Slider, Card,
Button; same maths and SVG graph as the live app), a Power Level bar (Progress) with sample data,
a "Test XP" Toast, and a Profile Dialog placeholder. Other concept cards say "Not in preview".

## How it was set up
1. `npm create vite@latest preview -- --template react-ts`, then `npm install tailwindcss @tailwindcss/vite`
   and the `@/` import alias (vite.config.ts + tsconfig), which the shadcn CLI needs.
2. `npx shadcn@latest init @coss/style --template vite --base base` (the coss "new project" command),
   which installs all coss ui components into `src/components/ui/` and the theme into `src/index.css`.
3. Fixes needed for Vite: removed the unused Composer component (failed the strict TypeScript build),
   and replaced the Next.js-only `geist` font import with the system font (as in the live app).
4. Theme: the "Super Science theme" block at the end of `src/index.css` sets the coss CSS variables
   (navy background, amber primary, cyan ring/borders, red destructive).

## Commands
```
cd preview
npm install
npm run dev     # local preview
npm run build   # what Vercel runs (see ../vercel.json)
```
