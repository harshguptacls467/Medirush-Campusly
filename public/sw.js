// MediRush Offline-First Service Worker
const CACHE_NAME = 'medirush-v2';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = event.request.url;

  // NEVER cache Next.js development chunks, HMR, Turbopack, or APIs
  if (
    url.includes('/_next/') ||
    url.includes('/api/') ||
    url.includes('__next') ||
    url.includes('hot-update') ||
    event.request.headers.get('accept')?.includes('text/event-stream') ||
    event.request.method !== 'GET'
  ) {
    return;
  }

  // Network-first strategy with offline fallback
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Clone and update cache only for successful navigation/static pages
        if (response.status === 200 && event.request.mode === 'navigate') {
          const resClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, resClone));
        }
        return response;
      })
      .catch(() => {
        return caches.match(event.request).then((cached) => {
          if (cached) return cached;
          if (event.request.mode === 'navigate') {
            return caches.match('/chemist') || caches.match('/');
          }
          return new Response('Offline', { status: 503, statusText: 'Offline' });
        });
      })
  );
});
