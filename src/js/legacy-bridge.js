/**
 * Puente de compatibilidad con código legacy
 * Expone los módulos nuevos de forma compatible con el código existente en app.html
 * @module legacy-bridge
 */

import { APP_CONFIG } from './config.js';
import { storage } from './services/storage.js';
import { auth } from './services/auth.js';
import { themeManager } from './ui/theme.js';
import { modalManager } from './ui/modals.js';
import { habitsManager } from './modules/habits.js';
import { scheduleManager } from './modules/schedule.js';
import { goalsManager } from './modules/goals.js';
import { expensesManager } from './modules/expenses.js';
import { gymManager } from './modules/gym.js';
import { fastingManager, FASTING_TYPES } from './modules/fasting.js';
import { voiceAssistant, INTENT_TYPES } from './services/voice-assistant.js';
import { voiceExecutor } from './services/voice-executor.js';
import * as dateUtils from './utils/date.js';
import * as validation from './utils/validation.js';
import * as helpers from './utils/helpers.js';
import * as exercisesData from './data/exercises.js';
import * as habitsPresets from './data/habits-presets.js';

// Inicializar storage con el usuario actual
const currentUser = auth.getCurrentUser();
if (currentUser) {
  storage.setUser(currentUser.email);
}

// Inicializar tema
themeManager.init();

/**
 * API Global para compatibilidad con código legacy
 * Permite usar los nuevos módulos desde el código inline existente
 */
window.GestionApp = {
  // Configuración
  config: APP_CONFIG,

  // Servicios
  storage,
  auth,

  // UI
  themeManager,
  modalManager,

  // Módulos
  habitsManager,
  scheduleManager,
  goalsManager,
  expensesManager,
  gymManager,
  fastingManager,

  // Asistente de voz
  voiceAssistant,
  voiceExecutor,

  // Datos
  data: {
    exercises: exercisesData,
    habitsPresets,
    FASTING_TYPES,
    INTENT_TYPES,
  },

  // Utilidades
  utils: {
    date: dateUtils,
    validation,
    helpers,
  },

  // ==================== Funciones de compatibilidad ====================

  /**
   * Obtiene valor del storage (compatible con código legacy)
   */
  getStorage(key) {
    return storage.getRaw(key);
  },

  /**
   * Guarda valor en storage (compatible con código legacy)
   */
  setStorage(key, value) {
    return storage.set(key, value);
  },

  /**
   * Elimina valor del storage
   */
  removeStorage(key) {
    storage.remove(key);
  },

  /**
   * Verifica si modo oscuro está activo
   */
  isDarkMode() {
    return themeManager.isDarkMode();
  },

  /**
   * Alterna modo oscuro
   */
  toggleDarkMode() {
    return themeManager.toggleDarkMode();
  },

  /**
   * Obtiene género del usuario
   */
  getUserGender() {
    const profile = storage.get('user-profile', {});
    return profile.gender || 'female';
  },

  /**
   * Obtiene colores del tema
   */
  getThemeColors() {
    return themeManager.getTailwindClasses();
  },

  /**
   * Aplica tema
   */
  applyTheme() {
    themeManager.applyTheme();
  },

  /**
   * Cierra sesión
   */
  logout() {
    auth.logout();
    window.location.href = 'login.html';
  },

  /**
   * Obtiene el usuario actual
   */
  getCurrentUser() {
    return auth.getCurrentUser();
  },

  /**
   * Obtiene clave de fecha
   */
  getDateKey(date) {
    return dateUtils.getDateKey(date);
  },

  /**
   * Obtiene clave de hoy
   */
  getTodayKey() {
    return dateUtils.getTodayKey();
  },

  /**
   * Obtiene número de semana
   */
  getWeekNumber(date) {
    return dateUtils.getWeekNumber(date);
  },

  /**
   * Formatea fecha
   */
  formatDate(date, lang) {
    return dateUtils.formatDate(date, lang);
  },

  /**
   * Genera ID único
   */
  generateId() {
    return helpers.generateId();
  },

  /**
   * Sanitiza HTML
   */
  sanitizeHTML(str) {
    return validation.sanitizeHTML(str);
  },

  /**
   * Muestra modal de confirmación
   */
  async showConfirm(options) {
    return modalManager.showConfirm(options);
  },

  /**
   * Muestra modal de alerta
   */
  async showAlert(options) {
    return modalManager.showAlert(options);
  },

  /**
   * Abre modal por ID
   */
  openModal(modalId, options) {
    return modalManager.open(modalId, options);
  },

  /**
   * Cierra modal por ID
   */
  closeModal(modalId) {
    modalManager.close(modalId);
  },

  // ==================== Hábitos ====================

  /**
   * Obtiene hábitos para una fecha
   */
  getHabits(date) {
    return habitsManager.getHabits(date);
  },

  /**
   * Alterna hábito
   */
  toggleHabit(habitId, date) {
    return habitsManager.toggleHabit(habitId, date);
  },

  /**
   * Agrega hábito
   */
  addHabit(data, date) {
    return habitsManager.addHabit(data, date);
  },

  /**
   * Obtiene racha de hábitos
   */
  getHabitsStreak() {
    return habitsManager.getStreak();
  },

  // ==================== Agenda ====================

  /**
   * Obtiene agenda para una fecha
   */
  getSchedule(date) {
    return scheduleManager.getSchedule(date);
  },

  /**
   * Alterna actividad
   */
  toggleActivity(activityId, date) {
    return scheduleManager.toggleActivity(activityId, date);
  },

  /**
   * Agrega actividad
   */
  addActivity(data, date) {
    return scheduleManager.addActivity(data, date);
  },

  /**
   * Obtiene categorías de agenda
   */
  getScheduleCategories(lang) {
    return scheduleManager.getCategories(lang);
  },

  // ==================== Metas ====================

  /**
   * Obtiene todas las metas
   */
  getGoals() {
    return goalsManager.getGoals();
  },

  /**
   * Obtiene meta de la semana actual
   */
  getCurrentWeekGoal(date) {
    return goalsManager.getCurrentWeekGoal(date);
  },

  // ==================== Gastos ====================

  /**
   * Obtiene gastos
   */
  getExpenses() {
    return expensesManager.getExpenses();
  },

  /**
   * Agrega gasto
   */
  addExpense(data) {
    return expensesManager.addExpense(data);
  },

  /**
   * Obtiene total mensual
   */
  getMonthlyExpenseTotal(year, month) {
    return expensesManager.getMonthlyTotal(year, month);
  },

  /**
   * Obtiene categorías de gastos
   */
  getExpenseCategories(lang) {
    return expensesManager.getCategories(lang);
  },

  // ==================== Progreso ====================

  /**
   * Obtiene progreso diario
   */
  getDailyProgress(date) {
    const habits = habitsManager.getProgress(date);
    const schedule = scheduleManager.getProgress(date);

    const totalCompleted = habits.completed + schedule.completed;
    const totalItems = habits.total + schedule.total;
    const percentage = totalItems > 0 ? Math.round((totalCompleted / totalItems) * 100) : 0;

    return {
      habits,
      schedule,
      completed: totalCompleted,
      total: totalItems,
      percentage,
    };
  },

  /**
   * Exporta todos los datos
   */
  exportData() {
    return {
      version: APP_CONFIG.version,
      exportedAt: new Date().toISOString(),
      user: auth.getCurrentUser(),
      data: storage.exportData(),
    };
  },

  /**
   * Importa datos
   */
  importData(data) {
    if (!data || !data.data) {
      throw new Error('Formato de datos inválido');
    }
    storage.importData(data.data);
  },
};

// Log de inicialización
console.log(`[${APP_CONFIG.name}] Legacy bridge cargado v${APP_CONFIG.version}`);

export default window.GestionApp;
