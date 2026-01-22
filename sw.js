const CACHE_NAME = "voiceform-v3";
const ASSETS = [
  "/ImageScan/",
  "/ImageScan/index.html",
  "/ImageScan/style.css",
  "/ImageScan/script.js",
  "/ImageScan/manifest.json",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    }),
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    }),
  );
});
