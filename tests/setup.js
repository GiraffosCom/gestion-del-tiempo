/**
 * Setup de Jest
 * Configura el entorno de pruebas
 */

import { jest, beforeEach } from '@jest/globals';

// Mock de localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => {
      store[key] = String(value);
    },
    removeItem: (key) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    get length() {
      return Object.keys(store).length;
    },
    key: (index) => Object.keys(store)[index] || null,
  };
})();

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
});

// Mock de crypto.subtle para hash de contraseñas
const cryptoMock = {
  subtle: {
    digest: async (algorithm, data) => {
      // Simulación simple de hash para tests
      const text = new TextDecoder().decode(data);
      const hash = new Uint8Array(32);
      for (let i = 0; i < text.length && i < 32; i++) {
        hash[i] = text.charCodeAt(i);
      }
      return hash.buffer;
    },
  },
};

Object.defineProperty(global, 'crypto', {
  value: cryptoMock,
});

// Limpiar localStorage antes de cada test
beforeEach(() => {
  localStorageMock.clear();
});
