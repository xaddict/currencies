// The manifest of files to be precached is dynamically injected here by the build process.
// The name of the placeholder is crucial for the injectManifest strategy to work.
const manifestFiles = self.__WB_MANIFEST || [];

// Use the dynamically injected build version for the cache name.
// This ensures a new cache is created on every new deployment.
const CACHE_NAME = `convert-v${__BUILD_VERSION__}`;

self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Caching essential assets...');
      return cache.addAll(manifestFiles.map(file => file.url));
    }).catch(error => {
      console.error('Failed to cache assets during install:', error);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response;
      }
      return fetch(event.request);
    }).catch(error => {
      console.error('Fetch failed:', error);
      // Fallback response, e.g., a simple offline page
      return new Response("<h1>Offline</h1><p>You appear to be offline. Please reconnect to the internet.</p>", {
        headers: { 'Content-Type': 'text/html' }
      });
    })
  );
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  // Delete old caches
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
