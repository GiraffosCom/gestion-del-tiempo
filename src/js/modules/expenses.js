/**
 * Módulo de gestión de gastos
 * @module modules/expenses
 */

import { storage } from '../services/storage.js';
import { STORAGE_KEYS, CATEGORIES } from '../config.js';
import { getDateKey } from '../utils/date.js';
import { generateId, formatCurrency } from '../utils/helpers.js';
import { sanitizeHTML, isValidDate, isNumber } from '../utils/validation.js';

class ExpensesManager {
  constructor() {
    this.onUpdate = null;
  }

  /**
   * Establece callback para cuando se actualizan los gastos
   * @param {Function} callback
   */
  setOnUpdate(callback) {
    this.onUpdate = callback;
  }

  /**
   * Notifica cambios
   */
  notifyUpdate() {
    if (typeof this.onUpdate === 'function') {
      this.onUpdate();
    }
  }

  /**
   * Obtiene las categorías de gastos
   * @param {string} lang
   * @returns {Array}
   */
  getCategories(lang = 'es') {
    return CATEGORIES.expenses.map(cat => ({
      value: cat.value,
      label: lang === 'en' ? cat.labelEn : cat.label,
    }));
  }

  /**
   * Obtiene el emoji de una categoría
   * @param {string} categoryValue
   * @returns {string}
   */
  getCategoryEmoji(categoryValue) {
    const category = CATEGORIES.expenses.find(c => c.value === categoryValue);
    if (!category) return '📦';
    // Extraer emoji del label
    const match = category.label.match(/^(\p{Emoji})/u);
    return match ? match[1] : '📦';
  }

  /**
   * Obtiene todos los gastos del usuario
   * @returns {Array}
   */
  getExpenses() {
    const expenses = storage.get(STORAGE_KEYS.expenses, []);

    // Asegurar que cada gasto tenga ID y fecha válida
    return expenses.map((expense, index) => ({
      ...expense,
      id: expense.id || `expense-${index}-${Date.now()}`,
      date: expense.date || getDateKey(new Date()),
    })).filter(expense => isValidDate(expense.date));
  }

  /**
   * Guarda los gastos
   * @param {Array} expenses
   */
  saveExpenses(expenses) {
    storage.set(STORAGE_KEYS.expenses, expenses);
    this.notifyUpdate();
  }

  /**
   * Obtiene gastos de un mes específico
   * @param {number} year
   * @param {number} month - 0-11
   * @returns {Array}
   */
  getExpensesByMonth(year, month) {
    const expenses = this.getExpenses();
    return expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate.getFullYear() === year && expenseDate.getMonth() === month;
    });
  }

  /**
   * Obtiene gastos de una fecha específica
   * @param {Date} date
   * @returns {Array}
   */
  getExpensesByDate(date = new Date()) {
    const dateKey = getDateKey(date);
    const expenses = this.getExpenses();
    return expenses.filter(expense => expense.date === dateKey);
  }

  /**
   * Obtiene un gasto por ID
   * @param {string} expenseId
   * @returns {Object|null}
   */
  getExpenseById(expenseId) {
    const expenses = this.getExpenses();
    return expenses.find(e => e.id === expenseId) || null;
  }

  /**
   * Agrega un nuevo gasto
   * @param {Object} expenseData
   * @returns {Object}
   */
  addExpense({ description, amount, category, date, notes }) {
    const parsedAmount = parseFloat(amount);
    if (!isNumber(parsedAmount) || parsedAmount <= 0) {
      throw new Error('El monto debe ser un número positivo');
    }

    const expenses = this.getExpenses();

    const newExpense = {
      id: generateId(),
      description: sanitizeHTML(description) || 'Sin descripción',
      amount: parsedAmount,
      category: category || 'other',
      date: date || getDateKey(new Date()),
      notes: sanitizeHTML(notes) || '',
      createdAt: new Date().toISOString(),
    };

    expenses.push(newExpense);
    this.saveExpenses(expenses);

    return newExpense;
  }

  /**
   * Edita un gasto existente
   * @param {string} expenseId
   * @param {Object} updates
   * @returns {Object}
   */
  editExpense(expenseId, updates) {
    const expenses = this.getExpenses();
    const expenseIndex = expenses.findIndex(e => e.id === expenseId);

    if (expenseIndex === -1) {
      console.error('Expense not found:', expenseId);
      return null;
    }

    if (updates.amount !== undefined) {
      const parsedAmount = parseFloat(updates.amount);
      if (!isNumber(parsedAmount) || parsedAmount <= 0) {
        throw new Error('El monto debe ser un número positivo');
      }
      updates.amount = parsedAmount;
    }

    expenses[expenseIndex] = {
      ...expenses[expenseIndex],
      description: updates.description !== undefined ? sanitizeHTML(updates.description) : expenses[expenseIndex].description,
      amount: updates.amount !== undefined ? updates.amount : expenses[expenseIndex].amount,
      category: updates.category !== undefined ? updates.category : expenses[expenseIndex].category,
      date: updates.date !== undefined ? updates.date : expenses[expenseIndex].date,
      notes: updates.notes !== undefined ? sanitizeHTML(updates.notes) : expenses[expenseIndex].notes,
      updatedAt: new Date().toISOString(),
    };

    this.saveExpenses(expenses);

    return expenses[expenseIndex];
  }

  /**
   * Elimina un gasto
   * @param {string} expenseId
   */
  deleteExpense(expenseId) {
    const expenses = this.getExpenses();
    const filteredExpenses = expenses.filter(e => e.id !== expenseId);
    this.saveExpenses(filteredExpenses);
  }

  /**
   * Calcula el total de gastos de un mes
   * @param {number} year
   * @param {number} month
   * @returns {number}
   */
  getMonthlyTotal(year, month) {
    const monthExpenses = this.getExpensesByMonth(year, month);
    return monthExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  }

  /**
   * Calcula el total de gastos de una fecha
   * @param {Date} date
   * @returns {number}
   */
  getDailyTotal(date = new Date()) {
    const dayExpenses = this.getExpensesByDate(date);
    return dayExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  }

  /**
   * Obtiene gastos agrupados por categoría
   * @param {number} year
   * @param {number} month
   * @returns {Object}
   */
  getExpensesByCategory(year, month) {
    const monthExpenses = this.getExpensesByMonth(year, month);
    const byCategory = {};

    monthExpenses.forEach(expense => {
      const cat = expense.category || 'other';
      if (!byCategory[cat]) {
        byCategory[cat] = {
          total: 0,
          count: 0,
          expenses: [],
        };
      }
      byCategory[cat].total += expense.amount;
      byCategory[cat].count++;
      byCategory[cat].expenses.push(expense);
    });

    return byCategory;
  }

  /**
   * Obtiene estadísticas de gastos
   * @param {number} year
   * @param {number} month
   * @returns {Object}
   */
  getStatistics(year, month) {
    const monthExpenses = this.getExpensesByMonth(year, month);
    const total = monthExpenses.reduce((sum, e) => sum + e.amount, 0);
    const count = monthExpenses.length;
    const average = count > 0 ? total / count : 0;

    // Encontrar el mayor gasto
    const maxExpense = monthExpenses.reduce((max, e) => e.amount > max.amount ? e : max, { amount: 0 });

    // Día con más gastos
    const byDay = {};
    monthExpenses.forEach(e => {
      byDay[e.date] = (byDay[e.date] || 0) + e.amount;
    });
    const maxDayEntry = Object.entries(byDay).reduce((max, [date, amount]) =>
      amount > max.amount ? { date, amount } : max, { date: null, amount: 0 });

    return {
      total,
      count,
      average: Math.round(average),
      maxExpense,
      maxDay: maxDayEntry,
    };
  }

  /**
   * Formatea un monto como moneda
   * @param {number} amount
   * @param {string} currency
   * @param {string} locale
   * @returns {string}
   */
  formatAmount(amount, currency = 'CLP', locale = 'es-CL') {
    return formatCurrency(amount, currency, locale);
  }

  /**
   * Resetea todos los gastos
   */
  resetAll() {
    storage.remove(STORAGE_KEYS.expenses);
    this.notifyUpdate();
  }
}

// Exportar instancia singleton
export const expensesManager = new ExpensesManager();
export default expensesManager;
