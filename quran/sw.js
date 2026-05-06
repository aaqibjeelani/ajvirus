// ── Al-Noor Service Worker ─────────────────────────────────────────────────
// Version: bump this to force cache refresh on deploy
const CACHE_VERSION = 'al-noor-v1.0.0';
const STATIC_CACHE  = `${CACHE_VERSION}-static`;
const API_CACHE     = `${CACHE_VERSION}-api`;
const FONT_CACHE    = `${CACHE_VERSION}-fonts`;

// Files to cache immediately on install (app shell)
const STATIC_ASSETS = [
  './',
  './index.html',
  './quran.css',
  './quran.js',
  './pwa.js',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  // Offline fallback page
  './offline.html'
];

// API patterns to cache with network-first strategy
const API_PATTERNS = [
  'api.alquran.cloud',
  'cdn.jsdelivr.net/gh/fawazahmed0/hadith-api',
  'api.aladhan.com'
];

// Font patterns — cache-first (fonts never change)
const FONT_PATTERNS = [
  'fonts.googleapis.com',
  'fonts.gstatic.com'
];

// ── Install ─────────────────────────────────────────────────────────────────
self.addEventListener('install', event => {
  console.log('[SW] Installing Al-Noor Service Worker...');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        console.log('[SW] Caching app shell...');
        // Cache each file individually so one 404 doesn't block others
        return Promise.allSettled(
          STATIC_ASSETS.map(url =>
            cache.add(url).catch(err => console.warn('[SW] Failed to cache:', url, err))
          )
        );
      })
      .then(() => self.skipWaiting()) // Activate immediately
  );
});

// ── Activate ────────────────────────────────────────────────────────────────
self.addEventListener('activate', event => {
  console.log('[SW] Activating Al-Noor Service Worker...');
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== STATIC_CACHE && key !== API_CACHE && key !== FONT_CACHE)
          .map(key => {
            console.log('[SW] Deleting old cache:', key);
            return caches.delete(key);
          })
      )
    ).then(() => self.clients.claim()) // Take control immediately
  );
});

// ── Fetch ────────────────────────────────────────────────────────────────────
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET and chrome-extension requests
  if (request.method !== 'GET' || url.protocol === 'chrome-extension:') return;

  // ── Font requests: Cache-First ──────────────────────────────────────────
  if (FONT_PATTERNS.some(p => url.hostname.includes(p))) {
    event.respondWith(cacheFirst(request, FONT_CACHE));
    return;
  }

  // ── API requests: Network-First with cache fallback ─────────────────────
  if (API_PATTERNS.some(p => request.url.includes(p))) {
    event.respondWith(networkFirst(request, API_CACHE));
    return;
  }

  // ── App Shell: Cache-First ───────────────────────────────────────────────
  if (url.origin === self.location.origin || STATIC_ASSETS.some(a => url.pathname.endsWith(a.replace('./', '')))) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }

  // ── Everything else: Stale-While-Revalidate ─────────────────────────────
  event.respondWith(staleWhileRevalidate(request, STATIC_CACHE));
});

// ── Strategies ──────────────────────────────────────────────────────────────

// Cache-First: serve from cache, fallback to network, then offline page
async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok) cache.put(request, response.clone());
    return response;
  } catch {
    const offline = await caches.match('./offline.html');
    return offline || new Response('Offline', { status: 503 });
  }
}

// Network-First: try network, fallback to cache, then offline page
async function networkFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  try {
    const response = await fetch(request);
    if (response.ok) cache.put(request, response.clone());
    return response;
  } catch {
    const cached = await cache.match(request);
    if (cached) return cached;
    const offline = await caches.match('./offline.html');
    return offline || new Response(JSON.stringify({ error: 'Offline', cached: false }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Stale-While-Revalidate: serve cache immediately, update in background
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  const networkPromise = fetch(request)
    .then(response => {
      if (response.ok) cache.put(request, response.clone());
      return response;
    })
    .catch(() => null);

  return cached || await networkPromise ||
    new Response('Offline', { status: 503 });
}

// ── Push Notifications ───────────────────────────────────────────────────────
self.addEventListener('push', event => {
  const data = event.data?.json() || {};
  const title = data.title || 'Al-Noor';
  const options = {
    body: data.body || 'Time for prayer 🕌',
    icon: './icons/icon-192.png',
    badge: './icons/icon-96.png',
    vibrate: [200, 100, 200],
    data: data,
    actions: [
      { action: 'open', title: 'Open App' },
      { action: 'dismiss', title: 'Dismiss' }
    ]
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  if (event.action === 'open' || !event.action) {
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true })
        .then(clientList => {
          if (clientList.length > 0) {
            clientList[0].focus();
          } else {
            clients.openWindow('./index.html');
          }
        })
    );
  }
});

// ── Background Sync ──────────────────────────────────────────────────────────
self.addEventListener('sync', event => {
  if (event.tag === 'sync-bookmarks') {
    event.waitUntil(syncBookmarks());
  }
});

async function syncBookmarks() {
  // Placeholder for future bookmark sync functionality
  console.log('[SW] Background sync: bookmarks');
}

// ── Message Handling ─────────────────────────────────────────────────────────
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  if (event.data && event.data.type === 'CACHE_SURAH') {
    // Pre-cache a surah when user opens it
    const urls = event.data.urls || [];
    caches.open(API_CACHE).then(cache => {
      urls.forEach(url => {
        fetch(url).then(r => { if (r.ok) cache.put(url, r); }).catch(() => {});
      });
    });
  }
  if (event.data && event.data.type === 'GET_CACHE_SIZE') {
    getCacheSize().then(size => {
      event.source.postMessage({ type: 'CACHE_SIZE', size });
    });
  }
});

async function getCacheSize() {
  let total = 0;
  const cacheNames = await caches.keys();
  for (const name of cacheNames) {
    const cache = await caches.open(name);
    const keys = await cache.keys();
    total += keys.length;
  }
  return total;
}
