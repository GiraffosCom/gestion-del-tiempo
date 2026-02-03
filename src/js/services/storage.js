/**
 * Servicio de almacenamiento local
 * Abstracción sobre localStorage con soporte para usuarios múltiples
 * @module services/storage
 */

import { APP_CONFIG } from '../config.js';

class StorageService {
  constructor() {
    this.prefix = APP_CONFIG.storagePrefix;
    this.userKey = null;
  }

  /**
   * Inicializa el servicio con el usuario actual
   * @param {string} userEmail - Email del usuario
   */
  setUser(userEmail) {
    this.userKey = userEmail ? userEmail.replace(/[^a-z0-9]/gi, '_') : 'guest';
  }

  /**
   * Obtiene la clave completa con prefijo de usuario
   * @param {string} key - Clave base
   * @returns {string} Clave completa
   */
  getFullKey(key) {
    if (this.userKey) {
      return `${this.userKey}-${key}`;
    }
    return `${this.prefix}-${key}`;
  }

  /**
   * Obtiene un valor del storage
   * @param {string} key - Clave a buscar
   * @param {*} defaultValue - Valor por defecto si no existe
   * @returns {*} Valor almacenado o defaultValue
   */
  get(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(this.getFullKey(key));
      if (item === null) return defaultValue;
      return JSON.parse(item);
    } catch (error) {
      console.error(`Error reading from storage [${key}]:`, error);
      return defaultValue;
    }
  }

  /**
   * Obtiene un valor como string sin parsear
   * @param {string} key - Clave a buscar
   * @returns {string|null} Valor almacenado
   */
  getRaw(key) {
    return localStorage.getItem(this.getFullKey(key));
  }

  /**
   * Guarda un valor en el storage
   * @param {string} key - Clave donde guardar
   * @param {*} value - Valor a guardar
   * @returns {boolean} true si se guardó correctamente
   */
  set(key, value) {
    try {
      const serialized = JSON.stringify(value);
      localStorage.setItem(this.getFullKey(key), serialized);
      return true;
    } catch (error) {
      console.error(`Error writing to storage [${key}]:`, error);
      return false;
    }
  }

  /**
   * Elimina un valor del storage
   * @param {string} key - Clave a eliminar
   */
  remove(key) {
    try {
      localStorage.removeItem(this.getFullKey(key));
    } catch (error) {
      console.error(`Error removing from storage [${key}]:`, error);
    }
  }

  /**
   * Verifica si existe una clave
   * @param {string} key - Clave a verificar
   * @returns {boolean}
   */
  has(key) {
    return localStorage.getItem(this.getFullKey(key)) !== null;
  }

  /**
   * Obtiene todas las claves del usuario actual
   * @returns {string[]} Lista de claves
   */
  getAllKeys() {
    const keys = [];
    const prefix = this.userKey || this.prefix;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(prefix)) {
        keys.push(key.replace(`${prefix}-`, ''));
      }
    }
    return keys;
  }

  /**
   * Limpia todos los datos del usuario actual
   */
  clearUserData() {
    const keys = this.getAllKeys();
    keys.forEach(key => this.remove(key));
  }

  /**
   * Exporta todos los datos del usuario
   * @returns {Object} Objeto con todos los datos
   */
  exportData() {
    const data = {};
    const keys = this.getAllKeys();
    keys.forEach(key => {
      data[key] = this.get(key);
    });
    return data;
  }

  /**
   * Importa datos al storage
   * @param {Object} data - Datos a importar
   */
  importData(data) {
    Object.entries(data).forEach(([key, value]) => {
      this.set(key, value);
    });
  }

  // ==================== Métodos globales (sin prefijo de usuario) ====================

  /**
   * Obtiene un valor global (sin prefijo de usuario)
   * @param {string} key - Clave a buscar
   * @param {*} defaultValue - Valor por defecto
   * @returns {*}
   */
  getGlobal(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(`${this.prefix}-${key}`);
      if (item === null) return defaultValue;
      return JSON.parse(item);
    } catch (error) {
      console.error(`Error reading global from storage [${key}]:`, error);
      return defaultValue;
    }
  }

  /**
   * Guarda un valor global (sin prefijo de usuario)
   * @param {string} key - Clave donde guardar
   * @param {*} value - Valor a guardar
   */
  setGlobal(key, value) {
    try {
      const serialized = JSON.stringify(value);
      localStorage.setItem(`${this.prefix}-${key}`, serialized);
      return true;
    } catch (error) {
      console.error(`Error writing global to storage [${key}]:`, error);
      return false;
    }
  }

  /**
   * Elimina un valor global
   * @param {string} key - Clave a eliminar
   */
  removeGlobal(key) {
    localStorage.removeItem(`${this.prefix}-${key}`);
  }
}

// Exportar instancia singleton
export const storage = new StorageService();
export default storage;
