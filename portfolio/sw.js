// Service Worker for Linux AJ Portfolio
// Version 1.2.0

const CACHE_NAME = 'linux-aj-portfolio-v1.2.0';
const urlsToCache = [
    '/',
    '/index.html',
    '/style.css',
    '/script.js',
    '/assets/images/wallpaper.jpg'
];

// Install event
self.addEventListener('install', function(event) {
    console.log('Service Worker installing...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(function(cache) {
                console.log('Cache opened');
                return cache.addAll(urlsToCache);
            })
    );
    self.skipWaiting(); // Activate immediately
});

// Activate event
self.addEventListener('activate', function(event) {
    console.log('Service Worker activating...');
    event.waitUntil(
        caches.keys().then(function(cacheNames) {
            return Promise.all(
                cacheNames.map(function(cacheName) {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    self.clients.claim(); // Take control of all pages
});

// Fetch event - always fetch fresh content
self.addEventListener('fetch', function(event) {
    event.respondWith(
        fetch(event.request)
            .then(function(response) {
                // Clone the response because it's a stream
                const responseToCache = response.clone();
                
                // Only cache GET requests and successful responses
                if (event.request.method === 'GET' && response.status === 200) {
                    caches.open(CACHE_NAME)
                        .then(function(cache) {
                            cache.put(event.request, responseToCache);
                        });
                }
                
                return response;
            })
            .catch(function() {
                // If fetch fails, try to get from cache
                return caches.match(event.request)
                    .then(function(response) {
                        return response || new Response('Offline content not available', {
                            status: 404,
                            statusText: 'Not Found'
                        });
                    });
            })
    );
});

// Handle messages from main thread
self.addEventListener('message', function(event) {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});

// Periodic background sync for cache updates
self.addEventListener('sync', function(event) {
    if (event.tag === 'background-update') {
        event.waitUntil(updateCache());
    }
});

function updateCache() {
    return fetch('/index.html?' + Date.now())
        .then(function(response) {
            if (response.ok) {
                return caches.open(CACHE_NAME)
                    .then(function(cache) {
                        return cache.put('/index.html', response);
                    });
            }
        })
        .catch(function(error) {
            console.log('Cache update failed:', error);
        });
}