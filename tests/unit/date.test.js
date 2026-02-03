/**
 * Tests para utilidades de fecha
 */

import { describe, test, expect } from '@jest/globals';
import {
  getDateKey,
  getTodayKey,
  getWeekNumber,
  getDayName,
  getMonthName,
  formatDate,
  isSameDay,
  isToday,
  addDays,
  parseTimeToMinutes,
  minutesToTime,
  formatRelativeTime,
} from '../../src/js/utils/date.js';

describe('date utils', () => {
  describe('getDateKey', () => {
    test('debe formatear fecha como YYYY-MM-DD', () => {
      const date = new Date('2024-03-15T10:30:00');
      expect(getDateKey(date)).toBe('2024-03-15');
    });

    test('debe usar fecha actual por defecto', () => {
      const today = new Date();
      const expected = today.toISOString().split('T')[0];
      expect(getDateKey()).toBe(expected);
    });
  });

  describe('getTodayKey', () => {
    test('debe retornar fecha de hoy', () => {
      const today = new Date();
      const expected = today.toISOString().split('T')[0];
      expect(getTodayKey()).toBe(expected);
    });
  });

  describe('getWeekNumber', () => {
    test('debe calcular número de semana correctamente', () => {
      const date = new Date('2024-01-15');
      const weekNum = getWeekNumber(date);
      expect(weekNum).toBeGreaterThan(0);
      expect(weekNum).toBeLessThanOrEqual(53);
    });
  });

  describe('getDayName', () => {
    test('debe retornar nombre del día en español', () => {
      expect(getDayName(0, 'es')).toBe('Domingo');
      expect(getDayName(1, 'es')).toBe('Lunes');
      expect(getDayName(6, 'es')).toBe('Sábado');
    });

    test('debe retornar nombre del día en inglés', () => {
      expect(getDayName(0, 'en')).toBe('Sunday');
      expect(getDayName(1, 'en')).toBe('Monday');
    });
  });

  describe('getMonthName', () => {
    test('debe retornar nombre del mes en español', () => {
      expect(getMonthName(0, 'es')).toBe('Enero');
      expect(getMonthName(11, 'es')).toBe('Diciembre');
    });

    test('debe retornar nombre del mes en inglés', () => {
      expect(getMonthName(0, 'en')).toBe('January');
      expect(getMonthName(11, 'en')).toBe('December');
    });
  });

  describe('formatDate', () => {
    test('debe formatear fecha correctamente', () => {
      const date = new Date(2024, 2, 15); // March 15, 2024 (month is 0-indexed)
      const formatted = formatDate(date, 'es');
      expect(formatted).toContain('15');
      expect(formatted).toContain('Marzo');
      expect(formatted).toContain('2024');
    });
  });

  describe('isSameDay', () => {
    test('debe detectar mismo día', () => {
      const date1 = new Date('2024-03-15T10:00:00');
      const date2 = new Date('2024-03-15T20:00:00');
      expect(isSameDay(date1, date2)).toBe(true);
    });

    test('debe detectar días diferentes', () => {
      const date1 = new Date('2024-03-15');
      const date2 = new Date('2024-03-16');
      expect(isSameDay(date1, date2)).toBe(false);
    });
  });

  describe('isToday', () => {
    test('debe detectar si es hoy', () => {
      expect(isToday(new Date())).toBe(true);
    });

    test('debe detectar si no es hoy', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      expect(isToday(yesterday)).toBe(false);
    });
  });

  describe('addDays', () => {
    test('debe agregar días correctamente', () => {
      const date = new Date(2024, 2, 15); // March 15, 2024 (month is 0-indexed)
      const result = addDays(date, 5);
      expect(result.getDate()).toBe(20);
    });

    test('debe restar días correctamente', () => {
      const date = new Date(2024, 2, 15); // March 15, 2024
      const result = addDays(date, -5);
      expect(result.getDate()).toBe(10);
    });

    test('no debe modificar fecha original', () => {
      const date = new Date(2024, 2, 15); // March 15, 2024
      addDays(date, 5);
      expect(date.getDate()).toBe(15);
    });
  });

  describe('parseTimeToMinutes', () => {
    test('debe convertir hora a minutos', () => {
      expect(parseTimeToMinutes('00:00')).toBe(0);
      expect(parseTimeToMinutes('01:00')).toBe(60);
      expect(parseTimeToMinutes('12:30')).toBe(750);
      expect(parseTimeToMinutes('23:59')).toBe(1439);
    });

    test('debe manejar valores vacíos', () => {
      expect(parseTimeToMinutes('')).toBe(0);
      expect(parseTimeToMinutes(null)).toBe(0);
    });
  });

  describe('minutesToTime', () => {
    test('debe convertir minutos a hora', () => {
      expect(minutesToTime(0)).toBe('00:00');
      expect(minutesToTime(60)).toBe('01:00');
      expect(minutesToTime(750)).toBe('12:30');
      expect(minutesToTime(1439)).toBe('23:59');
    });
  });

  describe('formatRelativeTime', () => {
    test('debe formatear tiempo relativo en español', () => {
      const now = new Date();
      expect(formatRelativeTime(now, 'es')).toBe('Ahora');

      const fiveMinAgo = new Date(now.getTime() - 5 * 60 * 1000);
      expect(formatRelativeTime(fiveMinAgo, 'es')).toBe('Hace 5 min');

      const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
      expect(formatRelativeTime(twoHoursAgo, 'es')).toBe('Hace 2h');
    });

    test('debe formatear tiempo relativo en inglés', () => {
      const now = new Date();
      expect(formatRelativeTime(now, 'en')).toBe('Now');

      const fiveMinAgo = new Date(now.getTime() - 5 * 60 * 1000);
      expect(formatRelativeTime(fiveMinAgo, 'en')).toBe('5m ago');
    });
  });
});
