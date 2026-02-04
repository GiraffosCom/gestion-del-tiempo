/**
 * Módulo de gestión de Gym/Entrenamiento
 * @module modules/gym
 */

import { storage } from '../services/storage.js';
import { STORAGE_KEYS } from '../config.js';
import { generateId } from '../utils/helpers.js';

/**
 * Default gym focus by day of week
 */
const DEFAULT_GYM_FOCUS = {
    0: { name: "Descanso Activo", icon: "🧘", exercises: ["Yoga suave 30-45min", "Estiramientos profundos 20min", "Caminata ligera opcional", "Meditación con movimiento 15min"] },
    1: { name: "Glúteos + Cuádriceps", icon: "🍑", exercises: ["Hip Thrust con barra 4x12", "Sentadilla profunda 4x10", "Prensa inclinada 4x12", "Zancadas caminando 3x12", "Extensión cuádriceps 3x15", "Abductores máquina 3x20"] },
    2: { name: "Isquios + Glúteos", icon: "🦵", exercises: ["Peso muerto rumano 4x10", "Curl femoral acostada 4x12", "Patada glúteo polea 3x15", "Puente glúteos elevado 4x15", "Good mornings 3x12", "Hip abduction 3x20"] },
    3: { name: "Tren Superior + Core", icon: "💪", exercises: ["Press pecho mancuernas 3x12", "Remo mancuerna 3x12", "Press hombro 3x12", "Curl bíceps 3x15", "Tríceps polea 3x15", "Plancha 3x30seg + Crunches 3x20"] },
    4: { name: "Piernas + HIIT", icon: "🔥", exercises: ["Sentadilla búlgara 4x10", "Leg press pies juntos 4x12", "Step ups con peso 3x12", "Curl femoral sentada 3x15", "HIIT: Burpees, Jumping jacks 4 rondas"] },
    5: { name: "Glúteos (énfasis) + Brazos", icon: "✨", exercises: ["Hip thrust unilateral 4x12", "Sumo squat mancuerna 4x15", "Kickbacks polea 3x15", "Frog pumps 3x25", "Curl martillo 3x12", "Fondos tríceps 3x12"] },
    6: { name: "Baile + Stretching", icon: "💃", exercises: ["Clase baile/gimnasia 60-90min", "Estiramiento dinámico 15min", "Foam roller piernas 15min", "Yoga flow 20min"] }
};

class GymManager {
    constructor() {
        this.onUpdate = null;
        this.currentSubTab = 'workout';
        this.viewMode = 'today'; // 'today' | 'week'
    }

    /**
     * Set callback for updates
     * @param {Function} callback
     */
    setOnUpdate(callback) {
        this.onUpdate = callback;
    }

    /**
     * Notify changes
     */
    notifyUpdate() {
        if (typeof this.onUpdate === 'function') {
            this.onUpdate();
        }
    }

    /**
     * Get custom gym data
     * @returns {Object}
     */
    getCustomGym() {
        return storage.get(STORAGE_KEYS.gym, {});
    }

    /**
     * Save custom gym data
     * @param {Object} data
     */
    saveCustomGym(data) {
        storage.set(STORAGE_KEYS.gym, data);
        this.notifyUpdate();
    }

    /**
     * Get gym focus for a specific day
     * @param {number} dayIndex - Day of week (0-6)
     * @returns {Object}
     */
    getGymFocus(dayIndex) {
        const customGym = this.getCustomGym();

        // Check if gym has been cleared by reset
        if (customGym.__cleared__) {
            return customGym[dayIndex] || { name: "", icon: "💪", exercises: [] };
        }

        if (customGym[dayIndex]) {
            return customGym[dayIndex];
        }

        return DEFAULT_GYM_FOCUS[dayIndex];
    }

    /**
     * Set gym focus for a specific day
     * @param {number} dayIndex
     * @param {Object} focus
     */
    setGymFocus(dayIndex, focus) {
        const customGym = this.getCustomGym();
        customGym[dayIndex] = focus;
        this.saveCustomGym(customGym);
    }

    /**
     * Add exercise to a day
     * @param {number} dayIndex
     * @param {string} exercise
     */
    addExercise(dayIndex, exercise) {
        const focus = this.getGymFocus(dayIndex);
        if (!focus.exercises) {
            focus.exercises = [];
        }
        focus.exercises.push(exercise);
        this.setGymFocus(dayIndex, focus);
    }

    /**
     * Remove exercise from a day
     * @param {number} dayIndex
     * @param {number} exerciseIndex
     */
    removeExercise(dayIndex, exerciseIndex) {
        const focus = this.getGymFocus(dayIndex);
        if (focus.exercises && focus.exercises[exerciseIndex] !== undefined) {
            focus.exercises.splice(exerciseIndex, 1);
            this.setGymFocus(dayIndex, focus);
        }
    }

    /**
     * Update exercise in a day
     * @param {number} dayIndex
     * @param {number} exerciseIndex
     * @param {string} newExercise
     */
    updateExercise(dayIndex, exerciseIndex, newExercise) {
        const focus = this.getGymFocus(dayIndex);
        if (focus.exercises && focus.exercises[exerciseIndex] !== undefined) {
            focus.exercises[exerciseIndex] = newExercise;
            this.setGymFocus(dayIndex, focus);
        }
    }

    /**
     * Reset gym to defaults
     */
    resetToDefaults() {
        storage.remove(STORAGE_KEYS.gym);
        this.notifyUpdate();
    }

    /**
     * Clear all gym data
     */
    clearAll() {
        this.saveCustomGym({ __cleared__: true });
    }

    /**
     * Delete exercise from all days
     * @param {string} exerciseName
     * @param {number} excludeDayIndex - Day to exclude
     */
    deleteFromAllDays(exerciseName, excludeDayIndex = -1) {
        const customGym = this.getCustomGym();

        for (let i = 0; i <= 6; i++) {
            if (i === excludeDayIndex) continue;

            const dayData = customGym[i] || DEFAULT_GYM_FOCUS[i];
            if (dayData && dayData.exercises) {
                const filteredExercises = dayData.exercises.filter(ex =>
                    !ex.toLowerCase().includes(exerciseName.toLowerCase())
                );
                if (filteredExercises.length !== dayData.exercises.length) {
                    customGym[i] = { ...dayData, exercises: filteredExercises };
                }
            }
        }

        this.saveCustomGym(customGym);
    }

    // ==================== Profile ====================

    /**
     * Get gym profile (weight, measurements, etc.)
     * @returns {Object}
     */
    getProfile() {
        return storage.get('gym-profile', {
            currentWeight: null,
            targetWeight: null,
            height: null,
            measurements: {}
        });
    }

    /**
     * Save gym profile
     * @param {Object} profile
     */
    saveProfile(profile) {
        storage.set('gym-profile', profile);
        this.notifyUpdate();
    }

    /**
     * Update weight
     * @param {number} weight
     */
    updateWeight(weight) {
        const profile = this.getProfile();
        profile.currentWeight = weight;
        this.saveProfile(profile);

        // Add to weight history
        this.addWeightEntry(weight);
    }

    // ==================== Weight History ====================

    /**
     * Get weight history
     * @returns {Array}
     */
    getWeightHistory() {
        return storage.get(STORAGE_KEYS.weights, []);
    }

    /**
     * Add weight entry
     * @param {number} weight
     * @param {Date} date
     */
    addWeightEntry(weight, date = new Date()) {
        const history = this.getWeightHistory();
        const dateKey = date.toISOString().split('T')[0];

        // Check if entry exists for today
        const existingIndex = history.findIndex(h => h.date === dateKey);
        if (existingIndex !== -1) {
            history[existingIndex].weight = weight;
        } else {
            history.push({
                id: generateId(),
                date: dateKey,
                weight: weight,
                createdAt: new Date().toISOString()
            });
        }

        // Sort by date descending
        history.sort((a, b) => new Date(b.date) - new Date(a.date));

        storage.set(STORAGE_KEYS.weights, history);
        this.notifyUpdate();
    }

    /**
     * Get latest weight
     * @returns {Object|null}
     */
    getLatestWeight() {
        const history = this.getWeightHistory();
        return history.length > 0 ? history[0] : null;
    }

    // ==================== Workout Logs ====================

    /**
     * Get workout logs
     * @param {string} dateKey - Optional date filter
     * @returns {Array}
     */
    getWorkoutLogs(dateKey = null) {
        const logs = storage.get('workout-logs', []);
        if (dateKey) {
            return logs.filter(l => l.date === dateKey);
        }
        return logs;
    }

    /**
     * Log a workout
     * @param {Object} workout
     */
    logWorkout(workout) {
        const logs = this.getWorkoutLogs();
        logs.unshift({
            id: generateId(),
            date: workout.date || new Date().toISOString().split('T')[0],
            exercises: workout.exercises || [],
            duration: workout.duration || 0,
            notes: workout.notes || '',
            createdAt: new Date().toISOString()
        });

        storage.set('workout-logs', logs);
        this.notifyUpdate();
    }

    /**
     * Get workout statistics
     * @returns {Object}
     */
    getStats() {
        const logs = this.getWorkoutLogs();
        const history = this.getWeightHistory();

        // Calculate streak
        let streak = 0;
        const today = new Date();
        const checkDate = new Date(today);

        for (let i = 0; i < 365; i++) {
            const dateKey = checkDate.toISOString().split('T')[0];
            const hasWorkout = logs.some(l => l.date === dateKey);
            if (hasWorkout) {
                streak++;
                checkDate.setDate(checkDate.getDate() - 1);
            } else if (i > 0) {
                break;
            } else {
                checkDate.setDate(checkDate.getDate() - 1);
            }
        }

        // Calculate total workouts this month
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const monthWorkouts = logs.filter(l => new Date(l.date) >= startOfMonth).length;

        // Weight change
        let weightChange = 0;
        if (history.length >= 2) {
            weightChange = history[0].weight - history[history.length - 1].weight;
        }

        return {
            streak,
            totalWorkouts: logs.length,
            monthWorkouts,
            weightChange: weightChange.toFixed(1),
            latestWeight: history[0]?.weight || null
        };
    }

    // ==================== Sub-tabs & View Mode ====================

    /**
     * Set current sub-tab
     * @param {string} tab
     */
    setSubTab(tab) {
        this.currentSubTab = tab;
        this.notifyUpdate();
    }

    /**
     * Get current sub-tab
     * @returns {string}
     */
    getSubTab() {
        return this.currentSubTab;
    }

    /**
     * Set view mode (today/week)
     * @param {string} mode
     */
    setViewMode(mode) {
        this.viewMode = mode;
        if (mode === 'today') {
            this.currentSubTab = 'workout';
        }
        this.notifyUpdate();
    }

    /**
     * Get view mode
     * @returns {string}
     */
    getViewMode() {
        return this.viewMode;
    }
}

// Export singleton instance
export const gymManager = new GymManager();
export default gymManager;
