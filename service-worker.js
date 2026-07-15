const CACHE = 'bitacora-erp-v1';

// Local app shell — must succeed for the SW to install.
const APP_SHELL = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png',
];

// Third-party libraries loaded from CDN — cached best-effort so a single
// online visit is enough to make every later visit fully offline.
const CDN_ASSETS = [
  'https://cdn.tailwindcss.com',
  'https://cdn.jsdelivr.net/npm/dexie@3.2.4/dist/dexie.min.js',
  'https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js',
  'https://unpkg.com/lucide@0.303.0/dist/umd/lucide.js',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE);
      // Local shell: fail install if these don't cache correctly.
      await cache.addAll(APP_SHELL);
      // CDN assets: best-effort, one at a time, never block install/offline-readiness
      // on a single flaky/CORS-restricted request.
      await Promise.all(
        CDN_ASSETS.map(async (url) => {
          try {
            const res = await fetch(url, { mode: 'cors' });
            if (res && (res.ok || res.type === 'opaque')) await cache.put(url, res);
          } catch (e) { /* will be cached on first successful runtime fetch instead */ }
        })
      );
      self.skipWaiting();
    })()
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)));
      self.clients.claim();
    })()
  );
});

// Cache-first, network-fallback for everything (app shell, CDN libs, Google
// Fonts CSS + the font files it references, icons, etc). Successful network
// responses are stored so the app keeps working next time there's no signal.
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    (async () => {
      const cached = await caches.match(event.request, { ignoreVary: true });
      if (cached) return cached;
      try {
        const response = await fetch(event.request);
        if (response && (response.ok || response.type === 'opaque')) {
          const copy = response.clone();
          caches.open(CACHE).then((cache) => cache.put(event.request, copy)).catch(() => {});
        }
        return response;
      } catch (err) {
        // Navigation fallback: if offline and the page itself isn't cached yet,
        // serve the app shell so the SPA can still boot.
        if (event.request.mode === 'navigate') {
          const shell = await caches.match('./index.html');
          if (shell) return shell;
        }
        throw err;
      }
    })()
  );
});
