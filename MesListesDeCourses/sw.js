// Service Worker — cache offline
const CACHE = 'mldc-v1.5.0';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './css/app.css',
  './js/app.js',
  './js/store.js',
  './js/router.js',
  './js/ui.js',
  './js/data.js',
  './js/swipe.js',
  './js/theme.js',
  './js/voice.js',
  './js/sync.js',
  './js/spinner.js',
  './js/history.js',
  './js/recurring.js',
  './js/pages/index.js',
  './js/pages/editeListe.js',
  './js/pages/courses.js',
  './js/pages/produits.js',
  './js/pages/stock.js',
  './js/pages/menu.js',
  './js/restrictions.js',
  './js/pages/parametres.js',
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  // Cache-first pour les assets, network-first pour le reste
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(resp => {
        if (resp.ok) {
          const clone = resp.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return resp;
      }).catch(() => cached);
    })
  );
});
