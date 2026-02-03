/**
 * Índice de servicios
 * @module services
 */

export { storage } from './storage.js';
export { auth } from './auth.js';
export {
  registerServiceWorker,
  forceUpdate,
  clearCache,
  isOfflineCapable,
  onConnectivityChange,
} from './sw-register.js';
export {
  processReceipt,
  parseChileanReceipt,
  preprocessImage,
  formatCLP,
  detectCategory,
  detectCategoryByProducts,
} from './ocr.js';
