/**
 * Voice Command Executor
 * Executes parsed voice commands using the app managers
 * @module services/voice-executor
 */

import { voiceAssistant, INTENT_TYPES } from './voice-assistant.js';
import { storage } from './storage.js';
import { generateId } from '../utils/helpers.js';
import { getTodayKey, getDateKey } from '../utils/date.js';

class VoiceExecutor {
    constructor() {
        this.onExecute = null;
        this.onFeedback = null;
        this.managers = {};
    }

    /**
     * Set manager references
     * Should be called after app initialization
     */
    setManagers(managers) {
        this.managers = managers;
    }

    /**
     * Execute a parsed command
     * @param {Object} parsed - Parsed command from voice assistant
     * @returns {Object} Execution result
     */
    async execute(parsed) {
        const { intent, data, confidence } = parsed;

        // Low confidence warning
        if (confidence < 0.4) {
            return {
                success: false,
                message: 'No entendí bien el comando. ¿Puedes repetirlo?',
                requiresConfirmation: true,
                parsed
            };
        }

        let result;

        switch (intent) {
            case INTENT_TYPES.ADD_ACTIVITY:
                result = await this._executeAddActivity(data);
                break;

            case INTENT_TYPES.ADD_HABIT:
                result = await this._executeAddHabit(data);
                break;

            case INTENT_TYPES.COMPLETE_HABIT:
                result = await this._executeCompleteHabit(data);
                break;

            case INTENT_TYPES.ADD_EXPENSE:
                result = await this._executeAddExpense(data);
                break;

            case INTENT_TYPES.START_FASTING:
                result = await this._executeStartFasting(data);
                break;

            case INTENT_TYPES.END_FASTING:
                result = await this._executeEndFasting(data);
                break;

            case INTENT_TYPES.LOG_WEIGHT:
                result = await this._executeLogWeight(data);
                break;

            default:
                result = {
                    success: false,
                    message: 'No entendí qué quieres hacer. Intenta decir: "Agregar [actividad] a las [hora]"',
                    parsed
                };
        }

        // Notify feedback
        if (typeof this.onFeedback === 'function') {
            this.onFeedback(result);
        }

        return result;
    }

    // ==================== Execution Methods ====================

    /**
     * Execute add activity
     */
    async _executeAddActivity(data) {
        if (!data.name || data.name.length < 2) {
            return {
                success: false,
                message: 'No entendí el nombre de la actividad',
                data
            };
        }

        try {
            // Use scheduleManager if available, otherwise use storage directly
            if (this.managers.scheduleManager) {
                const activity = {
                    id: generateId(),
                    name: data.name,
                    time: data.time || '12:00',
                    duration: data.duration || 30,
                    category: data.category || 'personal',
                    completed: false
                };

                this.managers.scheduleManager.addActivity(activity, new Date(data.date));

                return {
                    success: true,
                    message: `✅ "${data.name}" agregado ${data.time ? `a las ${data.time}` : 'a tu agenda'}`,
                    action: 'add_activity',
                    data: activity
                };
            } else {
                // Fallback to storage
                const dateKey = data.date || getTodayKey();
                const scheduleKey = `schedule-${dateKey}`;
                const schedule = storage.get(scheduleKey, []);

                const newActivity = {
                    id: generateId(),
                    name: data.name,
                    time: data.time || '12:00',
                    duration: data.duration || 30,
                    category: data.category || 'personal',
                    completed: false
                };

                schedule.push(newActivity);
                storage.set(scheduleKey, schedule);

                return {
                    success: true,
                    message: `✅ "${data.name}" agregado ${data.time ? `a las ${data.time}` : 'a tu agenda'}`,
                    action: 'add_activity',
                    data: newActivity,
                    refreshUI: true
                };
            }
        } catch (error) {
            console.error('[VoiceExecutor] Add activity error:', error);
            return {
                success: false,
                message: 'Error al agregar la actividad',
                error: error.message
            };
        }
    }

    /**
     * Execute add habit
     */
    async _executeAddHabit(data) {
        if (!data.name || data.name.length < 2) {
            return {
                success: false,
                message: 'No entendí el nombre del hábito',
                data
            };
        }

        try {
            if (this.managers.habitsManager) {
                const habit = {
                    id: generateId(),
                    name: data.name,
                    icon: data.icon || '✅',
                    completed: false
                };

                this.managers.habitsManager.addHabit(habit);

                return {
                    success: true,
                    message: `✅ Hábito "${data.name}" agregado`,
                    action: 'add_habit',
                    data: habit
                };
            } else {
                // Fallback
                const dateKey = getTodayKey();
                const habitsKey = `habits-${dateKey}`;
                const habits = storage.get(habitsKey, []);

                const newHabit = {
                    id: generateId(),
                    name: data.name,
                    icon: data.icon || '✅',
                    completed: false
                };

                habits.push(newHabit);
                storage.set(habitsKey, habits);

                return {
                    success: true,
                    message: `✅ Hábito "${data.name}" agregado`,
                    action: 'add_habit',
                    data: newHabit,
                    refreshUI: true
                };
            }
        } catch (error) {
            console.error('[VoiceExecutor] Add habit error:', error);
            return {
                success: false,
                message: 'Error al agregar el hábito',
                error: error.message
            };
        }
    }

    /**
     * Execute complete habit
     */
    async _executeCompleteHabit(data) {
        if (!data.searchTerm) {
            return {
                success: false,
                message: '¿Qué hábito quieres completar?',
                data
            };
        }

        try {
            // Search for habit by name
            const dateKey = getTodayKey();
            const habitsKey = `habits-${dateKey}`;
            const habits = storage.get(habitsKey, []);

            const searchLower = data.searchTerm.toLowerCase();
            const habit = habits.find(h =>
                h.name.toLowerCase().includes(searchLower) ||
                searchLower.includes(h.name.toLowerCase())
            );

            if (!habit) {
                return {
                    success: false,
                    message: `No encontré un hábito que coincida con "${data.searchTerm}"`,
                    data
                };
            }

            // Toggle completion
            habit.completed = !habit.completed;
            storage.set(habitsKey, habits);

            return {
                success: true,
                message: habit.completed
                    ? `✅ "${habit.name}" marcado como completado`
                    : `↩️ "${habit.name}" marcado como pendiente`,
                action: 'toggle_habit',
                data: habit,
                refreshUI: true
            };
        } catch (error) {
            console.error('[VoiceExecutor] Complete habit error:', error);
            return {
                success: false,
                message: 'Error al actualizar el hábito',
                error: error.message
            };
        }
    }

    /**
     * Execute add expense
     */
    async _executeAddExpense(data) {
        if (!data.amount || data.amount <= 0) {
            return {
                success: false,
                message: 'No entendí el monto del gasto. Di por ejemplo: "Gasto 50 pesos en comida"',
                data
            };
        }

        try {
            if (this.managers.expensesManager) {
                const expense = {
                    amount: data.amount,
                    category: data.category || 'other',
                    description: data.description || 'Gasto por voz'
                };

                this.managers.expensesManager.addExpense(expense);

                return {
                    success: true,
                    message: `💰 Gasto de $${data.amount} registrado en ${this._getCategoryName(data.category)}`,
                    action: 'add_expense',
                    data: expense
                };
            } else {
                // Fallback
                const expenses = storage.get('expenses', []);

                const newExpense = {
                    id: generateId(),
                    amount: data.amount,
                    category: data.category || 'other',
                    description: data.description || 'Gasto por voz',
                    date: new Date().toISOString()
                };

                expenses.push(newExpense);
                storage.set('expenses', expenses);

                return {
                    success: true,
                    message: `💰 Gasto de $${data.amount} registrado`,
                    action: 'add_expense',
                    data: newExpense,
                    refreshUI: true
                };
            }
        } catch (error) {
            console.error('[VoiceExecutor] Add expense error:', error);
            return {
                success: false,
                message: 'Error al registrar el gasto',
                error: error.message
            };
        }
    }

    /**
     * Execute start fasting
     */
    async _executeStartFasting(data) {
        try {
            if (this.managers.fastingManager) {
                const result = this.managers.fastingManager.startFast(
                    data.type,
                    data.customHours
                );

                if (result.success) {
                    return {
                        success: true,
                        message: `⏱️ ${result.message}`,
                        action: 'start_fasting',
                        data: result
                    };
                } else {
                    return {
                        success: false,
                        message: result.error || 'No se pudo iniciar el ayuno',
                        data
                    };
                }
            } else {
                return {
                    success: false,
                    message: 'El módulo de ayuno no está disponible',
                    data
                };
            }
        } catch (error) {
            console.error('[VoiceExecutor] Start fasting error:', error);
            return {
                success: false,
                message: 'Error al iniciar el ayuno',
                error: error.message
            };
        }
    }

    /**
     * Execute end fasting
     */
    async _executeEndFasting(data) {
        try {
            if (this.managers.fastingManager) {
                const result = this.managers.fastingManager.endFast();

                if (result.success) {
                    const message = result.completed
                        ? `🎉 ¡Felicidades! Completaste ${result.actualHours.toFixed(1)}h de ayuno`
                        : `⏹️ Ayuno terminado: ${result.actualHours.toFixed(1)}h de ${result.targetHours}h`;

                    return {
                        success: true,
                        message,
                        action: 'end_fasting',
                        data: result
                    };
                } else {
                    return {
                        success: false,
                        message: result.error || 'No hay ayuno activo',
                        data
                    };
                }
            } else {
                return {
                    success: false,
                    message: 'El módulo de ayuno no está disponible',
                    data
                };
            }
        } catch (error) {
            console.error('[VoiceExecutor] End fasting error:', error);
            return {
                success: false,
                message: 'Error al terminar el ayuno',
                error: error.message
            };
        }
    }

    /**
     * Execute log weight
     */
    async _executeLogWeight(data) {
        if (!data.weight || data.weight <= 0) {
            return {
                success: false,
                message: 'No entendí el peso. Di por ejemplo: "Mi peso es 65 kilos"',
                data
            };
        }

        try {
            if (this.managers.gymManager) {
                this.managers.gymManager.updateWeight(data.weight);

                return {
                    success: true,
                    message: `⚖️ Peso registrado: ${data.weight} kg`,
                    action: 'log_weight',
                    data: { weight: data.weight }
                };
            } else {
                // Fallback
                const profile = storage.get('gym-profile', {});
                profile.weight = data.weight;
                profile.weightHistory = profile.weightHistory || [];
                profile.weightHistory.push({
                    date: new Date().toISOString(),
                    weight: data.weight
                });
                storage.set('gym-profile', profile);

                return {
                    success: true,
                    message: `⚖️ Peso registrado: ${data.weight} kg`,
                    action: 'log_weight',
                    data: { weight: data.weight },
                    refreshUI: true
                };
            }
        } catch (error) {
            console.error('[VoiceExecutor] Log weight error:', error);
            return {
                success: false,
                message: 'Error al registrar el peso',
                error: error.message
            };
        }
    }

    // ==================== Helpers ====================

    /**
     * Get category display name
     */
    _getCategoryName(category) {
        const names = {
            food: 'Comida',
            transport: 'Transporte',
            entertainment: 'Entretenimiento',
            shopping: 'Compras',
            health: 'Salud',
            bills: 'Servicios',
            other: 'Otros'
        };
        return names[category] || 'Otros';
    }
}

// Export singleton
export const voiceExecutor = new VoiceExecutor();
export default voiceExecutor;
