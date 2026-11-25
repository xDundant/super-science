/* Super Science service worker: makes the app work offline.
 * When you change any file, bump CACHE_VERSION so phones get the new version.
 */
const CACHE_VERSION = "super-science-v10";
const FILES = [
  "./",
  "index.html",
  "style.css",
  "sound/sfx.js",
  "core.js",
  "concepts/taylor.js",
  "concepts/vectors.js",
  "concepts/projectile.js",
  "concepts/euler-e.js",
  "concepts/euler-identity.js",
  "concepts/integration.js",
  "concepts/centripetal.js",
  "concepts/terminal-velocity.js",
  "concepts/pendulum.js",
  "concepts/ph.js",
  "concepts/gas.js",
  "concepts/atom.js",
  "concepts/natural-selection.js",
  "concepts/punnett.js",
  "concepts/enzymes.js",
  "xp/config.js",
  "xp/engine.js",
  "xp/storage.js",
  "xp/ui.js",
  "quiz.js",
  "questions/taylor.js",
  "questions/vectors.js",
  "questions/projectile.js",
  "questions/euler-e.js",
  "questions/euler-identity.js",
  "questions/integration.js",
  "questions/centripetal.js",
  "questions/terminal-velocity.js",
  "questions/pendulum.js",
  "questions/ph.js",
  "questions/gas.js",
  "questions/atom.js",
  "questions/natural-selection.js",
  "questions/punnett.js",
  "questions/enzymes.js",
  "app.js",
  "manifest.json",
  "icons/icon.svg",
  "icons/icon-192.png",
  "icons/icon-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_VERSION).then((cache) => cache.addAll(FILES)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Network first (so you always see the latest when online), cache as fallback (offline).
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  if (new URL(event.request.url).origin !== self.location.origin) return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE_VERSION).then((cache) => cache.put(event.request, copy));
        return response;
      })
      .catch(() =>
        caches.match(event.request, { ignoreSearch: true }).then((hit) => hit || caches.match("index.html"))
      )
  );
});
