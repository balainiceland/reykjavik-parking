// Reykjavik Parking Service Worker v1.2.0
const CACHE_NAME = 'rvk-parking-v1.2.0';
const OFFLINE_URL = '/offline.html';

// Assets to cache on install
const PRECACHE_ASSETS = [
    '/wp-content/plugins/reykjavik-parking/css/parking-map.css',
    '/wp-content/plugins/reykjavik-parking/js/parking-data.js',
    '/wp-content/plugins/reykjavik-parking/js/parking-map.js',
    'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
    'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
];

// Install event - cache core assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Caching app assets');
                return cache.addAll(PRECACHE_ASSETS);
            })
            .then(() => self.skipWaiting())
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((name) => name !== CACHE_NAME)
                    .map((name) => caches.delete(name))
            );
        }).then(() => self.clients.claim())
    );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
    // Skip non-GET requests
    if (event.request.method !== 'GET') return;

    // Skip cross-origin requests except for Leaflet and OSM tiles
    const url = new URL(event.request.url);
    const isOwnOrigin = url.origin === location.origin;
    const isLeaflet = url.hostname === 'unpkg.com';
    const isOSMTiles = url.hostname.includes('tile.openstreetmap.org');

    if (!isOwnOrigin && !isLeaflet && !isOSMTiles) return;

    event.respondWith(
        caches.match(event.request)
            .then((cachedResponse) => {
                if (cachedResponse) {
                    // Return cached version and update cache in background
                    if (isOSMTiles) {
                        // For map tiles, use cache-first strategy
                        return cachedResponse;
                    }
                    // For other assets, stale-while-revalidate
                    event.waitUntil(
                        fetch(event.request)
                            .then((response) => {
                                if (response.ok) {
                                    caches.open(CACHE_NAME)
                                        .then((cache) => cache.put(event.request, response));
                                }
                            })
                            .catch(() => {})
                    );
                    return cachedResponse;
                }

                // Not in cache, fetch from network
                return fetch(event.request)
                    .then((response) => {
                        // Don't cache non-successful responses
                        if (!response.ok) return response;

                        // Clone response for caching
                        const responseToCache = response.clone();

                        // Cache the response (especially useful for map tiles)
                        caches.open(CACHE_NAME)
                            .then((cache) => {
                                cache.put(event.request, responseToCache);
                            });

                        return response;
                    })
                    .catch(() => {
                        // Offline fallback for navigation requests
                        if (event.request.mode === 'navigate') {
                            return caches.match(OFFLINE_URL);
                        }
                        return new Response('Offline', { status: 503 });
                    });
            })
    );
});

// Handle messages from the main thread
self.addEventListener('message', (event) => {
    if (event.data === 'skipWaiting') {
        self.skipWaiting();
    }
});
