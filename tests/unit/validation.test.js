/**
 * Tests para utilidades de validación
 */

import { describe, test, expect } from '@jest/globals';
import {
  sanitizeHTML,
  escapeHTML,
  isValidEmail,
  isNotEmpty,
  isValidTime,
  isValidDate,
  isInRange,
  hasMinLength,
  validateObject,
} from '../../src/js/utils/validation.js';

describe('validation utils', () => {
  describe('sanitizeHTML', () => {
    test('debe sanitizar tags HTML', () => {
      expect(sanitizeHTML('<script>alert("xss")</script>')).not.toContain('<script>');
    });

    test('debe manejar strings vacíos', () => {
      expect(sanitizeHTML('')).toBe('');
      expect(sanitizeHTML(null)).toBe('');
      expect(sanitizeHTML(undefined)).toBe('');
    });

    test('debe preservar texto normal', () => {
      expect(sanitizeHTML('Hola mundo')).toBe('Hola mundo');
    });
  });

  describe('escapeHTML', () => {
    test('debe escapar caracteres especiales', () => {
      expect(escapeHTML('<div>')).toBe('&lt;div&gt;');
      expect(escapeHTML('"test"')).toBe('&quot;test&quot;');
      expect(escapeHTML("it's")).toBe('it&#x27;s');
    });

    test('debe manejar strings vacíos', () => {
      expect(escapeHTML('')).toBe('');
      expect(escapeHTML(null)).toBe('');
    });
  });

  describe('isValidEmail', () => {
    test('debe validar emails correctos', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user.name@domain.co')).toBe(true);
      expect(isValidEmail('user+tag@example.org')).toBe(true);
    });

    test('debe rechazar emails inválidos', () => {
      expect(isValidEmail('invalid')).toBe(false);
      expect(isValidEmail('invalid@')).toBe(false);
      expect(isValidEmail('@domain.com')).toBe(false);
      expect(isValidEmail('')).toBe(false);
    });
  });

  describe('isNotEmpty', () => {
    test('debe detectar strings no vacíos', () => {
      expect(isNotEmpty('hello')).toBe(true);
      expect(isNotEmpty('  text  ')).toBe(true);
    });

    test('debe detectar strings vacíos', () => {
      expect(isNotEmpty('')).toBe(false);
      expect(isNotEmpty('   ')).toBe(false);
      expect(isNotEmpty(null)).toBe(false);
      expect(isNotEmpty(undefined)).toBe(false);
    });
  });

  describe('isValidTime', () => {
    test('debe validar horas correctas', () => {
      expect(isValidTime('00:00')).toBe(true);
      expect(isValidTime('12:30')).toBe(true);
      expect(isValidTime('23:59')).toBe(true);
      expect(isValidTime('9:05')).toBe(true);
    });

    test('debe rechazar horas inválidas', () => {
      expect(isValidTime('24:00')).toBe(false);
      expect(isValidTime('12:60')).toBe(false);
      expect(isValidTime('abc')).toBe(false);
      expect(isValidTime('')).toBe(false);
    });
  });

  describe('isValidDate', () => {
    test('debe validar fechas correctas', () => {
      expect(isValidDate('2024-01-15')).toBe(true);
      expect(isValidDate('2023-12-31')).toBe(true);
    });

    test('debe rechazar fechas inválidas', () => {
      expect(isValidDate('2024-13-01')).toBe(false);
      expect(isValidDate('invalid')).toBe(false);
      expect(isValidDate('01-15-2024')).toBe(false);
    });
  });

  describe('isInRange', () => {
    test('debe validar números en rango', () => {
      expect(isInRange(5, 1, 10)).toBe(true);
      expect(isInRange(1, 1, 10)).toBe(true);
      expect(isInRange(10, 1, 10)).toBe(true);
    });

    test('debe rechazar números fuera de rango', () => {
      expect(isInRange(0, 1, 10)).toBe(false);
      expect(isInRange(11, 1, 10)).toBe(false);
    });
  });

  describe('hasMinLength', () => {
    test('debe validar longitud mínima', () => {
      expect(hasMinLength('hello', 3)).toBe(true);
      expect(hasMinLength('abc', 3)).toBe(true);
    });

    test('debe rechazar strings cortos', () => {
      expect(hasMinLength('ab', 3)).toBe(false);
      expect(hasMinLength('', 1)).toBe(false);
    });
  });

  describe('validateObject', () => {
    test('debe validar objeto con esquema', () => {
      const obj = { email: 'test@example.com', name: 'John' };
      const schema = {
        email: { required: true, type: 'email' },
        name: { required: true, minLength: 2 },
      };

      const result = validateObject(obj, schema);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('debe detectar campos requeridos faltantes', () => {
      const obj = { name: 'John' };
      const schema = {
        email: { required: true, type: 'email' },
        name: { required: true },
      };

      const result = validateObject(obj, schema);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    test('debe detectar email inválido', () => {
      const obj = { email: 'invalid', name: 'John' };
      const schema = {
        email: { required: true, type: 'email' },
      };

      const result = validateObject(obj, schema);
      expect(result.valid).toBe(false);
    });
  });
});
