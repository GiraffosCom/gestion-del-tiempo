/**
 * Utilidades de validación y sanitización
 * @module utils/validation
 */

/**
 * Sanitiza texto para prevenir XSS
 * @param {string} str - Texto a sanitizar
 * @returns {string} Texto sanitizado
 */
export function sanitizeHTML(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

/**
 * Escapa caracteres especiales de HTML
 * @param {string} str
 * @returns {string}
 */
export function escapeHTML(str) {
  if (!str) return '';
  const escapeMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };
  return str.replace(/[&<>"'/]/g, char => escapeMap[char]);
}

/**
 * Valida formato de email
 * @param {string} email
 * @returns {boolean}
 */
export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Valida que una cadena no esté vacía
 * @param {string} str
 * @returns {boolean}
 */
export function isNotEmpty(str) {
  return str !== null && str !== undefined && str.trim().length > 0;
}

/**
 * Valida formato de hora HH:MM
 * @param {string} time
 * @returns {boolean}
 */
export function isValidTime(time) {
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):([0-5][0-9])$/;
  return timeRegex.test(time);
}

/**
 * Valida formato de fecha YYYY-MM-DD
 * @param {string} date
 * @returns {boolean}
 */
export function isValidDate(date) {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date)) return false;
  const parsed = new Date(date);
  return !isNaN(parsed.getTime());
}

/**
 * Valida que un número esté en un rango
 * @param {number} num
 * @param {number} min
 * @param {number} max
 * @returns {boolean}
 */
export function isInRange(num, min, max) {
  return num >= min && num <= max;
}

/**
 * Valida longitud mínima de cadena
 * @param {string} str
 * @param {number} minLength
 * @returns {boolean}
 */
export function hasMinLength(str, minLength) {
  return Boolean(str && str.length >= minLength);
}

/**
 * Valida longitud máxima de cadena
 * @param {string} str
 * @param {number} maxLength
 * @returns {boolean}
 */
export function hasMaxLength(str, maxLength) {
  return !str || str.length <= maxLength;
}

/**
 * Valida que un valor sea un número
 * @param {*} value
 * @returns {boolean}
 */
export function isNumber(value) {
  return typeof value === 'number' && !isNaN(value);
}

/**
 * Valida que un valor sea un entero positivo
 * @param {*} value
 * @returns {boolean}
 */
export function isPositiveInteger(value) {
  return Number.isInteger(value) && value > 0;
}

/**
 * Normaliza un string (trim y lowercase)
 * @param {string} str
 * @returns {string}
 */
export function normalizeString(str) {
  return str ? str.trim().toLowerCase() : '';
}

/**
 * Valida un objeto contra un esquema simple
 * @param {Object} obj - Objeto a validar
 * @param {Object} schema - Esquema de validación
 * @returns {{valid: boolean, errors: string[]}}
 */
export function validateObject(obj, schema) {
  const errors = [];

  for (const [field, rules] of Object.entries(schema)) {
    const value = obj[field];

    if (rules.required && !isNotEmpty(value)) {
      errors.push(`${field} es requerido`);
      continue;
    }

    if (value !== undefined && value !== null && value !== '') {
      if (rules.type === 'email' && !isValidEmail(value)) {
        errors.push(`${field} debe ser un email válido`);
      }
      if (rules.type === 'time' && !isValidTime(value)) {
        errors.push(`${field} debe tener formato HH:MM`);
      }
      if (rules.type === 'date' && !isValidDate(value)) {
        errors.push(`${field} debe ser una fecha válida`);
      }
      if (rules.minLength && !hasMinLength(value, rules.minLength)) {
        errors.push(`${field} debe tener al menos ${rules.minLength} caracteres`);
      }
      if (rules.maxLength && !hasMaxLength(value, rules.maxLength)) {
        errors.push(`${field} debe tener máximo ${rules.maxLength} caracteres`);
      }
      if (rules.min !== undefined && value < rules.min) {
        errors.push(`${field} debe ser mayor o igual a ${rules.min}`);
      }
      if (rules.max !== undefined && value > rules.max) {
        errors.push(`${field} debe ser menor o igual a ${rules.max}`);
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Limpia un objeto eliminando propiedades undefined/null
 * @param {Object} obj
 * @returns {Object}
 */
export function cleanObject(obj) {
  return Object.fromEntries(
    Object.entries(obj).filter(([_, v]) => v !== undefined && v !== null)
  );
}
