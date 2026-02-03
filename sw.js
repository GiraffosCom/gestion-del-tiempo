/**
 * Service Worker para Gestión de Tiempo App
 * Proporciona funcionalidad offline y caché de recursos
 */

const CACHE_NAME = 'gestion-tiempo-v1';
const STATIC_CACHE = 'static-v1';
const DYNAMIC_CACHE = 'dynamic-v1';

// Recursos estáticos a cachear en la instalación
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/login.html',
  '/app.html',
  '/onboarding.html',
  '/src/js/config.js',
  '/src/js/app.js',
  '/src/js/legacy-bridge.js',
  '/src/js/services/index.js',
  '/src/js/services/storage.js',
  '/src/js/services/auth.js',
  '/src/js/utils/index.js',
  '/src/js/utils/date.js',
  '/src/js/utils/validation.js',
  '/src/js/utils/helpers.js',
  '/src/js/ui/index.js',
  '/src/js/ui/theme.js',
  '/src/js/ui/modals.js',
  '/src/js/modules/index.js',
  '/src/js/modules/habits.js',
  '/src/js/modules/schedule.js',
  '/src/js/modules/goals.js',
  '/src/js/modules/expenses.js',
  '/manifest.json',
];

// URLs externas que siempre deben ir a la red
const NETWORK_ONLY = [
  'googleapis.com',
  'gstatic.com',
  'fonts.googleapis.com',
];

/**
 * Instalación del Service Worker
 * Cachea los recursos estáticos
 */
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then(cache => {
      console.log('[SW] Caching static assets');
      return cache.addAll(STATIC_ASSETS.filter(url => !url.startsWith('http')));
    })
  );
  // Activar inmediatamente sin esperar
  self.skipWaiting();
});

/**
 * Activación del Service Worker
 * Limpia cachés antiguas
 */
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys
          .filter(key => key !== STATIC_CACHE && key !== DYNAMIC_CACHE)
          .map(key => {
            console.log('[SW] Removing old cache:', key);
            return caches.delete(key);
          })
      );
    })
  );
  // Tomar control de clientes inmediatamente
  self.clients.claim();
});

/**
 * Estrategia de caché: Network First para navegación, Cache First para assets
 */
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignorar peticiones no-GET
  if (request.method !== 'GET') {
    return;
  }

  // Ignorar URLs externas que deben ir siempre a la red
  if (NETWORK_ONLY.some(domain => url.hostname.includes(domain))) {
    return;
  }

  // Para navegación HTML: Network First con fallback a caché
  if (request.mode === 'navigate' || request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(networkFirstStrategy(request));
    return;
  }

  // Para otros recursos: Cache First con fallback a red
  event.respondWith(cacheFirstStrategy(request));
});

/**
 * Network First: Intenta red primero, luego caché
 */
async function networkFirstStrategy(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    // Si no hay caché, devolver página offline
    return caches.match('/index.html');
  }
}

/**
 * Cache First: Intenta caché primero, luego red
 */
async function cacheFirstStrategy(request) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.log('[SW] Network failed for:', request.url);
    // Devolver respuesta vacía para recursos no críticos
    return new Response('', { status: 408, statusText: 'Network unavailable' });
  }
}

/**
 * Manejo de mensajes desde la aplicación
 */
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'CLEAR_CACHE') {
    caches.keys().then(keys => {
      keys.forEach(key => caches.delete(key));
    });
  }
});

/**
 * Sincronización en background (para cuando vuelva la conexión)
 */
self.addEventListener('sync', event => {
  if (event.tag === 'sync-data') {
    event.waitUntil(syncData());
  }
});

async function syncData() {
  // Placeholder para sincronización futura con backend
  console.log('[SW] Background sync triggered');
}
