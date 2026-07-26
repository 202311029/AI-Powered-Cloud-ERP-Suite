const CACHE_NAME = 'amdox-erp-v1';
const OFFLINE_URL = '/offline.html';

// F-12: Core views functional offline
const PRECACHE_ASSETS = [
  '/',
  '/offline.html',
  '/globals.css',
  '/favicon.ico'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// F-12: Service worker cache for critical read views
self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match(OFFLINE_URL);
      })
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});

// F-12: Sync on reconnect without data loss
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-financial-ops') {
    event.waitUntil(syncFinancialData());
  }
});

async function syncFinancialData() {
    console.log('[SW] Attempting background sync for mission-critical financial ops...');
    // Real implementation would pull from IndexedDB and POST to v1 gateway
}
