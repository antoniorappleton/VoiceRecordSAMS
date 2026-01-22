const CACHE_NAME = "voiceform-v4";
const ASSETS = [
  "./",
  "./index.html",
  "./style.css",
  "./script.js",
  "./manifest.json",
];

// Instalar e fazer cache
self.addEventListener("install", (event) => {
  // Forçar o SW a entrar em ação imediatamente (sem esperar que outras abas fechem)
  self.skipWaiting();

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    }),
  );
});

// Ativar e limpar caches antigos
self.addEventListener("activate", (event) => {
  // Reivindicar controle de todas as abas abertas imediatamente
  event.waitUntil(clients.claim());

  // Limpar caches antigos
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        }),
      );
    }),
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Retorna cache se existir, senão vai à rede
      return response || fetch(event.request);
    }),
  );
});
