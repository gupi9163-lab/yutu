const CACHE_VERSION = '2.0.1';
const CACHE_NAME = `hesablayici-v${CACHE_VERSION}`;

const urlsToCache = [
  '/',
  '/index.html',
  '/styles.css',
  '/app.js',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png'
];


// INSTALL
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Caching app shell');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting())
  );
});


// ACTIVATE
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});


// FETCH → Cache First + Network fallback + Offline fallback
self.addEventListener('fetch', event => {

  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then(cachedResponse => {

      // 1️⃣ Cache varsa → qaytar
      if (cachedResponse) {
        return cachedResponse;
      }

      // 2️⃣ Yoxdursa → network
      return fetch(event.request)
        .then(response => {

          if (!response || response.status !== 200) {
            return response;
          }

          // 3️⃣ Dynamic cache
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            if (event.request.url.startsWith(self.location.origin)) {
              cache.put(event.request, responseClone);
            }
          });

          return response;
        })
        .catch(() => {
          // 4️⃣ Offline navigation fallback
          if (event.request.mode === 'navigate') {
            return caches.match('/index.html');
          }
        });

    })
  );
});


// FORCE UPDATE
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
