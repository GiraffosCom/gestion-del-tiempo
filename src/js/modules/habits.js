/**
 * Módulo de gestión de hábitos
 * @module modules/habits
 */

import { storage } from '../services/storage.js';
import { STORAGE_KEYS } from '../config.js';
import { getDateKey } from '../utils/date.js';
import { generateId } from '../utils/helpers.js';
import { sanitizeHTML } from '../utils/validation.js';

class HabitsManager {
  constructor() {
    this.defaultHabits = [];
    this.onUpdate = null;
  }

  /**
   * Establece callback para cuando se actualizan los hábitos
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
   * Obtiene los hábitos predeterminados según género
   * @param {string} gender
   * @returns {Array}
   */
  getDefaultHabits(gender = 'female') {
    const baseHabits = [
      { id: generateId(), icon: '☀️', name: 'Despertar temprano', completed: false },
      { id: generateId(), icon: '🧘', name: 'Meditar 10 min', completed: false },
      { id: generateId(), icon: '💧', name: 'Beber 2L de agua', completed: false },
      { id: generateId(), icon: '📚', name: 'Leer 20 páginas', completed: false },
      { id: generateId(), icon: '🏃', name: 'Ejercicio', completed: false },
      { id: generateId(), icon: '🥗', name: 'Comer saludable', completed: false },
      { id: generateId(), icon: '📝', name: 'Journaling', completed: false },
      { id: generateId(), icon: '😴', name: 'Dormir 8 horas', completed: false },
    ];

    if (gender === 'male') {
      return [
        ...baseHabits,
        { id: generateId(), icon: '💪', name: 'Gimnasio', completed: false },
        { id: generateId(), icon: '🎯', name: 'Revisar metas', completed: false },
      ];
    }

    return [
      ...baseHabits,
      { id: generateId(), icon: '✨', name: 'Skincare', completed: false },
      { id: generateId(), icon: '🎯', name: 'Afirmaciones', completed: false },
    ];
  }

  /**
   * Obtiene los hábitos del usuario para una fecha
   * @param {Date} date - Fecha (opcional, por defecto hoy)
   * @returns {Array}
   */
  getHabits(date = new Date()) {
    const dateKey = getDateKey(date);
    const habitsKey = `${STORAGE_KEYS.habits}-${dateKey}`;

    let habits = storage.get(habitsKey);

    if (!habits || habits.length === 0) {
      // Cargar hábitos base del usuario
      const baseHabits = storage.get(STORAGE_KEYS.habits);
      if (baseHabits && baseHabits.length > 0) {
        habits = baseHabits.map(h => ({ ...h, completed: false }));
      } else {
        habits = this.getDefaultHabits();
      }
      this.saveHabits(habits, date);
    }

    // Asegurar que cada hábito tenga ID
    habits = habits.map((habit, index) => ({
      ...habit,
      id: habit.id || `habit-${index}-${Date.now()}`,
    }));

    return habits;
  }

  /**
   * Guarda los hábitos para una fecha
   * @param {Array} habits - Lista de hábitos
   * @param {Date} date - Fecha
   */
  saveHabits(habits, date = new Date()) {
    const dateKey = getDateKey(date);
    const habitsKey = `${STORAGE_KEYS.habits}-${dateKey}`;
    storage.set(habitsKey, habits);
    this.notifyUpdate();
  }

  /**
   * Guarda los hábitos base (plantilla)
   * @param {Array} habits
   */
  saveBaseHabits(habits) {
    storage.set(STORAGE_KEYS.habits, habits);
  }

  /**
   * Alterna el estado de un hábito
   * @param {string} habitId - ID del hábito
   * @param {Date} date - Fecha
   * @returns {Object} Hábito actualizado
   */
  toggleHabit(habitId, date = new Date()) {
    const habits = this.getHabits(date);
    const habitIndex = habits.findIndex(h => h.id === habitId);

    if (habitIndex === -1) {
      console.error('Habit not found:', habitId);
      return null;
    }

    habits[habitIndex].completed = !habits[habitIndex].completed;
    this.saveHabits(habits, date);

    return habits[habitIndex];
  }

  /**
   * Agrega un nuevo hábito
   * @param {Object} habitData - Datos del hábito
   * @param {Date} date - Fecha
   * @returns {Object} Nuevo hábito
   */
  addHabit({ icon, name }, date = new Date()) {
    const habits = this.getHabits(date);

    const newHabit = {
      id: generateId(),
      icon: sanitizeHTML(icon) || '✨',
      name: sanitizeHTML(name),
      completed: false,
    };

    habits.push(newHabit);
    this.saveHabits(habits, date);

    // También agregar a los hábitos base
    const baseHabits = storage.get(STORAGE_KEYS.habits, []);
    baseHabits.push({ ...newHabit, completed: false });
    this.saveBaseHabits(baseHabits);

    return newHabit;
  }

  /**
   * Edita un hábito existente
   * @param {string} habitId - ID del hábito
   * @param {Object} updates - Campos a actualizar
   * @param {Date} date - Fecha
   * @param {boolean} updateAll - Si actualizar en todos los días
   * @returns {Object} Hábito actualizado
   */
  editHabit(habitId, { icon, name }, date = new Date(), _updateAll = false) {
    const habits = this.getHabits(date);
    const habitIndex = habits.findIndex(h => h.id === habitId);

    if (habitIndex === -1) {
      console.error('Habit not found:', habitId);
      return null;
    }

    const originalName = habits[habitIndex].name;

    habits[habitIndex] = {
      ...habits[habitIndex],
      icon: icon !== undefined ? sanitizeHTML(icon) : habits[habitIndex].icon,
      name: name !== undefined ? sanitizeHTML(name) : habits[habitIndex].name,
    };

    this.saveHabits(habits, date);

    // Actualizar en hábitos base
    const baseHabits = storage.get(STORAGE_KEYS.habits, []);
    const baseIndex = baseHabits.findIndex(h => h.name === originalName);
    if (baseIndex !== -1) {
      baseHabits[baseIndex] = { ...baseHabits[baseIndex], ...habits[habitIndex] };
      this.saveBaseHabits(baseHabits);
    }

    return habits[habitIndex];
  }

  /**
   * Elimina un hábito
   * @param {string} habitId - ID del hábito
   * @param {Date} date - Fecha
   * @param {boolean} deleteFromAll - Si eliminar de todos los días
   */
  deleteHabit(habitId, date = new Date(), _deleteFromAll = false) {
    const habits = this.getHabits(date);
    const habitToDelete = habits.find(h => h.id === habitId);

    if (!habitToDelete) {
      console.error('Habit not found:', habitId);
      return;
    }

    const filteredHabits = habits.filter(h => h.id !== habitId);
    this.saveHabits(filteredHabits, date);

    // Eliminar de hábitos base
    const baseHabits = storage.get(STORAGE_KEYS.habits, []);
    const filteredBase = baseHabits.filter(h => h.name !== habitToDelete.name);
    this.saveBaseHabits(filteredBase);
  }

  /**
   * Obtiene el progreso de hábitos para una fecha
   * @param {Date} date
   * @returns {{completed: number, total: number, percentage: number}}
   */
  getProgress(date = new Date()) {
    const habits = this.getHabits(date);
    const completed = habits.filter(h => h.completed).length;
    const total = habits.length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { completed, total, percentage };
  }

  /**
   * Obtiene la racha actual de días completando todos los hábitos
   * @returns {number}
   */
  getStreak() {
    let streak = 0;
    const today = new Date();
    const checkDate = new Date(today);

    // Si hoy no está completo, empezar desde ayer
    const todayProgress = this.getProgress(today);
    if (todayProgress.percentage < 100) {
      checkDate.setDate(checkDate.getDate() - 1);
    }

    // Contar días consecutivos (máximo 365 días)
    const maxDays = 365;
    for (let i = 0; i < maxDays; i++) {
      const progress = this.getProgress(checkDate);
      if (progress.percentage === 100 && progress.total > 0) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    return streak;
  }

  /**
   * Obtiene la mejor racha histórica
   * @returns {number}
   */
  getBestStreak() {
    const savedBest = storage.get('best-streak', 0);
    const currentStreak = this.getStreak();
    const bestStreak = Math.max(savedBest, currentStreak);

    if (bestStreak > savedBest) {
      storage.set('best-streak', bestStreak);
    }

    return bestStreak;
  }

  /**
   * Resetea todos los hábitos
   */
  resetAll() {
    storage.remove(STORAGE_KEYS.habits);
    // También limpiar hábitos de fechas específicas
    const allKeys = storage.getAllKeys();
    allKeys.forEach(key => {
      if (key.startsWith(STORAGE_KEYS.habits)) {
        storage.remove(key);
      }
    });
    this.notifyUpdate();
  }
}

// Exportar instancia singleton
export const habitsManager = new HabitsManager();
export default habitsManager;
