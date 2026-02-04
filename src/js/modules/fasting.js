/**
 * Módulo de gestión de Ayuno Intermitente
 * @module modules/fasting
 */

import { storage } from '../services/storage.js';
import { generateId } from '../utils/helpers.js';

/**
 * Fasting protocol types
 */
export const FASTING_TYPES = {
    '12:12': { hours: 12, label: '12:12', description: 'Principiante' },
    '14:10': { hours: 14, label: '14:10', description: 'Intermedio' },
    '16:8':  { hours: 16, label: '16:8',  description: 'Popular' },
    '18:6':  { hours: 18, label: '18:6',  description: 'Avanzado' },
    '20:4':  { hours: 20, label: '20:4',  description: 'Guerrero' },
    '24:0':  { hours: 24, label: '24h',   description: 'OMAD' },
    'custom': { hours: null, label: 'Personalizado', description: 'Define tu tiempo' }
};

class FastingManager {
    constructor() {
        this.onUpdate = null;
        this.timerInterval = null;
        this.onTimerTick = null;
    }

    /**
     * Set callback for updates
     * @param {Function} callback
     */
    setOnUpdate(callback) {
        this.onUpdate = callback;
    }

    /**
     * Set callback for timer ticks
     * @param {Function} callback
     */
    setOnTimerTick(callback) {
        this.onTimerTick = callback;
    }

    /**
     * Notify changes
     */
    notifyUpdate() {
        if (typeof this.onUpdate === 'function') {
            this.onUpdate();
        }
    }

    // ==================== Data Management ====================

    /**
     * Get fasting data
     * @returns {Object}
     */
    getData() {
        return storage.get('fasting', {
            activeFast: null,
            history: [],
            settings: { defaultType: '16:8', reminderEnabled: false }
        });
    }

    /**
     * Save fasting data
     * @param {Object} data
     */
    saveData(data) {
        storage.set('fasting', data);
    }

    /**
     * Check if there's an active fast
     * @returns {boolean}
     */
    hasActiveFast() {
        const data = this.getData();
        return data.activeFast !== null;
    }

    /**
     * Get active fast
     * @returns {Object|null}
     */
    getActiveFast() {
        const data = this.getData();
        return data.activeFast;
    }

    // ==================== Timer Functions ====================

    /**
     * Calculate elapsed seconds
     * @returns {number}
     */
    calculateElapsed() {
        const data = this.getData();
        if (!data.activeFast) return 0;
        return Math.floor((Date.now() - new Date(data.activeFast.startedAt).getTime()) / 1000);
    }

    /**
     * Format time as HH:MM:SS
     * @param {number} totalSeconds
     * @returns {string}
     */
    formatTime(totalSeconds) {
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    /**
     * Get progress data
     * @returns {Object}
     */
    getProgress() {
        const data = this.getData();
        if (!data.activeFast) {
            return { elapsed: 0, target: 0, progress: 0, remaining: 0, formatted: '00:00:00' };
        }

        const elapsed = this.calculateElapsed();
        const targetSeconds = data.activeFast.targetHours * 3600;
        const progress = Math.min((elapsed / targetSeconds) * 100, 100);
        const remaining = Math.max(targetSeconds - elapsed, 0);

        return {
            elapsed,
            target: targetSeconds,
            progress,
            remaining,
            formatted: this.formatTime(elapsed),
            remainingFormatted: this.formatTime(remaining),
            remainingHours: (remaining / 3600).toFixed(1),
            goalReached: elapsed >= targetSeconds
        };
    }

    /**
     * Start timer interval
     */
    startTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }

        this.timerInterval = setInterval(() => {
            const progress = this.getProgress();

            // Check if goal just reached
            const data = this.getData();
            if (progress.goalReached && data.activeFast && !data.activeFast.goalReached) {
                data.activeFast.goalReached = true;
                this.saveData(data);
            }

            if (typeof this.onTimerTick === 'function') {
                this.onTimerTick(progress);
            }
        }, 1000);
    }

    /**
     * Stop timer interval
     */
    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    // ==================== Fast Actions ====================

    /**
     * Start a new fast
     * @param {string} type - Fasting type
     * @param {number} customHours - Custom hours for 'custom' type
     * @returns {Object} Result
     */
    startFast(type, customHours = null) {
        if (this.hasActiveFast()) {
            return { success: false, error: 'Ya tienes un ayuno activo' };
        }

        const targetHours = type === 'custom' ? customHours : FASTING_TYPES[type]?.hours;
        if (!targetHours || targetHours <= 0) {
            return { success: false, error: 'Duración inválida' };
        }

        const data = this.getData();
        data.activeFast = {
            id: generateId(),
            type: type,
            targetHours: targetHours,
            startedAt: new Date().toISOString(),
            notes: { energy: 3, hunger: 3, focus: 3 },
            goalReached: false
        };
        this.saveData(data);

        this.startTimer();
        this.notifyUpdate();

        return {
            success: true,
            message: `Ayuno ${FASTING_TYPES[type]?.label || targetHours + 'h'} iniciado`
        };
    }

    /**
     * End current fast
     * @returns {Object} Result with history entry
     */
    endFast() {
        const data = this.getData();
        if (!data.activeFast) {
            return { success: false, error: 'No hay ayuno activo' };
        }

        const elapsed = this.calculateElapsed();
        const actualHours = elapsed / 3600;
        const completed = actualHours >= data.activeFast.targetHours;

        // Create history entry
        const historyEntry = {
            id: data.activeFast.id,
            type: data.activeFast.type,
            targetHours: data.activeFast.targetHours,
            startedAt: data.activeFast.startedAt,
            endedAt: new Date().toISOString(),
            actualHours: parseFloat(actualHours.toFixed(2)),
            completed: completed,
            notes: data.activeFast.notes,
            feedback: ''
        };

        data.history.unshift(historyEntry);
        data.activeFast = null;
        this.saveData(data);

        this.stopTimer();
        this.notifyUpdate();

        return {
            success: true,
            completed,
            actualHours: parseFloat(actualHours.toFixed(2)),
            targetHours: historyEntry.targetHours,
            entry: historyEntry
        };
    }

    /**
     * Cancel current fast (no history entry)
     * @returns {Object} Result
     */
    cancelFast() {
        const data = this.getData();
        if (!data.activeFast) {
            return { success: false, error: 'No hay ayuno activo' };
        }

        data.activeFast = null;
        this.saveData(data);

        this.stopTimer();
        this.notifyUpdate();

        return { success: true, message: 'Ayuno cancelado' };
    }

    /**
     * Update notes for active fast
     * @param {Object} notes - { energy, hunger, focus }
     */
    updateNotes(notes) {
        const data = this.getData();
        if (!data.activeFast) return;

        data.activeFast.notes = { ...data.activeFast.notes, ...notes };
        this.saveData(data);
    }

    // ==================== History Management ====================

    /**
     * Get fasting history
     * @param {number} limit - Max entries to return
     * @returns {Array}
     */
    getHistory(limit = 50) {
        const data = this.getData();
        return data.history.slice(0, limit);
    }

    /**
     * Get history entry by ID
     * @param {string} id
     * @returns {Object|null}
     */
    getHistoryEntry(id) {
        const data = this.getData();
        return data.history.find(h => h.id === id) || null;
    }

    /**
     * Update history entry
     * @param {string} id
     * @param {Object} updates
     */
    updateHistoryEntry(id, updates) {
        const data = this.getData();
        const index = data.history.findIndex(h => h.id === id);

        if (index !== -1) {
            data.history[index] = { ...data.history[index], ...updates };
            this.saveData(data);
            this.notifyUpdate();
        }
    }

    /**
     * Delete history entry
     * @param {string} id
     */
    deleteHistoryEntry(id) {
        const data = this.getData();
        data.history = data.history.filter(h => h.id !== id);
        this.saveData(data);
        this.notifyUpdate();
    }

    /**
     * Clear all history
     */
    clearHistory() {
        const data = this.getData();
        data.history = [];
        this.saveData(data);
        this.notifyUpdate();
    }

    // ==================== Statistics ====================

    /**
     * Get fasting statistics
     * @returns {Object}
     */
    getStats() {
        const data = this.getData();
        const history = data.history;

        if (history.length === 0) {
            return {
                totalFasts: 0,
                completedFasts: 0,
                completionRate: 0,
                totalHours: 0,
                averageHours: 0,
                longestFast: 0,
                currentStreak: 0,
                bestStreak: 0
            };
        }

        const completedFasts = history.filter(h => h.completed);
        const totalHours = history.reduce((sum, h) => sum + h.actualHours, 0);

        // Calculate streak
        let currentStreak = 0;
        let bestStreak = 0;
        let tempStreak = 0;

        // Sort by date descending
        const sortedHistory = [...history].sort((a, b) =>
            new Date(b.endedAt) - new Date(a.endedAt)
        );

        // Check consecutive days
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        for (let i = 0; i < sortedHistory.length; i++) {
            const entryDate = new Date(sortedHistory[i].endedAt);
            entryDate.setHours(0, 0, 0, 0);

            const expectedDate = new Date(today);
            expectedDate.setDate(expectedDate.getDate() - i);

            if (entryDate.getTime() === expectedDate.getTime()) {
                tempStreak++;
                if (i === 0 || currentStreak > 0) {
                    currentStreak = tempStreak;
                }
            } else {
                bestStreak = Math.max(bestStreak, tempStreak);
                tempStreak = 0;
            }
        }

        bestStreak = Math.max(bestStreak, tempStreak, currentStreak);

        return {
            totalFasts: history.length,
            completedFasts: completedFasts.length,
            completionRate: Math.round((completedFasts.length / history.length) * 100),
            totalHours: Math.round(totalHours * 10) / 10,
            averageHours: Math.round((totalHours / history.length) * 10) / 10,
            longestFast: Math.max(...history.map(h => h.actualHours)),
            currentStreak,
            bestStreak
        };
    }

    // ==================== Settings ====================

    /**
     * Get settings
     * @returns {Object}
     */
    getSettings() {
        const data = this.getData();
        return data.settings || { defaultType: '16:8', reminderEnabled: false };
    }

    /**
     * Update settings
     * @param {Object} settings
     */
    updateSettings(settings) {
        const data = this.getData();
        data.settings = { ...data.settings, ...settings };
        this.saveData(data);
    }

    // ==================== Cleanup ====================

    /**
     * Initialize manager (call on app start)
     */
    init() {
        // If there's an active fast, restart the timer
        if (this.hasActiveFast()) {
            this.startTimer();
        }
    }

    /**
     * Cleanup (call on app destroy)
     */
    destroy() {
        this.stopTimer();
    }
}

// Export singleton instance
export const fastingManager = new FastingManager();
export default fastingManager;
