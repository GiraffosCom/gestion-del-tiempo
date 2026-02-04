/**
 * Índice de datos
 * Exporta todas las bases de datos y constantes
 * @module data
 */

export {
    EXERCISE_DATABASE,
    TRAINING_SPLITS,
    ROUTINE_TYPES,
    EXERCISE_INFO,
    MUSCLE_LABELS,
    EQUIPMENT_LABELS,
    getFilteredExercises,
    getExerciseInfo
} from './exercises.js';

export {
    DEFAULT_HABITS,
    HABIT_CATEGORIES,
    HABIT_TEMPLATES,
    getDefaultHabitsByGender,
    getTemplate,
    getAllTemplates,
    getHabitsByCategory
} from './habits-presets.js';
