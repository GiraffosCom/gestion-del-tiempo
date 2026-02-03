/**
 * Tests para servicio de storage
 */

import { describe, test, expect, beforeEach } from '@jest/globals';
import { storage } from '../../src/js/services/storage.js';

describe('StorageService', () => {
  beforeEach(() => {
    storage.setUser('test@example.com');
  });

  describe('setUser', () => {
    test('debe configurar clave de usuario', () => {
      storage.setUser('user@test.com');
      expect(storage.userKey).toBe('user_test_com');
    });

    test('debe sanitizar email', () => {
      storage.setUser('user.name+tag@example.com');
      expect(storage.userKey).toBe('user_name_tag_example_com');
    });
  });

  describe('get/set', () => {
    test('debe guardar y recuperar valores', () => {
      storage.set('testKey', { foo: 'bar' });
      const result = storage.get('testKey');
      expect(result).toEqual({ foo: 'bar' });
    });

    test('debe retornar defaultValue si no existe', () => {
      const result = storage.get('nonExistent', 'default');
      expect(result).toBe('default');
    });

    test('debe retornar null si no existe y no hay default', () => {
      const result = storage.get('nonExistent');
      expect(result).toBeNull();
    });
  });

  describe('getRaw', () => {
    test('debe retornar valor sin parsear', () => {
      localStorage.setItem('test_example_com-rawKey', 'raw value');
      const result = storage.getRaw('rawKey');
      expect(result).toBe('raw value');
    });
  });

  describe('has', () => {
    test('debe detectar si clave existe', () => {
      storage.set('existingKey', 'value');
      expect(storage.has('existingKey')).toBe(true);
      expect(storage.has('nonExistingKey')).toBe(false);
    });
  });

  describe('remove', () => {
    test('debe eliminar clave', () => {
      storage.set('toRemove', 'value');
      expect(storage.has('toRemove')).toBe(true);
      storage.remove('toRemove');
      expect(storage.has('toRemove')).toBe(false);
    });
  });

  describe('exportData/importData', () => {
    test('debe exportar todos los datos', () => {
      storage.set('key1', 'value1');
      storage.set('key2', { nested: true });

      const exported = storage.exportData();
      expect(exported).toHaveProperty('key1');
      expect(exported).toHaveProperty('key2');
    });

    test('debe importar datos', () => {
      const data = {
        imported1: 'value1',
        imported2: { nested: true },
      };

      storage.importData(data);
      expect(storage.get('imported1')).toBe('value1');
      expect(storage.get('imported2')).toEqual({ nested: true });
    });
  });

  describe('global methods', () => {
    test('getGlobal debe obtener valor sin prefijo de usuario', () => {
      localStorage.setItem('gestion-globalKey', JSON.stringify('globalValue'));
      const result = storage.getGlobal('globalKey');
      expect(result).toBe('globalValue');
    });

    test('setGlobal debe guardar valor sin prefijo de usuario', () => {
      storage.setGlobal('globalTest', { data: true });
      const stored = localStorage.getItem('gestion-globalTest');
      expect(JSON.parse(stored)).toEqual({ data: true });
    });
  });
});
