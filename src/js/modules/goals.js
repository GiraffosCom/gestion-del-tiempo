/**
 * Módulo de gestión de metas semanales
 * @module modules/goals
 */

import { storage } from '../services/storage.js';
import { STORAGE_KEYS } from '../config.js';
import { getWeekNumber, formatDateShort } from '../utils/date.js';
import { generateId } from '../utils/helpers.js';
import { sanitizeHTML } from '../utils/validation.js';

class GoalsManager {
  constructor() {
    this.onUpdate = null;
  }

  /**
   * Establece callback para cuando se actualizan las metas
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
   * Obtiene las metas predeterminadas
   * @returns {Array}
   */
  getDefaultGoals() {
    const today = new Date();
    const goals = [];

    for (let week = 1; week <= 8; week++) {
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() + (week - 1) * 7 - today.getDay() + 1);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);

      goals.push({
        id: generateId(),
        week,
        dates: `${formatDateShort(weekStart)} - ${formatDateShort(weekEnd)}`,
        startDate: weekStart.toISOString().split('T')[0],
        endDate: weekEnd.toISOString().split('T')[0],
        fisica: 'Completar rutina de ejercicios',
        personal: 'Leer 30 minutos diarios',
        digital: 'Avanzar en proyecto personal',
        espiritual: 'Meditar 10 minutos diarios',
        completedAreas: [],
      });
    }

    return goals;
  }

  /**
   * Obtiene todas las metas del usuario
   * @returns {Array}
   */
  getGoals() {
    let goals = storage.get(STORAGE_KEYS.goals);

    if (!goals || goals.length === 0) {
      goals = this.getDefaultGoals();
      this.saveGoals(goals);
    }

    // Asegurar que cada meta tenga ID
    goals = goals.map((goal, index) => ({
      ...goal,
      id: goal.id || `goal-${index}-${Date.now()}`,
      completedAreas: goal.completedAreas || [],
    }));

    return goals;
  }

  /**
   * Guarda las metas
   * @param {Array} goals
   */
  saveGoals(goals) {
    storage.set(STORAGE_KEYS.goals, goals);
    this.notifyUpdate();
  }

  /**
   * Obtiene la meta de la semana actual
   * @param {Date} date
   * @returns {Object|null}
   */
  getCurrentWeekGoal(date = new Date()) {
    const goals = this.getGoals();
    const weekNumber = getWeekNumber(date);

    // Buscar por número de semana o por fechas
    const goal = goals.find(g => {
      if (g.week === weekNumber) return true;
      if (g.startDate && g.endDate) {
        const start = new Date(g.startDate);
        const end = new Date(g.endDate);
        return date >= start && date <= end;
      }
      return false;
    });

    return goal || goals[0] || null;
  }

  /**
   * Obtiene una meta por ID
   * @param {string} goalId
   * @returns {Object|null}
   */
  getGoalById(goalId) {
    const goals = this.getGoals();
    return goals.find(g => g.id === goalId) || null;
  }

  /**
   * Agrega una nueva meta
   * @param {Object} goalData
   * @returns {Object}
   */
  addGoal({ week, dates, fisica, personal, digital, espiritual }) {
    const goals = this.getGoals();

    const newGoal = {
      id: generateId(),
      week: parseInt(week) || goals.length + 1,
      dates: sanitizeHTML(dates) || '',
      fisica: sanitizeHTML(fisica) || '',
      personal: sanitizeHTML(personal) || '',
      digital: sanitizeHTML(digital) || '',
      espiritual: sanitizeHTML(espiritual) || '',
      completedAreas: [],
    };

    goals.push(newGoal);

    // Ordenar por semana
    goals.sort((a, b) => a.week - b.week);

    this.saveGoals(goals);

    return newGoal;
  }

  /**
   * Edita una meta existente
   * @param {string} goalId
   * @param {Object} updates
   * @returns {Object}
   */
  editGoal(goalId, updates) {
    const goals = this.getGoals();
    const goalIndex = goals.findIndex(g => g.id === goalId);

    if (goalIndex === -1) {
      console.error('Goal not found:', goalId);
      return null;
    }

    goals[goalIndex] = {
      ...goals[goalIndex],
      week: updates.week !== undefined ? parseInt(updates.week) : goals[goalIndex].week,
      dates: updates.dates !== undefined ? sanitizeHTML(updates.dates) : goals[goalIndex].dates,
      fisica: updates.fisica !== undefined ? sanitizeHTML(updates.fisica) : goals[goalIndex].fisica,
      personal: updates.personal !== undefined ? sanitizeHTML(updates.personal) : goals[goalIndex].personal,
      digital: updates.digital !== undefined ? sanitizeHTML(updates.digital) : goals[goalIndex].digital,
      espiritual: updates.espiritual !== undefined ? sanitizeHTML(updates.espiritual) : goals[goalIndex].espiritual,
    };

    // Reordenar si cambió la semana
    if (updates.week !== undefined) {
      goals.sort((a, b) => a.week - b.week);
    }

    this.saveGoals(goals);

    return goals.find(g => g.id === goalId);
  }

  /**
   * Elimina una meta
   * @param {string} goalId
   */
  deleteGoal(goalId) {
    const goals = this.getGoals();
    const filteredGoals = goals.filter(g => g.id !== goalId);
    this.saveGoals(filteredGoals);
  }

  /**
   * Marca un área como completada para una meta
   * @param {string} goalId
   * @param {string} area - 'fisica', 'personal', 'digital', 'espiritual'
   * @returns {Object}
   */
  toggleAreaComplete(goalId, area) {
    const goals = this.getGoals();
    const goalIndex = goals.findIndex(g => g.id === goalId);

    if (goalIndex === -1) {
      console.error('Goal not found:', goalId);
      return null;
    }

    const completedAreas = goals[goalIndex].completedAreas || [];
    const areaIndex = completedAreas.indexOf(area);

    if (areaIndex === -1) {
      completedAreas.push(area);
    } else {
      completedAreas.splice(areaIndex, 1);
    }

    goals[goalIndex].completedAreas = completedAreas;
    this.saveGoals(goals);

    return goals[goalIndex];
  }

  /**
   * Verifica si un área está completada
   * @param {string} goalId
   * @param {string} area
   * @returns {boolean}
   */
  isAreaComplete(goalId, area) {
    const goal = this.getGoalById(goalId);
    if (!goal) return false;
    return (goal.completedAreas || []).includes(area);
  }

  /**
   * Obtiene el progreso de una meta
   * @param {string} goalId
   * @returns {{completed: number, total: number, percentage: number}}
   */
  getGoalProgress(goalId) {
    const goal = this.getGoalById(goalId);
    if (!goal) return { completed: 0, total: 4, percentage: 0 };

    const completed = (goal.completedAreas || []).length;
    const total = 4; // física, personal, digital, espiritual
    const percentage = Math.round((completed / total) * 100);

    return { completed, total, percentage };
  }

  /**
   * Obtiene el texto descriptivo de un tipo de objetivo
   * @param {string} goalType
   * @param {string} lang
   * @returns {string}
   */
  getGoalTypeLabel(goalType, lang = 'es') {
    const labels = {
      es: {
        fitness: 'Mejorar mi condición física',
        productivity: 'Ser más productivo',
        learning: 'Aprender algo nuevo',
        health: 'Mejorar mi salud',
        business: 'Hacer crecer mi negocio',
        competition: 'Prepararme para una competencia',
        personal: 'Desarrollo personal',
      },
      en: {
        fitness: 'Improve my fitness',
        productivity: 'Be more productive',
        learning: 'Learn something new',
        health: 'Improve my health',
        business: 'Grow my business',
        competition: 'Prepare for a competition',
        personal: 'Personal development',
      },
    };

    return labels[lang]?.[goalType] || labels.es[goalType] || goalType;
  }

  /**
   * Resetea todas las metas
   */
  resetAll() {
    storage.remove(STORAGE_KEYS.goals);
    this.notifyUpdate();
  }
}

// Exportar instancia singleton
export const goalsManager = new GoalsManager();
export default goalsManager;
