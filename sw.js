// sw.js (root directory) - Simple Performance-Only Service Worker
const CACHE_NAME = 'ecoquest-v1.0.0';
const STATIC_ASSETS = [
  '/',
  '/dashboard.html',
  '/quests.html',
  '/quest-detail.html',
  '/login.html',
  '/register.html',
  '/profile.html',
  '/admin.html',
  '/styles.css',
  '/manifest.json',
  '/js/mobile-menu.js',
  '/pwa-assets/icon-192.png',
  '/pwa-assets/icon-512.png'
];

// Install event - cache static assets for performance
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Caching static assets for performance...');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('Service Worker installation complete');
        return self.skipWaiting(); // Activate immediately
      })
      .catch((error) => {
        console.error('Service Worker installation failed:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker activation complete');
        return self.clients.claim();
      })
  );
});

// Fetch event - Network first, cache for performance (NO offline fallback)
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;
  
  // Skip Firebase and API requests - always go to network
  if (event.request.url.includes('firebaseapp.com') || 
      event.request.url.includes('googleapis.com') ||
      event.request.url.includes('generativelanguage.googleapis.com') ||
      event.request.url.includes('gstatic.com')) {
    return; // Let browser handle normally
  }
  
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // If network succeeds, cache the response for performance
        if (response && response.status === 200 && response.type === 'basic') {
          const responseClone = response.clone();
          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseClone);
            });
        }
        return response;
      })
      .catch(() => {
        // Network failed - try cache for static assets only
        return caches.match(event.request)
          .then((cachedResponse) => {
            if (cachedResponse) {
              console.log('Serving cached static asset:', event.request.url);
              return cachedResponse;
            }
            // No cache available - show network error
            throw new Error('Network unavailable and no cached version');
          });
      })
  );
});

// Push notification handler
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'New environmental quest available! 🌱',
    icon: '/pwa-assets/icon-192.png',
    badge: '/pwa-assets/badge-72.png',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 'quest-notification'
    },
    actions: [
      {
        action: 'explore',
        title: 'View Quests',
        icon: '/pwa-assets/icon-192.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/pwa-assets/icon-192.png'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('EcoQuest 🌱', options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/quests.html')
    );
  }
});
