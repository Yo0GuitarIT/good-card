const cacheName = "good-card-v2";
const appShell = [
  "/",
  "/manifest.webmanifest",
  "/app-icon.svg",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/apple-touch-icon.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(cacheName).then((cache) => cache.addAll(appShell)),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames
            .filter((currentCacheName) => currentCacheName !== cacheName)
            .map((oldCacheName) => caches.delete(oldCacheName)),
        ),
      ),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.method !== "GET") return;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const responseCopy = response.clone();
          caches
            .open(cacheName)
            .then((cache) => cache.put("/", responseCopy));
          return response;
        })
        .catch(() => caches.match("/")),
    );
    return;
  }

  const requestUrl = new URL(request.url);

  if (requestUrl.origin !== self.location.origin) return;

  // API 一律走網路，也不進快取。
  // 下面的靜態資源策略是快取優先，集印帳資料若落進去就再也看不到新的章。
  if (requestUrl.pathname.startsWith("/api/")) return;

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse;

      return fetch(request).then((response) => {
        if (response.ok) {
          const responseCopy = response.clone();
          caches
            .open(cacheName)
            .then((cache) => cache.put(request, responseCopy));
        }

        return response;
      });
    }),
  );
});
