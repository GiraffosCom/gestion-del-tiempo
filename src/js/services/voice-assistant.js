/**
 * Voice Assistant Module
 * Asistente de voz para comandos naturales en español
 * @module services/voice-assistant
 */

import { storage } from './storage.js';
import { generateId } from '../utils/helpers.js';

/**
 * Intent types supported by the assistant
 */
export const INTENT_TYPES = {
    ADD_ACTIVITY: 'add_activity',
    ADD_HABIT: 'add_habit',
    COMPLETE_HABIT: 'complete_habit',
    ADD_EXPENSE: 'add_expense',
    START_FASTING: 'start_fasting',
    END_FASTING: 'end_fasting',
    ADD_GOAL: 'add_goal',
    LOG_WEIGHT: 'log_weight',
    UNKNOWN: 'unknown'
};

/**
 * Keywords for intent detection
 */
const INTENT_KEYWORDS = {
    add: ['agregar', 'añadir', 'crear', 'programar', 'agendar', 'poner', 'registrar', 'anotar', 'apuntar'],
    complete: ['completar', 'marcar', 'terminar', 'hecho', 'listo', 'check', 'cumplir', 'tachar'],
    start: ['iniciar', 'empezar', 'comenzar', 'arrancar', 'start'],
    end: ['terminar', 'finalizar', 'acabar', 'parar', 'detener', 'stop', 'end'],
    delete: ['eliminar', 'borrar', 'quitar', 'remover', 'cancelar']
};

const ENTITY_KEYWORDS = {
    activity: ['actividad', 'tarea', 'cita', 'evento', 'reunión', 'reunion', 'compromiso', 'pendiente'],
    habit: ['hábito', 'habito', 'rutina'],
    expense: ['gasto', 'compra', 'pago', 'costo'],
    fasting: ['ayuno', 'ayunar', 'fasting'],
    goal: ['meta', 'objetivo', 'propósito', 'proposito'],
    weight: ['peso', 'kilos', 'kg']
};

/**
 * Time patterns for Spanish
 */
const TIME_PATTERNS = [
    // "a las 3", "a las 15", "a las 3 pm"
    /a\s*las?\s*(\d{1,2})(?::(\d{2}))?\s*(am|pm|de la mañana|de la tarde|de la noche)?/i,
    // "3 pm", "15:00", "3:30 pm"
    /(\d{1,2})(?::(\d{2}))?\s*(am|pm|de la mañana|de la tarde|de la noche)/i,
    // "en la mañana", "por la tarde", "en la noche"
    /(en|por)\s*la\s*(mañana|tarde|noche)/i,
    // "mañana a las 3"
    /mañana\s*(?:a\s*las?\s*)?(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i,
    // "a mediodía", "al mediodía"
    /a[l]?\s*mediod[ií]a/i,
    // Relative: "en 30 minutos", "en 2 horas"
    /en\s*(\d+)\s*(minutos?|horas?|min|hr)/i
];

/**
 * Duration patterns
 */
const DURATION_PATTERNS = [
    /(?:por|durante|de)?\s*(\d+)\s*(minutos?|min|horas?|hr|h)/i,
    /(\d+)\s*(?:a|-)?\s*(\d+)\s*(minutos?|horas?)/i
];

/**
 * Amount patterns for expenses
 */
const AMOUNT_PATTERNS = [
    /(\d+(?:\.\d{2})?)\s*(pesos?|dlls?|dólares?|dolares?|euros?|mxn|usd|eur|\$)/i,
    /\$\s*(\d+(?:\.\d{2})?)/i,
    /(\d+(?:\.\d{2})?)\s*(?:de\s+)?(?:pesos?)/i
];

/**
 * Expense categories mapping
 */
const EXPENSE_CATEGORY_KEYWORDS = {
    food: ['comida', 'comer', 'almuerzo', 'cena', 'desayuno', 'restaurante', 'cafe', 'café', 'snack'],
    transport: ['uber', 'taxi', 'gasolina', 'gas', 'transporte', 'metro', 'camión', 'camion', 'estacionamiento'],
    entertainment: ['cine', 'netflix', 'spotify', 'juego', 'diversión', 'diversion', 'salida', 'bar', 'fiesta'],
    shopping: ['compra', 'ropa', 'zapatos', 'tienda', 'amazon', 'mercado'],
    health: ['medicina', 'doctor', 'médico', 'medico', 'farmacia', 'gym', 'gimnasio', 'salud'],
    bills: ['luz', 'agua', 'internet', 'teléfono', 'telefono', 'renta', 'servicio'],
    other: []
};

/**
 * Fasting type keywords
 */
const FASTING_TYPE_KEYWORDS = {
    '12:12': ['12', 'doce'],
    '14:10': ['14', 'catorce'],
    '16:8': ['16', 'dieciséis', 'dieciseis'],
    '18:6': ['18', 'dieciocho'],
    '20:4': ['20', 'veinte', 'guerrero'],
    '24:0': ['24', 'veinticuatro', 'omad', 'un día', 'un dia']
};

class VoiceAssistant {
    constructor() {
        this.recognition = null;
        this.isListening = false;
        this.isSupported = false;
        this.onResult = null;
        this.onError = null;
        this.onStart = null;
        this.onEnd = null;
        this.onInterimResult = null;

        this._initRecognition();
    }

    /**
     * Initialize Speech Recognition
     */
    _initRecognition() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

        if (!SpeechRecognition) {
            console.warn('[VoiceAssistant] Speech Recognition not supported');
            this.isSupported = false;
            return;
        }

        this.isSupported = true;
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.interimResults = true;
        this.recognition.lang = 'es-MX'; // Spanish Mexico
        this.recognition.maxAlternatives = 3;

        this.recognition.onstart = () => {
            this.isListening = true;
            if (typeof this.onStart === 'function') {
                this.onStart();
            }
        };

        this.recognition.onend = () => {
            this.isListening = false;
            if (typeof this.onEnd === 'function') {
                this.onEnd();
            }
        };

        this.recognition.onresult = (event) => {
            const results = event.results;
            const lastResult = results[results.length - 1];

            if (lastResult.isFinal) {
                const transcript = lastResult[0].transcript.trim();
                const confidence = lastResult[0].confidence;

                console.log('[VoiceAssistant] Final:', transcript, 'Confidence:', confidence);

                if (typeof this.onResult === 'function') {
                    const parsed = this.parseCommand(transcript);
                    this.onResult({
                        transcript,
                        confidence,
                        parsed
                    });
                }
            } else {
                // Interim result
                const interim = lastResult[0].transcript;
                if (typeof this.onInterimResult === 'function') {
                    this.onInterimResult(interim);
                }
            }
        };

        this.recognition.onerror = (event) => {
            console.error('[VoiceAssistant] Error:', event.error);
            this.isListening = false;

            if (typeof this.onError === 'function') {
                let errorMessage = 'Error de reconocimiento de voz';

                switch (event.error) {
                    case 'no-speech':
                        errorMessage = 'No se detectó voz. Intenta de nuevo.';
                        break;
                    case 'audio-capture':
                        errorMessage = 'No se encontró micrófono.';
                        break;
                    case 'not-allowed':
                        errorMessage = 'Permiso de micrófono denegado.';
                        break;
                    case 'network':
                        errorMessage = 'Error de red. Verifica tu conexión.';
                        break;
                    case 'aborted':
                        errorMessage = 'Grabación cancelada.';
                        break;
                }

                this.onError(errorMessage, event.error);
            }
        };
    }

    /**
     * Start listening
     */
    start() {
        if (!this.isSupported) {
            if (typeof this.onError === 'function') {
                this.onError('Tu navegador no soporta reconocimiento de voz', 'not-supported');
            }
            return false;
        }

        if (this.isListening) {
            this.stop();
            return false;
        }

        try {
            this.recognition.start();
            return true;
        } catch (error) {
            // Handle InvalidStateError - abort and retry
            if (error.name === 'InvalidStateError') {
                console.log('[VoiceAssistant] Resetting recognition state...');
                try {
                    this.recognition.abort();
                } catch (e) {
                    // Ignore abort errors
                }
                // Small delay then retry
                setTimeout(() => {
                    try {
                        this.recognition.start();
                    } catch (e) {
                        console.error('[VoiceAssistant] Retry failed:', e);
                        if (typeof this.onError === 'function') {
                            this.onError('Error al iniciar el micrófono. Intenta de nuevo.', 'start-failed');
                        }
                    }
                }, 100);
                return true;
            }
            console.error('[VoiceAssistant] Start error:', error);
            if (typeof this.onError === 'function') {
                this.onError('Error al iniciar el micrófono', 'start-error');
            }
            return false;
        }
    }

    /**
     * Stop listening
     */
    stop() {
        if (this.recognition) {
            try {
                this.recognition.abort();
            } catch (e) {
                // Ignore
            }
            this.isListening = false;
        }
    }

    /**
     * Toggle listening state
     */
    toggle() {
        if (this.isListening) {
            this.stop();
        } else {
            this.start();
        }
        return this.isListening;
    }

    // ==================== Command Parsing ====================

    /**
     * Parse a voice command into structured data
     * @param {string} text - The transcribed text
     * @returns {Object} Parsed command with intent and entities
     */
    parseCommand(text) {
        const normalizedText = text.toLowerCase().trim();

        // Detect intent and entity
        const intent = this._detectIntent(normalizedText);

        // Parse based on intent
        switch (intent.type) {
            case INTENT_TYPES.ADD_ACTIVITY:
                return this._parseAddActivity(normalizedText, intent);

            case INTENT_TYPES.ADD_HABIT:
                return this._parseAddHabit(normalizedText, intent);

            case INTENT_TYPES.COMPLETE_HABIT:
                return this._parseCompleteHabit(normalizedText, intent);

            case INTENT_TYPES.ADD_EXPENSE:
                return this._parseAddExpense(normalizedText, intent);

            case INTENT_TYPES.START_FASTING:
                return this._parseStartFasting(normalizedText, intent);

            case INTENT_TYPES.END_FASTING:
                return { intent: INTENT_TYPES.END_FASTING, data: {} };

            case INTENT_TYPES.LOG_WEIGHT:
                return this._parseLogWeight(normalizedText, intent);

            default:
                // Default to adding activity if we can extract useful info
                return this._parseAddActivity(normalizedText, { type: INTENT_TYPES.ADD_ACTIVITY });
        }
    }

    /**
     * Detect intent from text
     */
    _detectIntent(text) {
        // Check for fasting commands first (more specific)
        if (this._containsAny(text, ENTITY_KEYWORDS.fasting)) {
            if (this._containsAny(text, INTENT_KEYWORDS.start) || this._containsAny(text, INTENT_KEYWORDS.add)) {
                return { type: INTENT_TYPES.START_FASTING };
            }
            if (this._containsAny(text, INTENT_KEYWORDS.end)) {
                return { type: INTENT_TYPES.END_FASTING };
            }
        }

        // Check for expense
        if (this._containsAny(text, ENTITY_KEYWORDS.expense) || this._hasAmount(text)) {
            if (this._containsAny(text, [...INTENT_KEYWORDS.add, 'gasté', 'gaste', 'pagué', 'pague', 'compré', 'compre'])) {
                return { type: INTENT_TYPES.ADD_EXPENSE };
            }
        }

        // Check for weight logging
        if (this._containsAny(text, ENTITY_KEYWORDS.weight)) {
            return { type: INTENT_TYPES.LOG_WEIGHT };
        }

        // Check for habit completion
        if (this._containsAny(text, ENTITY_KEYWORDS.habit)) {
            if (this._containsAny(text, INTENT_KEYWORDS.complete)) {
                return { type: INTENT_TYPES.COMPLETE_HABIT };
            }
            if (this._containsAny(text, INTENT_KEYWORDS.add)) {
                return { type: INTENT_TYPES.ADD_HABIT };
            }
        }

        // Check for goal
        if (this._containsAny(text, ENTITY_KEYWORDS.goal)) {
            return { type: INTENT_TYPES.ADD_GOAL };
        }

        // Default: activity/task (most common use case)
        if (this._containsAny(text, [...INTENT_KEYWORDS.add, ...ENTITY_KEYWORDS.activity]) ||
            this._hasTimeInfo(text)) {
            return { type: INTENT_TYPES.ADD_ACTIVITY };
        }

        // If nothing matched but there's content, assume it's an activity
        if (text.length > 3) {
            return { type: INTENT_TYPES.ADD_ACTIVITY };
        }

        return { type: INTENT_TYPES.UNKNOWN };
    }

    /**
     * Parse add activity command
     */
    _parseAddActivity(text, intent) {
        const result = {
            intent: INTENT_TYPES.ADD_ACTIVITY,
            data: {
                name: '',
                time: null,
                duration: 30,
                category: 'personal',
                date: new Date().toISOString().split('T')[0]
            },
            confidence: 0.5
        };

        // Extract time
        const timeInfo = this._extractTime(text);
        if (timeInfo) {
            result.data.time = timeInfo.time;
            result.data.date = timeInfo.date || result.data.date;
            result.confidence += 0.2;
        }

        // Extract duration
        const duration = this._extractDuration(text);
        if (duration) {
            result.data.duration = duration;
        }

        // Extract activity name (remove keywords and time info)
        let name = text;

        // Remove action keywords
        INTENT_KEYWORDS.add.forEach(kw => {
            name = name.replace(new RegExp(`\\b${kw}\\b`, 'gi'), '');
        });

        // Remove entity keywords
        ENTITY_KEYWORDS.activity.forEach(kw => {
            name = name.replace(new RegExp(`\\b${kw}\\b`, 'gi'), '');
        });

        // Remove time expressions
        TIME_PATTERNS.forEach(pattern => {
            name = name.replace(pattern, '');
        });

        // Remove duration expressions
        DURATION_PATTERNS.forEach(pattern => {
            name = name.replace(pattern, '');
        });

        // Remove common filler words
        const fillers = ['a', 'el', 'la', 'los', 'las', 'un', 'una', 'de', 'del', 'para', 'por', 'que', 'con'];
        fillers.forEach(f => {
            name = name.replace(new RegExp(`^${f}\\s+`, 'gi'), '');
        });

        // Clean up
        name = name.replace(/\s+/g, ' ').trim();

        // Capitalize first letter
        if (name.length > 0) {
            name = name.charAt(0).toUpperCase() + name.slice(1);
            result.data.name = name;
            result.confidence += 0.3;
        }

        // Detect category from content
        result.data.category = this._detectActivityCategory(text);

        return result;
    }

    /**
     * Parse add habit command
     */
    _parseAddHabit(text, intent) {
        let name = text;

        // Remove keywords
        [...INTENT_KEYWORDS.add, ...ENTITY_KEYWORDS.habit].forEach(kw => {
            name = name.replace(new RegExp(`\\b${kw}\\b`, 'gi'), '');
        });

        name = name.replace(/\s+/g, ' ').trim();
        name = name.charAt(0).toUpperCase() + name.slice(1);

        return {
            intent: INTENT_TYPES.ADD_HABIT,
            data: {
                name: name || 'Nuevo hábito',
                icon: this._suggestHabitIcon(name)
            },
            confidence: name.length > 2 ? 0.8 : 0.5
        };
    }

    /**
     * Parse complete habit command
     */
    _parseCompleteHabit(text, intent) {
        let habitName = text;

        [...INTENT_KEYWORDS.complete, ...ENTITY_KEYWORDS.habit].forEach(kw => {
            habitName = habitName.replace(new RegExp(`\\b${kw}\\b`, 'gi'), '');
        });

        habitName = habitName.replace(/\s+/g, ' ').trim();

        return {
            intent: INTENT_TYPES.COMPLETE_HABIT,
            data: {
                searchTerm: habitName
            },
            confidence: habitName.length > 2 ? 0.7 : 0.4
        };
    }

    /**
     * Parse add expense command
     */
    _parseAddExpense(text, intent) {
        const result = {
            intent: INTENT_TYPES.ADD_EXPENSE,
            data: {
                amount: 0,
                category: 'other',
                description: ''
            },
            confidence: 0.5
        };

        // Extract amount
        for (const pattern of AMOUNT_PATTERNS) {
            const match = text.match(pattern);
            if (match) {
                result.data.amount = parseFloat(match[1]);
                result.confidence += 0.3;
                break;
            }
        }

        // Detect category
        for (const [category, keywords] of Object.entries(EXPENSE_CATEGORY_KEYWORDS)) {
            if (this._containsAny(text, keywords)) {
                result.data.category = category;
                result.confidence += 0.1;
                break;
            }
        }

        // Extract description
        let desc = text;
        AMOUNT_PATTERNS.forEach(p => desc = desc.replace(p, ''));
        [...INTENT_KEYWORDS.add, ...ENTITY_KEYWORDS.expense, 'gasté', 'gaste', 'pagué', 'pague'].forEach(kw => {
            desc = desc.replace(new RegExp(`\\b${kw}\\b`, 'gi'), '');
        });
        desc = desc.replace(/\s+/g, ' ').trim();

        if (desc.length > 0) {
            result.data.description = desc.charAt(0).toUpperCase() + desc.slice(1);
        }

        return result;
    }

    /**
     * Parse start fasting command
     */
    _parseStartFasting(text, intent) {
        const result = {
            intent: INTENT_TYPES.START_FASTING,
            data: {
                type: '16:8' // default
            },
            confidence: 0.7
        };

        // Detect fasting type
        for (const [type, keywords] of Object.entries(FASTING_TYPE_KEYWORDS)) {
            if (this._containsAny(text, keywords)) {
                result.data.type = type;
                result.confidence = 0.9;
                break;
            }
        }

        // Check for custom hours
        const hoursMatch = text.match(/(\d+)\s*horas?/i);
        if (hoursMatch) {
            const hours = parseInt(hoursMatch[1]);
            if (hours >= 12 && hours <= 24) {
                result.data.type = 'custom';
                result.data.customHours = hours;
                result.confidence = 0.85;
            }
        }

        return result;
    }

    /**
     * Parse log weight command
     */
    _parseLogWeight(text, intent) {
        const result = {
            intent: INTENT_TYPES.LOG_WEIGHT,
            data: {
                weight: null
            },
            confidence: 0.5
        };

        // Extract weight value
        const weightMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:kg|kilos?)?/i);
        if (weightMatch) {
            result.data.weight = parseFloat(weightMatch[1]);
            result.confidence = 0.9;
        }

        return result;
    }

    // ==================== Helper Methods ====================

    /**
     * Check if text contains any of the keywords
     */
    _containsAny(text, keywords) {
        return keywords.some(kw => text.includes(kw));
    }

    /**
     * Check if text has amount information
     */
    _hasAmount(text) {
        return AMOUNT_PATTERNS.some(p => p.test(text));
    }

    /**
     * Check if text has time information
     */
    _hasTimeInfo(text) {
        return TIME_PATTERNS.some(p => p.test(text));
    }

    /**
     * Extract time from text
     */
    _extractTime(text) {
        // Try each pattern
        for (const pattern of TIME_PATTERNS) {
            const match = text.match(pattern);
            if (match) {
                return this._parseTimeMatch(match, text);
            }
        }
        return null;
    }

    /**
     * Parse time match into HH:MM format
     */
    _parseTimeMatch(match, originalText) {
        let hours = 0;
        let minutes = 0;
        let date = new Date().toISOString().split('T')[0];

        // Check for "mañana" (tomorrow)
        if (originalText.includes('mañana') && !originalText.includes('de la mañana')) {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            date = tomorrow.toISOString().split('T')[0];
        }

        // Handle relative time ("en X minutos/horas")
        if (match[0].startsWith('en ')) {
            const value = parseInt(match[1]);
            const unit = match[2].toLowerCase();
            const now = new Date();

            if (unit.startsWith('hora') || unit === 'hr' || unit === 'h') {
                now.setHours(now.getHours() + value);
            } else {
                now.setMinutes(now.getMinutes() + value);
            }

            hours = now.getHours();
            minutes = now.getMinutes();
            date = now.toISOString().split('T')[0];
        }
        // Handle "mediodía"
        else if (match[0].includes('mediod')) {
            hours = 12;
            minutes = 0;
        }
        // Handle general time patterns
        else if (match[1]) {
            hours = parseInt(match[1]);
            minutes = match[2] ? parseInt(match[2]) : 0;

            // Handle AM/PM
            const period = match[3]?.toLowerCase() || '';

            if (period.includes('pm') || period.includes('tarde') || period.includes('noche')) {
                if (hours < 12) hours += 12;
            } else if (period.includes('am') || period.includes('mañana')) {
                if (hours === 12) hours = 0;
            } else {
                // No AM/PM specified - assume PM for hours 1-6, AM for 7-11
                if (hours >= 1 && hours <= 6) {
                    hours += 12;
                }
            }
        }
        // Handle "en la mañana/tarde/noche"
        else if (match[2]) {
            const timeOfDay = match[2].toLowerCase();
            if (timeOfDay === 'mañana') {
                hours = 9;
            } else if (timeOfDay === 'tarde') {
                hours = 15;
            } else if (timeOfDay === 'noche') {
                hours = 20;
            }
        }

        // Format time
        const time = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;

        return { time, date };
    }

    /**
     * Extract duration from text
     */
    _extractDuration(text) {
        for (const pattern of DURATION_PATTERNS) {
            const match = text.match(pattern);
            if (match) {
                const value = parseInt(match[1]);
                const unit = match[2]?.toLowerCase() || match[3]?.toLowerCase() || '';

                if (unit.startsWith('hora') || unit === 'hr' || unit === 'h') {
                    return value * 60;
                }
                return value; // minutes
            }
        }
        return null;
    }

    /**
     * Detect activity category from text
     */
    _detectActivityCategory(text) {
        const categories = {
            trabajo: ['trabajo', 'oficina', 'reunión', 'reunion', 'junta', 'llamada', 'cliente', 'proyecto', 'presentación'],
            salud: ['doctor', 'médico', 'medico', 'cita médica', 'dentista', 'gym', 'gimnasio', 'ejercicio', 'correr'],
            personal: ['casa', 'hogar', 'familia', 'amigos', 'compras', 'banco', 'trámite', 'tramite'],
            estudio: ['estudiar', 'clase', 'curso', 'tarea', 'examen', 'universidad', 'escuela', 'leer'],
            ocio: ['película', 'pelicula', 'cine', 'fiesta', 'salir', 'restaurante', 'viaje', 'paseo']
        };

        for (const [category, keywords] of Object.entries(categories)) {
            if (this._containsAny(text, keywords)) {
                return category;
            }
        }
        return 'personal';
    }

    /**
     * Suggest icon for habit based on name
     */
    _suggestHabitIcon(name) {
        const iconMap = {
            'agua': '💧',
            'ejercicio': '🏃',
            'gym': '💪',
            'gimnasio': '💪',
            'meditar': '🧘',
            'meditación': '🧘',
            'leer': '📚',
            'lectura': '📚',
            'dormir': '😴',
            'despertar': '☀️',
            'vitaminas': '💊',
            'skincare': '✨',
            'journaling': '📝',
            'escribir': '📝',
            'caminar': '🚶',
            'correr': '🏃',
            'yoga': '🧘',
            'estirar': '🤸',
            'ayuno': '⏰',
            'proteína': '🥤',
            'fruta': '🍎',
            'verdura': '🥗'
        };

        const nameLower = name.toLowerCase();
        for (const [keyword, icon] of Object.entries(iconMap)) {
            if (nameLower.includes(keyword)) {
                return icon;
            }
        }
        return '✅';
    }
}

// Export singleton
export const voiceAssistant = new VoiceAssistant();
export default voiceAssistant;
