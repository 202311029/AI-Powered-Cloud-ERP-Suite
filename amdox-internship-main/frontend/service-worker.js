const CACHE_NAME = 'amdox-erp-cache-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/hr.html',
  '/finance.html',
  '/supply.html',
  '/crm.html',
  '/bi.html',
  '/style.css',
  '/app.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

self.addEventListener('fetch', (event) => {
  // If online, fetch and cache. If offline, serve from cache.
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseClone);
        });
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});

// Periodic Sync for Offline reconcilliation (concept)
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-transactions') {
    event.waitUntil(syncPendingDataToServer());
  }
});

async function syncPendingDataToServer() {
  console.log('[PWA Sync] Re-establishing connection... syncing pending mutations.');
  // Logic to read IndexedDB and punch to API
}
