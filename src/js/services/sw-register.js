/**
 * Registro y gestión del Service Worker
 * @module services/sw-register
 */

/**
 * Registra el Service Worker
 * @returns {Promise<ServiceWorkerRegistration|null>}
 */
export async function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) {
    console.log('[SW] Service Workers not supported');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
    });

    console.log('[SW] Service Worker registered:', registration.scope);

    // Manejar actualizaciones
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      if (newWorker) {
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // Hay una nueva versión disponible
            notifyUpdate(registration);
          }
        });
      }
    });

    return registration;
  } catch (error) {
    console.error('[SW] Registration failed:', error);
    return null;
  }
}

/**
 * Notifica al usuario que hay una actualización disponible
 * @param {ServiceWorkerRegistration} registration
 */
function notifyUpdate(registration) {
  // Crear un evento personalizado para que la UI pueda mostrar un banner
  const event = new CustomEvent('sw-update-available', {
    detail: { registration },
  });
  window.dispatchEvent(event);
}

/**
 * Fuerza la actualización del Service Worker
 * @param {ServiceWorkerRegistration} registration
 */
export function forceUpdate(registration) {
  if (registration && registration.waiting) {
    registration.waiting.postMessage({ type: 'SKIP_WAITING' });
  }
}

/**
 * Limpia todas las cachés del Service Worker
 */
export async function clearCache() {
  if ('caches' in window) {
    const keys = await caches.keys();
    await Promise.all(keys.map(key => caches.delete(key)));
    console.log('[SW] All caches cleared');
  }
}

/**
 * Verifica si la app puede funcionar offline
 * @returns {boolean}
 */
export function isOfflineCapable() {
  return 'serviceWorker' in navigator && navigator.serviceWorker.controller !== null;
}

/**
 * Escucha cambios en la conectividad
 * @param {Function} callback - Función a llamar con el estado de conexión
 * @returns {Function} Función para dejar de escuchar
 */
export function onConnectivityChange(callback) {
  const handleOnline = () => callback(true);
  const handleOffline = () => callback(false);

  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);

  // Llamar inmediatamente con el estado actual
  callback(navigator.onLine);

  // Retornar función para limpiar listeners
  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
}
