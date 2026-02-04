/**
 * Habits Presets Data
 * @description Hábitos predefinidos por categoría y templates
 * @module data/habits-presets
 */

/**
 * Default habits for different user profiles
 */
export const DEFAULT_HABITS = {
    // Base habits for everyone
    base: [
        { icon: '☀️', name: 'Despertar temprano' },
        { icon: '💧', name: 'Beber 2L de agua' },
        { icon: '🧘', name: 'Meditar 10 min' },
        { icon: '📚', name: 'Leer 20 páginas' },
        { icon: '🏃', name: 'Ejercicio' },
        { icon: '🥗', name: 'Comer saludable' },
        { icon: '📝', name: 'Journaling' },
        { icon: '😴', name: 'Dormir 8 horas' }
    ],

    // Female-specific additions
    female: [
        { icon: '✨', name: 'Skincare' },
        { icon: '🎯', name: 'Afirmaciones' }
    ],

    // Male-specific additions
    male: [
        { icon: '💪', name: 'Gimnasio' },
        { icon: '🎯', name: 'Revisar metas' }
    ]
};

/**
 * Habit categories with icons and colors
 */
export const HABIT_CATEGORIES = {
    health: {
        name: 'Salud',
        icon: '❤️',
        color: '#ef4444',
        habits: [
            { icon: '💧', name: 'Beber agua' },
            { icon: '🥗', name: 'Comer saludable' },
            { icon: '💊', name: 'Tomar vitaminas' },
            { icon: '😴', name: 'Dormir 8 horas' },
            { icon: '🚶', name: 'Caminar 10K pasos' }
        ]
    },
    fitness: {
        name: 'Fitness',
        icon: '💪',
        color: '#f97316',
        habits: [
            { icon: '🏃', name: 'Ejercicio' },
            { icon: '💪', name: 'Ir al gym' },
            { icon: '🧘', name: 'Yoga' },
            { icon: '🏋️', name: 'Entrenamiento de fuerza' },
            { icon: '🚴', name: 'Cardio' }
        ]
    },
    mindfulness: {
        name: 'Bienestar Mental',
        icon: '🧠',
        color: '#8b5cf6',
        habits: [
            { icon: '🧘', name: 'Meditar' },
            { icon: '📝', name: 'Journaling' },
            { icon: '🙏', name: 'Gratitud' },
            { icon: '😊', name: 'Afirmaciones positivas' },
            { icon: '🌙', name: 'Desconectar antes de dormir' }
        ]
    },
    productivity: {
        name: 'Productividad',
        icon: '📈',
        color: '#22c55e',
        habits: [
            { icon: '☀️', name: 'Despertar temprano' },
            { icon: '📋', name: 'Planificar el día' },
            { icon: '🎯', name: 'Revisar metas' },
            { icon: '📧', name: 'Inbox zero' },
            { icon: '⏰', name: 'Sin redes sociales 2h' }
        ]
    },
    learning: {
        name: 'Aprendizaje',
        icon: '📚',
        color: '#3b82f6',
        habits: [
            { icon: '📚', name: 'Leer 30 min' },
            { icon: '🎧', name: 'Escuchar podcast' },
            { icon: '📝', name: 'Tomar notas' },
            { icon: '🇬🇧', name: 'Practicar inglés' },
            { icon: '💻', name: 'Curso online' }
        ]
    },
    selfcare: {
        name: 'Cuidado Personal',
        icon: '✨',
        color: '#ec4899',
        habits: [
            { icon: '🧴', name: 'Skincare mañana' },
            { icon: '🌙', name: 'Skincare noche' },
            { icon: '💅', name: 'Cuidado de uñas' },
            { icon: '🛁', name: 'Baño relajante' },
            { icon: '💆', name: 'Auto-masaje' }
        ]
    }
};

/**
 * Pre-made habit templates for different goals
 */
export const HABIT_TEMPLATES = {
    weight_loss: {
        id: 'weight_loss',
        name: 'Pérdida de Peso',
        icon: '⚖️',
        description: 'Hábitos para perder peso de forma saludable',
        habits: [
            { icon: '💧', name: 'Beber 3L de agua' },
            { icon: '🥗', name: 'Déficit calórico' },
            { icon: '🚫', name: 'Sin azúcar añadida' },
            { icon: '🏃', name: 'Cardio 30 min' },
            { icon: '💪', name: 'Entrenamiento' },
            { icon: '📊', name: 'Registrar calorías' },
            { icon: '😴', name: 'Dormir 7-8 horas' },
            { icon: '⏰', name: 'Ayuno intermitente' }
        ]
    },
    muscle_gain: {
        id: 'muscle_gain',
        name: 'Ganancia Muscular',
        icon: '💪',
        description: 'Hábitos para ganar masa muscular',
        habits: [
            { icon: '🍗', name: 'Proteína cada comida' },
            { icon: '🥤', name: 'Batido post-entreno' },
            { icon: '💪', name: 'Entreno de fuerza' },
            { icon: '📝', name: 'Registrar pesos' },
            { icon: '😴', name: 'Dormir 8+ horas' },
            { icon: '💧', name: 'Hidratación' },
            { icon: '🍌', name: 'Carbos pre-entreno' },
            { icon: '📈', name: 'Sobrecarga progresiva' }
        ]
    },
    productivity_boost: {
        id: 'productivity_boost',
        name: 'Máxima Productividad',
        icon: '🚀',
        description: 'Hábitos para ser más productivo',
        habits: [
            { icon: '🌅', name: 'Despertar 6 AM' },
            { icon: '📋', name: 'Plan del día' },
            { icon: '🐸', name: 'Tarea difícil primero' },
            { icon: '⏱️', name: 'Pomodoro (4 ciclos)' },
            { icon: '📵', name: 'Sin distracciones 2h' },
            { icon: '📧', name: 'Email 2x al día' },
            { icon: '🎯', name: 'Revisar prioridades' },
            { icon: '📝', name: 'Review del día' }
        ]
    },
    mental_health: {
        id: 'mental_health',
        name: 'Salud Mental',
        icon: '🧠',
        description: 'Hábitos para el bienestar emocional',
        habits: [
            { icon: '🧘', name: 'Meditación 15 min' },
            { icon: '📝', name: 'Journaling' },
            { icon: '🙏', name: '3 gratitudes' },
            { icon: '🌳', name: 'Tiempo en naturaleza' },
            { icon: '👥', name: 'Conexión social' },
            { icon: '📵', name: 'Desconexión digital' },
            { icon: '🎨', name: 'Actividad creativa' },
            { icon: '😊', name: 'Afirmaciones' }
        ]
    },
    morning_routine: {
        id: 'morning_routine',
        name: 'Rutina Matutina',
        icon: '🌅',
        description: 'Empieza el día con energía',
        habits: [
            { icon: '⏰', name: 'No snooze' },
            { icon: '🛏️', name: 'Hacer la cama' },
            { icon: '💧', name: 'Vaso de agua' },
            { icon: '🧘', name: 'Estiramientos' },
            { icon: '🚿', name: 'Ducha fría/tibia' },
            { icon: '🍳', name: 'Desayuno nutritivo' },
            { icon: '📋', name: 'Revisar agenda' },
            { icon: '🎯', name: '3 prioridades del día' }
        ]
    },
    evening_routine: {
        id: 'evening_routine',
        name: 'Rutina Nocturna',
        icon: '🌙',
        description: 'Prepárate para un sueño reparador',
        habits: [
            { icon: '📵', name: 'Sin pantallas 1h antes' },
            { icon: '📝', name: 'Review del día' },
            { icon: '🧴', name: 'Skincare' },
            { icon: '📚', name: 'Leer 20 min' },
            { icon: '🧘', name: 'Relajación/meditación' },
            { icon: '🎒', name: 'Preparar mañana' },
            { icon: '🙏', name: 'Gratitud' },
            { icon: '😴', name: 'Cama antes de 23h' }
        ]
    },
    miss_universe: {
        id: 'miss_universe',
        name: 'Preparación Miss Universo',
        icon: '👑',
        description: 'Plan completo de preparación',
        habits: [
            { icon: '☀️', name: 'Despertar 7:00 AM' },
            { icon: '💧', name: 'Agua al despertar' },
            { icon: '💊', name: 'Suplementos' },
            { icon: '🧘', name: 'Meditación 30 min' },
            { icon: '✨', name: 'Afirmaciones positivas' },
            { icon: '🥗', name: 'Desayuno proteico' },
            { icon: '🇬🇧', name: 'Clase de inglés' },
            { icon: '🧴', name: 'Skincare AM' },
            { icon: '💪', name: 'Entrenamiento' },
            { icon: '🥤', name: 'Post-entreno proteico' },
            { icon: '📸', name: 'Contenido RRSS' },
            { icon: '📱', name: 'Publicar en RRSS' },
            { icon: '💬', name: 'Interacción audiencia' },
            { icon: '🥦', name: 'Cena sin azúcar' },
            { icon: '🌙', name: 'Skincare PM' },
            { icon: '🙏', name: 'Gratitud (3 cosas)' },
            { icon: '😴', name: 'En cama 22:00' },
            { icon: '💦', name: '3L agua bebidos' }
        ]
    }
};

/**
 * Get habits by gender
 * @param {string} gender - 'male' | 'female'
 * @returns {Array}
 */
export function getDefaultHabitsByGender(gender = 'female') {
    const base = [...DEFAULT_HABITS.base];
    const genderSpecific = DEFAULT_HABITS[gender] || DEFAULT_HABITS.female;
    return [...base, ...genderSpecific];
}

/**
 * Get template by ID
 * @param {string} templateId
 * @returns {Object|null}
 */
export function getTemplate(templateId) {
    return HABIT_TEMPLATES[templateId] || null;
}

/**
 * Get all templates
 * @returns {Array}
 */
export function getAllTemplates() {
    return Object.values(HABIT_TEMPLATES);
}

/**
 * Get habits by category
 * @param {string} categoryId
 * @returns {Array}
 */
export function getHabitsByCategory(categoryId) {
    const category = HABIT_CATEGORIES[categoryId];
    return category ? category.habits : [];
}

export default {
    DEFAULT_HABITS,
    HABIT_CATEGORIES,
    HABIT_TEMPLATES,
    getDefaultHabitsByGender,
    getTemplate,
    getAllTemplates,
    getHabitsByCategory
};
