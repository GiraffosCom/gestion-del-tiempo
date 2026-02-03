/**
 * Módulo de gestión de agenda/horarios
 * @module modules/schedule
 */

import { storage } from '../services/storage.js';
import { STORAGE_KEYS, CATEGORIES } from '../config.js';
import { getDateKey, parseTimeToMinutes } from '../utils/date.js';
import { generateId } from '../utils/helpers.js';
import { sanitizeHTML, isValidTime } from '../utils/validation.js';

class ScheduleManager {
  constructor() {
    this.onUpdate = null;
  }

  /**
   * Establece callback para cuando se actualiza la agenda
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
   * Obtiene las categorías disponibles
   * @param {string} lang
   * @returns {Array}
   */
  getCategories(lang = 'es') {
    return CATEGORIES.schedule.map(cat => ({
      value: cat.value,
      label: lang === 'en' ? cat.labelEn : cat.label,
    }));
  }

  /**
   * Obtiene el horario predeterminado según el día
   * @param {number} dayIndex - Índice del día (0-6, 0=Domingo)
   * @param {string} gender
   * @returns {Array}
   */
  getDefaultSchedule(dayIndex, _gender = 'female') {
    // Horario entre semana (Lunes-Viernes)
    if (dayIndex >= 1 && dayIndex <= 5) {
      return [
        { id: generateId(), time: '06:00', activity: 'Despertar + Skincare', duration: '30 min', category: 'routine', completed: false },
        { id: generateId(), time: '06:30', activity: 'Meditación + Journaling', duration: '30 min', category: 'personal', completed: false },
        { id: generateId(), time: '07:00', activity: 'Desayuno', duration: '30 min', category: 'routine', completed: false },
        { id: generateId(), time: '07:30', activity: 'Gimnasio', duration: '1.5 hr', category: 'exercise', completed: false },
        { id: generateId(), time: '09:00', activity: 'Trabajo/Estudio', duration: '3 hr', category: 'work', completed: false },
        { id: generateId(), time: '12:00', activity: 'Almuerzo', duration: '1 hr', category: 'routine', completed: false },
        { id: generateId(), time: '13:00', activity: 'Trabajo/Estudio', duration: '4 hr', category: 'work', completed: false },
        { id: generateId(), time: '17:00', activity: 'Tiempo personal', duration: '1 hr', category: 'personal', completed: false },
        { id: generateId(), time: '18:00', activity: 'Cena', duration: '1 hr', category: 'routine', completed: false },
        { id: generateId(), time: '19:00', activity: 'Lectura/Aprendizaje', duration: '1 hr', category: 'study', completed: false },
        { id: generateId(), time: '20:00', activity: 'Tiempo libre', duration: '1.5 hr', category: 'personal', completed: false },
        { id: generateId(), time: '21:30', activity: 'Rutina nocturna', duration: '30 min', category: 'routine', completed: false },
        { id: generateId(), time: '22:00', activity: 'Dormir', duration: '8 hr', category: 'rest', completed: false },
      ];
    }

    // Horario de fin de semana
    if (dayIndex === 6) { // Sábado
      return [
        { id: generateId(), time: '07:00', activity: 'Despertar', duration: '30 min', category: 'routine', completed: false },
        { id: generateId(), time: '07:30', activity: 'Desayuno tranquilo', duration: '1 hr', category: 'routine', completed: false },
        { id: generateId(), time: '08:30', activity: 'Gimnasio', duration: '1.5 hr', category: 'exercise', completed: false },
        { id: generateId(), time: '10:00', activity: 'Actividades personales', duration: '2 hr', category: 'personal', completed: false },
        { id: generateId(), time: '12:00', activity: 'Almuerzo', duration: '1 hr', category: 'routine', completed: false },
        { id: generateId(), time: '13:00', activity: 'Tiempo libre', duration: '4 hr', category: 'personal', completed: false },
        { id: generateId(), time: '17:00', activity: 'Socializar', duration: '3 hr', category: 'social', completed: false },
        { id: generateId(), time: '20:00', activity: 'Cena', duration: '1 hr', category: 'routine', completed: false },
        { id: generateId(), time: '21:00', activity: 'Entretenimiento', duration: '2 hr', category: 'personal', completed: false },
        { id: generateId(), time: '23:00', activity: 'Dormir', duration: '8 hr', category: 'rest', completed: false },
      ];
    }

    // Domingo
    return [
      { id: generateId(), time: '08:00', activity: 'Despertar', duration: '30 min', category: 'routine', completed: false },
      { id: generateId(), time: '08:30', activity: 'Desayuno', duration: '1 hr', category: 'routine', completed: false },
      { id: generateId(), time: '09:30', activity: 'Meditación/Reflexión', duration: '30 min', category: 'personal', completed: false },
      { id: generateId(), time: '10:00', activity: 'Planificación semanal', duration: '1 hr', category: 'work', completed: false },
      { id: generateId(), time: '11:00', activity: 'Ejercicio suave', duration: '1 hr', category: 'exercise', completed: false },
      { id: generateId(), time: '12:00', activity: 'Almuerzo familiar', duration: '2 hr', category: 'social', completed: false },
      { id: generateId(), time: '14:00', activity: 'Descanso', duration: '2 hr', category: 'rest', completed: false },
      { id: generateId(), time: '16:00', activity: 'Preparar semana', duration: '2 hr', category: 'personal', completed: false },
      { id: generateId(), time: '18:00', activity: 'Cena', duration: '1 hr', category: 'routine', completed: false },
      { id: generateId(), time: '19:00', activity: 'Entretenimiento', duration: '2 hr', category: 'personal', completed: false },
      { id: generateId(), time: '21:00', activity: 'Rutina nocturna', duration: '1 hr', category: 'routine', completed: false },
      { id: generateId(), time: '22:00', activity: 'Dormir temprano', duration: '8 hr', category: 'rest', completed: false },
    ];
  }

  /**
   * Obtiene el horario para una fecha específica
   * @param {Date} date
   * @returns {Array}
   */
  getSchedule(date = new Date()) {
    const dateKey = getDateKey(date);
    const scheduleKey = `${STORAGE_KEYS.schedule}-${dateKey}`;

    let schedule = storage.get(scheduleKey);

    if (!schedule) {
      // Verificar si hay un horario personalizado para este día de la semana
      const dayIndex = date.getDay();
      const customDaySchedule = storage.get(`${STORAGE_KEYS.schedule}-day-${dayIndex}`);

      if (customDaySchedule && customDaySchedule.length > 0) {
        schedule = customDaySchedule.map(item => ({
          ...item,
          id: generateId(),
          completed: false,
        }));
      } else {
        schedule = this.getDefaultSchedule(dayIndex);
      }
      this.saveSchedule(schedule, date);
    }

    // Ordenar por hora
    return this.sortByTime(schedule);
  }

  /**
   * Guarda el horario para una fecha
   * @param {Array} schedule
   * @param {Date} date
   */
  saveSchedule(schedule, date = new Date()) {
    const dateKey = getDateKey(date);
    const scheduleKey = `${STORAGE_KEYS.schedule}-${dateKey}`;
    storage.set(scheduleKey, schedule);
    this.notifyUpdate();
  }

  /**
   * Ordena actividades por hora
   * @param {Array} schedule
   * @returns {Array}
   */
  sortByTime(schedule) {
    return [...schedule].sort((a, b) => {
      const timeA = parseTimeToMinutes(a.time);
      const timeB = parseTimeToMinutes(b.time);
      return timeA - timeB;
    });
  }

  /**
   * Alterna el estado de una actividad
   * @param {string} activityId
   * @param {Date} date
   * @returns {Object}
   */
  toggleActivity(activityId, date = new Date()) {
    const schedule = this.getSchedule(date);
    const activityIndex = schedule.findIndex(a => a.id === activityId);

    if (activityIndex === -1) {
      console.error('Activity not found:', activityId);
      return null;
    }

    schedule[activityIndex].completed = !schedule[activityIndex].completed;
    this.saveSchedule(schedule, date);

    return schedule[activityIndex];
  }

  /**
   * Agrega una nueva actividad
   * @param {Object} activityData
   * @param {Date} date
   * @returns {Object}
   */
  addActivity({ time, activity, duration, category }, date = new Date()) {
    if (!isValidTime(time)) {
      throw new Error('Formato de hora inválido. Use HH:MM');
    }

    const schedule = this.getSchedule(date);

    const newActivity = {
      id: generateId(),
      time: sanitizeHTML(time),
      activity: sanitizeHTML(activity),
      duration: sanitizeHTML(duration) || '1 hr',
      category: category || 'personal',
      completed: false,
    };

    schedule.push(newActivity);
    this.saveSchedule(this.sortByTime(schedule), date);

    return newActivity;
  }

  /**
   * Agrega actividad a un rango de fechas
   * @param {Object} activityData
   * @param {Date} startDate
   * @param {Date} endDate
   */
  addActivityToRange(activityData, startDate, endDate) {
    const current = new Date(startDate);
    while (current <= endDate) {
      this.addActivity(activityData, new Date(current));
      current.setDate(current.getDate() + 1);
    }
  }

  /**
   * Edita una actividad existente
   * @param {string} activityId
   * @param {Object} updates
   * @param {Date} date
   * @returns {Object}
   */
  editActivity(activityId, updates, date = new Date()) {
    const schedule = this.getSchedule(date);
    const activityIndex = schedule.findIndex(a => a.id === activityId);

    if (activityIndex === -1) {
      console.error('Activity not found:', activityId);
      return null;
    }

    if (updates.time && !isValidTime(updates.time)) {
      throw new Error('Formato de hora inválido. Use HH:MM');
    }

    schedule[activityIndex] = {
      ...schedule[activityIndex],
      time: updates.time !== undefined ? sanitizeHTML(updates.time) : schedule[activityIndex].time,
      activity: updates.activity !== undefined ? sanitizeHTML(updates.activity) : schedule[activityIndex].activity,
      duration: updates.duration !== undefined ? sanitizeHTML(updates.duration) : schedule[activityIndex].duration,
      category: updates.category !== undefined ? updates.category : schedule[activityIndex].category,
    };

    this.saveSchedule(this.sortByTime(schedule), date);

    return schedule[activityIndex];
  }

  /**
   * Elimina una actividad
   * @param {string} activityId
   * @param {Date} date
   */
  deleteActivity(activityId, date = new Date()) {
    const schedule = this.getSchedule(date);
    const filteredSchedule = schedule.filter(a => a.id !== activityId);
    this.saveSchedule(filteredSchedule, date);
  }

  /**
   * Mueve una actividad en el orden
   * @param {string} activityId
   * @param {string} direction - 'up' o 'down'
   * @param {Date} date
   */
  moveActivity(activityId, direction, date = new Date()) {
    const schedule = this.getSchedule(date);
    const currentIndex = schedule.findIndex(a => a.id === activityId);

    if (currentIndex === -1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

    if (newIndex < 0 || newIndex >= schedule.length) return;

    // Intercambiar posiciones
    [schedule[currentIndex], schedule[newIndex]] = [schedule[newIndex], schedule[currentIndex]];

    // Intercambiar horas también
    const tempTime = schedule[currentIndex].time;
    schedule[currentIndex].time = schedule[newIndex].time;
    schedule[newIndex].time = tempTime;

    this.saveSchedule(schedule, date);
  }

  /**
   * Obtiene el progreso de la agenda para una fecha
   * @param {Date} date
   * @returns {{completed: number, total: number, percentage: number}}
   */
  getProgress(date = new Date()) {
    const schedule = this.getSchedule(date);
    const completed = schedule.filter(a => a.completed).length;
    const total = schedule.length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { completed, total, percentage };
  }

  /**
   * Obtiene la actividad actual o próxima
   * @param {Date} date
   * @returns {Object|null}
   */
  getCurrentActivity(date = new Date()) {
    const schedule = this.getSchedule(date);
    const now = date.getHours() * 60 + date.getMinutes();

    // Buscar actividad actual
    for (const activity of schedule) {
      const activityTime = parseTimeToMinutes(activity.time);
      const durationMinutes = this.parseDurationToMinutes(activity.duration);
      const endTime = activityTime + durationMinutes;

      if (now >= activityTime && now < endTime) {
        return activity;
      }
    }

    // Si no hay actividad actual, devolver la próxima
    for (const activity of schedule) {
      const activityTime = parseTimeToMinutes(activity.time);
      if (activityTime > now) {
        return activity;
      }
    }

    return null;
  }

  /**
   * Parsea duración a minutos
   * @param {string} duration - ej: "1.5 hr", "30 min"
   * @returns {number}
   */
  parseDurationToMinutes(duration) {
    if (!duration) return 60;
    const match = duration.match(/(\d+\.?\d*)\s*(hr|hour|h|min|m)?/i);
    if (!match) return 60;

    const value = parseFloat(match[1]);
    const unit = (match[2] || 'hr').toLowerCase();

    if (unit.startsWith('h')) return value * 60;
    return value;
  }

  /**
   * Limpia la agenda de una fecha específica
   * @param {Date} date
   */
  clearSchedule(date = new Date()) {
    const dateKey = getDateKey(date);
    const scheduleKey = `${STORAGE_KEYS.schedule}-${dateKey}`;
    storage.remove(scheduleKey);
    this.notifyUpdate();
  }

  /**
   * Resetea toda la agenda
   */
  resetAll() {
    const allKeys = storage.getAllKeys();
    allKeys.forEach(key => {
      if (key.startsWith(STORAGE_KEYS.schedule)) {
        storage.remove(key);
      }
    });
    this.notifyUpdate();
  }
}

// Exportar instancia singleton
export const scheduleManager = new ScheduleManager();
export default scheduleManager;
