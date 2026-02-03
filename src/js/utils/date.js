/**
 * Utilidades para manejo de fechas
 * @module utils/date
 */

import { DAYS_OF_WEEK, MONTHS } from '../config.js';

/**
 * Obtiene la clave de fecha en formato YYYY-MM-DD
 * @param {Date} date - Fecha a formatear
 * @returns {string}
 */
export function getDateKey(date = new Date()) {
  return date.toISOString().split('T')[0];
}

/**
 * Obtiene la clave de hoy
 * @returns {string}
 */
export function getTodayKey() {
  return getDateKey(new Date());
}

/**
 * Obtiene el número de semana del año
 * @param {Date} date
 * @returns {number}
 */
export function getWeekNumber(date = new Date()) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

/**
 * Obtiene el número de día desde una fecha de inicio
 * @param {Date} date - Fecha actual
 * @param {string} startDateStr - Fecha de inicio en formato YYYY-MM-DD
 * @returns {number}
 */
export function getDayNumber(date = new Date(), startDateStr) {
  if (!startDateStr) return 1;
  const startDate = new Date(startDateStr);
  const diffTime = Math.abs(date - startDate);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays + 1;
}

/**
 * Obtiene el nombre del día de la semana
 * @param {number} dayIndex - Índice del día (0-6, 0=Domingo)
 * @param {string} lang - Idioma ('es' o 'en')
 * @returns {string}
 */
export function getDayName(dayIndex, lang = 'es') {
  return DAYS_OF_WEEK[lang]?.[dayIndex] || DAYS_OF_WEEK.es[dayIndex];
}

/**
 * Obtiene el nombre del día abreviado
 * @param {number} dayIndex
 * @param {string} lang
 * @returns {string}
 */
export function getDayNameShort(dayIndex, lang = 'es') {
  const fullName = getDayName(dayIndex, lang);
  return fullName.substring(0, 3);
}

/**
 * Obtiene el nombre del mes
 * @param {number} monthIndex - Índice del mes (0-11)
 * @param {string} lang - Idioma
 * @returns {string}
 */
export function getMonthName(monthIndex, lang = 'es') {
  return MONTHS[lang]?.[monthIndex] || MONTHS.es[monthIndex];
}

/**
 * Formatea una fecha para mostrar
 * @param {Date} date
 * @param {string} lang
 * @returns {string}
 */
export function formatDate(date, lang = 'es') {
  const day = date.getDate();
  const month = getMonthName(date.getMonth(), lang);
  const year = date.getFullYear();
  return `${day} de ${month} de ${year}`;
}

/**
 * Formatea una fecha de forma corta
 * @param {Date} date
 * @param {string} lang
 * @returns {string}
 */
export function formatDateShort(date, lang = 'es') {
  const day = date.getDate();
  const month = getMonthName(date.getMonth(), lang).substring(0, 3);
  return `${day} ${month}`;
}

/**
 * Compara si dos fechas son el mismo día
 * @param {Date} date1
 * @param {Date} date2
 * @returns {boolean}
 */
export function isSameDay(date1, date2) {
  return date1.getFullYear() === date2.getFullYear() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getDate() === date2.getDate();
}

/**
 * Verifica si una fecha es hoy
 * @param {Date} date
 * @returns {boolean}
 */
export function isToday(date) {
  return isSameDay(date, new Date());
}

/**
 * Verifica si una fecha es ayer
 * @param {Date} date
 * @returns {boolean}
 */
export function isYesterday(date) {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return isSameDay(date, yesterday);
}

/**
 * Añade días a una fecha
 * @param {Date} date
 * @param {number} days
 * @returns {Date}
 */
export function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Obtiene el inicio de la semana (lunes)
 * @param {Date} date
 * @returns {Date}
 */
export function getWeekStart(date) {
  const result = new Date(date);
  const day = result.getDay();
  const diff = result.getDate() - day + (day === 0 ? -6 : 1);
  result.setDate(diff);
  return result;
}

/**
 * Obtiene el fin de la semana (domingo)
 * @param {Date} date
 * @returns {Date}
 */
export function getWeekEnd(date) {
  const result = getWeekStart(date);
  result.setDate(result.getDate() + 6);
  return result;
}

/**
 * Parsea una hora en formato HH:MM a minutos desde medianoche
 * @param {string} timeStr - Hora en formato HH:MM
 * @returns {number}
 */
export function parseTimeToMinutes(timeStr) {
  if (!timeStr) return 0;
  const [hours, minutes] = timeStr.split(':').map(Number);
  return (hours || 0) * 60 + (minutes || 0);
}

/**
 * Convierte minutos desde medianoche a formato HH:MM
 * @param {number} minutes
 * @returns {string}
 */
export function minutesToTime(minutes) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

/**
 * Formatea tiempo relativo (hace X minutos, etc.)
 * @param {Date|string|number} timestamp
 * @param {string} lang
 * @returns {string}
 */
export function formatRelativeTime(timestamp, lang = 'es') {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (lang === 'es') {
    if (diffMins < 1) return 'Ahora';
    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffHours < 24) return `Hace ${diffHours}h`;
    if (diffDays === 1) return 'Ayer';
    if (diffDays < 7) return `Hace ${diffDays} días`;
    return formatDateShort(date, lang);
  } else {
    if (diffMins < 1) return 'Now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return formatDateShort(date, lang);
  }
}
