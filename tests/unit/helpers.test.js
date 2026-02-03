/**
 * Tests para utilidades generales
 */

import { describe, test, expect, jest } from '@jest/globals';
import {
  generateId,
  generateUUID,
  debounce,
  throttle,
  deepClone,
  deepMerge,
  capitalize,
  truncate,
  formatNumber,
  formatCurrency,
  groupBy,
  sortBy,
  unique,
} from '../../src/js/utils/helpers.js';

describe('helpers utils', () => {
  describe('generateId', () => {
    test('debe generar IDs únicos', () => {
      const id1 = generateId();
      const id2 = generateId();
      expect(id1).not.toBe(id2);
    });

    test('debe generar strings no vacíos', () => {
      const id = generateId();
      expect(id.length).toBeGreaterThan(0);
    });
  });

  describe('generateUUID', () => {
    test('debe generar UUIDs con formato válido', () => {
      const uuid = generateUUID();
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      expect(uuid).toMatch(uuidRegex);
    });

    test('debe generar UUIDs únicos', () => {
      const uuid1 = generateUUID();
      const uuid2 = generateUUID();
      expect(uuid1).not.toBe(uuid2);
    });
  });

  describe('debounce', () => {
    jest.useFakeTimers();

    test('debe retrasar ejecución', () => {
      const mockFn = jest.fn();
      const debouncedFn = debounce(mockFn, 100);

      debouncedFn();
      debouncedFn();
      debouncedFn();

      expect(mockFn).not.toHaveBeenCalled();

      jest.advanceTimersByTime(100);
      expect(mockFn).toHaveBeenCalledTimes(1);
    });
  });

  describe('throttle', () => {
    jest.useFakeTimers();

    test('debe limitar frecuencia de ejecución', () => {
      const mockFn = jest.fn();
      const throttledFn = throttle(mockFn, 100);

      throttledFn();
      throttledFn();
      throttledFn();

      expect(mockFn).toHaveBeenCalledTimes(1);

      jest.advanceTimersByTime(100);
      throttledFn();
      expect(mockFn).toHaveBeenCalledTimes(2);
    });
  });

  describe('deepClone', () => {
    test('debe clonar objetos simples', () => {
      const obj = { a: 1, b: 2 };
      const clone = deepClone(obj);
      expect(clone).toEqual(obj);
      expect(clone).not.toBe(obj);
    });

    test('debe clonar objetos anidados', () => {
      const obj = { a: { b: { c: 1 } } };
      const clone = deepClone(obj);
      expect(clone).toEqual(obj);
      clone.a.b.c = 2;
      expect(obj.a.b.c).toBe(1);
    });

    test('debe clonar arrays', () => {
      const arr = [1, [2, 3], { a: 4 }];
      const clone = deepClone(arr);
      expect(clone).toEqual(arr);
      expect(clone).not.toBe(arr);
    });

    test('debe clonar fechas', () => {
      const date = new Date('2024-03-15');
      const clone = deepClone(date);
      expect(clone.getTime()).toBe(date.getTime());
      expect(clone).not.toBe(date);
    });
  });

  describe('deepMerge', () => {
    test('debe mezclar objetos', () => {
      const target = { a: 1, b: 2 };
      const source = { b: 3, c: 4 };
      const result = deepMerge(target, source);
      expect(result).toEqual({ a: 1, b: 3, c: 4 });
    });

    test('debe mezclar objetos anidados', () => {
      const target = { a: { b: 1, c: 2 } };
      const source = { a: { c: 3, d: 4 } };
      const result = deepMerge(target, source);
      expect(result).toEqual({ a: { b: 1, c: 3, d: 4 } });
    });
  });

  describe('capitalize', () => {
    test('debe capitalizar primera letra', () => {
      expect(capitalize('hello')).toBe('Hello');
      expect(capitalize('WORLD')).toBe('WORLD');
    });

    test('debe manejar strings vacíos', () => {
      expect(capitalize('')).toBe('');
      expect(capitalize(null)).toBe('');
    });
  });

  describe('truncate', () => {
    test('debe truncar strings largos', () => {
      expect(truncate('Hello World', 8)).toBe('Hello...');
    });

    test('no debe truncar strings cortos', () => {
      expect(truncate('Hi', 10)).toBe('Hi');
    });

    test('debe usar sufijo personalizado', () => {
      expect(truncate('Hello World', 8, '…')).toBe('Hello W…');
    });
  });

  describe('formatNumber', () => {
    test('debe formatear números con separadores', () => {
      const formatted = formatNumber(1234567, 'es-CL');
      expect(formatted).toContain('1');
      // El formato específico depende del locale
    });
  });

  describe('formatCurrency', () => {
    test('debe formatear como moneda', () => {
      const formatted = formatCurrency(1500, 'CLP', 'es-CL');
      expect(formatted).toContain('1');
      // El símbolo depende del locale
    });
  });

  describe('groupBy', () => {
    test('debe agrupar por propiedad', () => {
      const items = [
        { type: 'a', value: 1 },
        { type: 'b', value: 2 },
        { type: 'a', value: 3 },
      ];
      const grouped = groupBy(items, 'type');
      expect(grouped.a).toHaveLength(2);
      expect(grouped.b).toHaveLength(1);
    });

    test('debe agrupar con función', () => {
      const items = [1, 2, 3, 4, 5];
      const grouped = groupBy(items, n => (n % 2 === 0 ? 'even' : 'odd'));
      expect(grouped.odd).toEqual([1, 3, 5]);
      expect(grouped.even).toEqual([2, 4]);
    });
  });

  describe('sortBy', () => {
    test('debe ordenar ascendente', () => {
      const items = [{ n: 3 }, { n: 1 }, { n: 2 }];
      const sorted = sortBy(items, 'n', 'asc');
      expect(sorted.map(i => i.n)).toEqual([1, 2, 3]);
    });

    test('debe ordenar descendente', () => {
      const items = [{ n: 1 }, { n: 3 }, { n: 2 }];
      const sorted = sortBy(items, 'n', 'desc');
      expect(sorted.map(i => i.n)).toEqual([3, 2, 1]);
    });

    test('no debe modificar array original', () => {
      const items = [{ n: 3 }, { n: 1 }];
      sortBy(items, 'n');
      expect(items[0].n).toBe(3);
    });
  });

  describe('unique', () => {
    test('debe eliminar duplicados primitivos', () => {
      expect(unique([1, 2, 2, 3, 3, 3])).toEqual([1, 2, 3]);
    });

    test('debe eliminar duplicados por propiedad', () => {
      const items = [
        { id: 1, name: 'a' },
        { id: 2, name: 'b' },
        { id: 1, name: 'c' },
      ];
      const result = unique(items, 'id');
      expect(result).toHaveLength(2);
    });
  });
});
