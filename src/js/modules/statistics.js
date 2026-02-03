/**
 * Módulo de Estadísticas
 * Análisis completo de gastos, hábitos, tareas y metas
 * @module modules/statistics
 */

import { storage } from '../services/storage.js';

/**
 * Categorías de gastos con emojis
 */
const EXPENSE_CATEGORIES = {
  'alimentacion': { name: 'Alimentación', emoji: '🍔', color: '#f59e0b' },
  'transporte': { name: 'Transporte', emoji: '🚗', color: '#3b82f6' },
  'salud': { name: 'Salud', emoji: '💊', color: '#10b981' },
  'entretenimiento': { name: 'Entretenimiento', emoji: '🎬', color: '#8b5cf6' },
  'ropa': { name: 'Ropa', emoji: '👕', color: '#ec4899' },
  'servicios': { name: 'Servicios', emoji: '📱', color: '#6366f1' },
  'hogar': { name: 'Hogar', emoji: '🏠', color: '#14b8a6' },
  'educacion': { name: 'Educación', emoji: '📚', color: '#f97316' },
  'belleza': { name: 'Belleza', emoji: '💄', color: '#e11d48' },
  'otro': { name: 'Otro', emoji: '📦', color: '#6b7280' }
};

/**
 * Obtiene el rango de fechas para un período
 * @param {string} period - 'week', 'month', 'year', 'all'
 * @param {Date} referenceDate - Fecha de referencia
 * @returns {{start: Date, end: Date}}
 */
export function getDateRange(period, referenceDate = new Date()) {
  const end = new Date(referenceDate);
  end.setHours(23, 59, 59, 999);

  const start = new Date(referenceDate);
  start.setHours(0, 0, 0, 0);

  switch (period) {
    case 'week':
      start.setDate(start.getDate() - start.getDay() + 1); // Lunes
      break;
    case 'month':
      start.setDate(1);
      break;
    case 'year':
      start.setMonth(0, 1);
      break;
    case 'last30':
      start.setDate(start.getDate() - 30);
      break;
    case 'last90':
      start.setDate(start.getDate() - 90);
      break;
    case 'all':
      start.setFullYear(2020, 0, 1);
      break;
    default:
      start.setDate(1); // Default to current month
  }

  return { start, end };
}

/**
 * Filtra datos por rango de fechas
 * @param {Array} items - Items con propiedad date
 * @param {Date} start - Fecha inicio
 * @param {Date} end - Fecha fin
 * @returns {Array}
 */
function filterByDateRange(items, start, end) {
  return items.filter(item => {
    const itemDate = new Date(item.date);
    return itemDate >= start && itemDate <= end;
  });
}

// ==================== ESTADÍSTICAS DE GASTOS ====================

/**
 * Obtiene todos los gastos
 * @returns {Array}
 */
function getExpenses() {
  return storage.get('expenses', []);
}

/**
 * Calcula el total de gastos para un período
 * @param {string} period - Período a calcular
 * @returns {number}
 */
export function getTotalExpenses(period = 'month') {
  const expenses = getExpenses();
  const { start, end } = getDateRange(period);
  const filtered = filterByDateRange(expenses, start, end);

  return filtered.reduce((sum, e) => sum + (parseFloat(e.total) || 0), 0);
}

/**
 * Obtiene gastos agrupados por categoría
 * @param {string} period - Período a analizar
 * @returns {Array<{category: string, name: string, emoji: string, total: number, count: number, percentage: number}>}
 */
export function getExpensesByCategory(period = 'month') {
  const expenses = getExpenses();
  const { start, end } = getDateRange(period);
  const filtered = filterByDateRange(expenses, start, end);

  const byCategory = {};
  let grandTotal = 0;

  filtered.forEach(expense => {
    const cat = extractCategoryId(expense.category) || 'otro';
    if (!byCategory[cat]) {
      byCategory[cat] = { total: 0, count: 0 };
    }
    const amount = parseFloat(expense.total) || 0;
    byCategory[cat].total += amount;
    byCategory[cat].count++;
    grandTotal += amount;
  });

  // Convertir a array y añadir metadatos
  const result = Object.entries(byCategory).map(([catId, data]) => {
    const catInfo = EXPENSE_CATEGORIES[catId] || EXPENSE_CATEGORIES.otro;
    return {
      category: catId,
      name: catInfo.name,
      emoji: catInfo.emoji,
      color: catInfo.color,
      total: data.total,
      count: data.count,
      percentage: grandTotal > 0 ? Math.round((data.total / grandTotal) * 100) : 0
    };
  });

  // Ordenar por total descendente
  return result.sort((a, b) => b.total - a.total);
}

/**
 * Extrae el ID de categoría de diferentes formatos
 * @param {string} category - Categoría en cualquier formato
 * @returns {string}
 */
function extractCategoryId(category) {
  if (!category) return 'otro';

  // Si ya es un ID simple
  const lower = category.toLowerCase();
  if (EXPENSE_CATEGORIES[lower]) return lower;

  // Si tiene formato "🍔 Alimentación"
  for (const [id, info] of Object.entries(EXPENSE_CATEGORIES)) {
    if (category.includes(info.emoji) || category.toLowerCase().includes(info.name.toLowerCase())) {
      return id;
    }
  }

  return 'otro';
}

/**
 * Obtiene gastos agrupados por día
 * @param {string} period - Período a analizar
 * @returns {Array<{date: string, total: number, count: number}>}
 */
export function getExpensesByDay(period = 'month') {
  const expenses = getExpenses();
  const { start, end } = getDateRange(period);
  const filtered = filterByDateRange(expenses, start, end);

  const byDay = {};

  filtered.forEach(expense => {
    const day = expense.date;
    if (!byDay[day]) {
      byDay[day] = { total: 0, count: 0 };
    }
    byDay[day].total += parseFloat(expense.total) || 0;
    byDay[day].count++;
  });

  return Object.entries(byDay)
    .map(([date, data]) => ({ date, ...data }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Obtiene gastos agrupados por mes
 * @param {number} months - Cantidad de meses hacia atrás
 * @returns {Array<{month: string, label: string, total: number, count: number}>}
 */
export function getExpensesByMonth(months = 6) {
  const expenses = getExpenses();
  const byMonth = {};

  const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

  // Inicializar los últimos N meses
  for (let i = months - 1; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    byMonth[key] = {
      month: key,
      label: `${monthNames[date.getMonth()]} ${date.getFullYear()}`,
      total: 0,
      count: 0
    };
  }

  // Sumar gastos
  expenses.forEach(expense => {
    if (!expense.date) return;
    const key = expense.date.substring(0, 7); // YYYY-MM
    if (byMonth[key]) {
      byMonth[key].total += parseFloat(expense.total) || 0;
      byMonth[key].count++;
    }
  });

  return Object.values(byMonth);
}

/**
 * Obtiene el promedio diario de gastos
 * @param {string} period
 * @returns {number}
 */
export function getAverageDailyExpense(period = 'month') {
  const { start, end } = getDateRange(period);
  const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
  const total = getTotalExpenses(period);

  return days > 0 ? Math.round(total / days) : 0;
}

/**
 * Obtiene los gastos más grandes
 * @param {string} period
 * @param {number} limit
 * @returns {Array}
 */
export function getTopExpenses(period = 'month', limit = 5) {
  const expenses = getExpenses();
  const { start, end } = getDateRange(period);
  const filtered = filterByDateRange(expenses, start, end);

  return filtered
    .sort((a, b) => (parseFloat(b.total) || 0) - (parseFloat(a.total) || 0))
    .slice(0, limit);
}

/**
 * Compara gastos con el período anterior
 * @param {string} period
 * @returns {{current: number, previous: number, difference: number, percentageChange: number}}
 */
export function compareWithPreviousPeriod(period = 'month') {
  const current = getTotalExpenses(period);

  // Calcular período anterior
  const { start } = getDateRange(period);
  const previousEnd = new Date(start);
  previousEnd.setDate(previousEnd.getDate() - 1);

  let previousStart;
  switch (period) {
    case 'week':
      previousStart = new Date(previousEnd);
      previousStart.setDate(previousStart.getDate() - 6);
      break;
    case 'month':
      previousStart = new Date(previousEnd);
      previousStart.setDate(1);
      break;
    default:
      previousStart = new Date(previousEnd);
      previousStart.setMonth(previousStart.getMonth() - 1);
  }

  const expenses = getExpenses();
  const previousFiltered = filterByDateRange(expenses, previousStart, previousEnd);
  const previous = previousFiltered.reduce((sum, e) => sum + (parseFloat(e.total) || 0), 0);

  const difference = current - previous;
  const percentageChange = previous > 0 ? Math.round((difference / previous) * 100) : 0;

  return { current, previous, difference, percentageChange };
}

// ==================== ESTADÍSTICAS DE HÁBITOS ====================

/**
 * Obtiene todos los hábitos
 * @returns {Array}
 */
function getHabits() {
  return storage.get('habits', []);
}

/**
 * Obtiene el historial de hábitos completados
 * @returns {Object}
 */
function getHabitsHistory() {
  return storage.get('habitsHistory', {});
}

/**
 * Calcula estadísticas de hábitos
 * @param {string} period
 * @returns {Object}
 */
export function getHabitsStats(period = 'month') {
  const habits = getHabits();
  const history = getHabitsHistory();
  const { start, end } = getDateRange(period);

  let totalPossible = 0;
  let totalCompleted = 0;
  const byHabit = {};

  // Iterar por cada día del período
  const current = new Date(start);
  while (current <= end) {
    const dateKey = current.toISOString().split('T')[0];
    const dayOfWeek = current.getDay();

    habits.forEach(habit => {
      // Verificar si el hábito aplica para este día
      if (!habit.days || habit.days.includes(dayOfWeek)) {
        totalPossible++;

        if (!byHabit[habit.id]) {
          byHabit[habit.id] = { name: habit.name, emoji: habit.emoji, possible: 0, completed: 0 };
        }
        byHabit[habit.id].possible++;

        // Verificar si está completado
        const dayHistory = history[dateKey] || [];
        if (dayHistory.includes(habit.id)) {
          totalCompleted++;
          byHabit[habit.id].completed++;
        }
      }
    });

    current.setDate(current.getDate() + 1);
  }

  const completionRate = totalPossible > 0 ? Math.round((totalCompleted / totalPossible) * 100) : 0;

  // Calcular porcentaje por hábito
  const habitsBreakdown = Object.values(byHabit).map(h => ({
    ...h,
    percentage: h.possible > 0 ? Math.round((h.completed / h.possible) * 100) : 0
  })).sort((a, b) => b.percentage - a.percentage);

  return {
    totalPossible,
    totalCompleted,
    completionRate,
    habitsBreakdown
  };
}

// ==================== ESTADÍSTICAS DE METAS ====================

/**
 * Obtiene las metas semanales
 * @returns {Array}
 */
function getGoals() {
  return storage.get('weeklyGoals', []);
}

/**
 * Calcula estadísticas de metas
 * @returns {Object}
 */
export function getGoalsStats() {
  const goals = getGoals();

  const total = goals.length;
  const completed = goals.filter(g => g.completed).length;
  const inProgress = goals.filter(g => !g.completed && g.progress > 0).length;
  const notStarted = goals.filter(g => !g.completed && (!g.progress || g.progress === 0)).length;

  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
  const averageProgress = total > 0
    ? Math.round(goals.reduce((sum, g) => sum + (g.progress || 0), 0) / total)
    : 0;

  return {
    total,
    completed,
    inProgress,
    notStarted,
    completionRate,
    averageProgress
  };
}

// ==================== ESTADÍSTICAS DE AGENDA ====================

/**
 * Obtiene las actividades de la agenda
 * @returns {Object} - Objeto con fechas como claves
 */
function getSchedule() {
  return storage.get('schedule', {});
}

/**
 * Calcula estadísticas de la agenda
 * @param {string} period
 * @returns {Object}
 */
export function getScheduleStats(period = 'month') {
  const schedule = getSchedule();
  const { start, end } = getDateRange(period);

  let totalTasks = 0;
  let completedTasks = 0;
  const byCategory = {};

  // Iterar por fechas en el período
  const current = new Date(start);
  while (current <= end) {
    const dateKey = current.toISOString().split('T')[0];
    const dayTasks = schedule[dateKey] || [];

    dayTasks.forEach(task => {
      totalTasks++;
      if (task.completed) completedTasks++;

      const cat = task.category || 'otro';
      if (!byCategory[cat]) {
        byCategory[cat] = { total: 0, completed: 0 };
      }
      byCategory[cat].total++;
      if (task.completed) byCategory[cat].completed++;
    });

    current.setDate(current.getDate() + 1);
  }

  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return {
    totalTasks,
    completedTasks,
    completionRate,
    byCategory
  };
}

// ==================== RESUMEN GENERAL ====================

/**
 * Obtiene un resumen completo de todas las estadísticas
 * @param {string} period
 * @returns {Object}
 */
export function getFullSummary(period = 'month') {
  const expenseComparison = compareWithPreviousPeriod(period);

  return {
    period,
    expenses: {
      total: getTotalExpenses(period),
      average: getAverageDailyExpense(period),
      byCategory: getExpensesByCategory(period),
      byMonth: getExpensesByMonth(6),
      top: getTopExpenses(period, 5),
      comparison: expenseComparison
    },
    habits: getHabitsStats(period),
    goals: getGoalsStats(),
    schedule: getScheduleStats(period)
  };
}

/**
 * Formatea un monto en pesos chilenos
 * @param {number} amount
 * @returns {string}
 */
export function formatMoney(amount) {
  return `$${Math.round(amount).toLocaleString('es-CL')}`;
}

export default {
  getDateRange,
  getTotalExpenses,
  getExpensesByCategory,
  getExpensesByDay,
  getExpensesByMonth,
  getAverageDailyExpense,
  getTopExpenses,
  compareWithPreviousPeriod,
  getHabitsStats,
  getGoalsStats,
  getScheduleStats,
  getFullSummary,
  formatMoney,
  EXPENSE_CATEGORIES
};
