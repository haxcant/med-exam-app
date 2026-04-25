const CACHE_NAME = 'med-exam-app-v0.1.29';
const CORE_ASSETS = [
  "./",
  "./index.html",
  "./admin.html",
  "./firebase-debug.html",
  "./styles.css?v=20260425fix29",
  "./memory-bridge.js?v=20260425fix29",
  "./app.js?v=20260425fix29",
  "./med_questions.js?v=20260425fix29",
  "./manifest.webmanifest",
  "./firebase-init.js",
  "./firebase-auth.js?v=20260425fix29",
  "./firebase-access.js?v=20260425fix29",
  "./firebase-sync-smoke.js?v=20260425fix29",
  "./firebase-backup.js?v=20260425fix29",
  "./firebase-ui.js?v=20260425fix29",
  "./admin.js?v=20260425fix29",
  "./icons/icon-192.png",
  "./icons/icon-512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});

async function cacheOkResponse(request, response) {
  if (!response || !response.ok) return response;
  const cache = await caches.open(CACHE_NAME);
  await cache.put(request, response.clone());
  return response;
}

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  const isNavigate = event.request.mode === "navigate";
  const isCriticalAsset = /\.(html|js|css)$/.test(url.pathname);
  const isImage = /\.(png|jpg|jpeg|webp|gif|svg)$/.test(url.pathname);

  if (isNavigate || isCriticalAsset) {
    event.respondWith(
      fetch(event.request)
        .then((response) => cacheOkResponse(event.request, response))
        .catch(() => caches.match(event.request).then((cached) => cached || caches.match("./index.html")))
    );
    return;
  }

  if (isImage) {
    event.respondWith(
      fetch(event.request)
        .then((response) => cacheOkResponse(event.request, response))
        .catch(() => caches.match(event.request))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => cacheOkResponse(event.request, response));
    })
  );
});
