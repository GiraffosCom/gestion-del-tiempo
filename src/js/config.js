/**
 * Configuración global de la aplicación
 * @module config
 */

export const APP_CONFIG = {
  name: 'Gestión del Tiempo',
  version: '1.0.0',
  storagePrefix: 'gestion',
  defaultLanguage: 'es',
  supportedLanguages: ['es', 'en'],
};

export const STORAGE_KEYS = {
  currentUser: 'currentUser',
  users: 'users',
  darkMode: 'dark-mode',
  userProfile: 'user-profile',
  habits: 'habits',
  schedule: 'schedule',
  goals: 'goals',
  meals: 'meals',
  expenses: 'expenses',
  weights: 'weights',
  gym: 'gym',
  notifications: 'notifications',
  reminderSettings: 'reminder-settings',
  floatingButtons: 'floating-buttons',
  proteinLog: 'protein-log',
  proteinFavorites: 'protein-favorites',
  notes: 'notes',
};

export const CATEGORIES = {
  schedule: [
    { value: 'routine', label: '🌅 Rutina', labelEn: '🌅 Routine' },
    { value: 'work', label: '💼 Trabajo', labelEn: '💼 Work' },
    { value: 'exercise', label: '💪 Ejercicio', labelEn: '💪 Exercise' },
    { value: 'study', label: '📚 Estudio', labelEn: '📚 Study' },
    { value: 'personal', label: '✨ Personal', labelEn: '✨ Personal' },
    { value: 'social', label: '👥 Social', labelEn: '👥 Social' },
    { value: 'health', label: '🏥 Salud', labelEn: '🏥 Health' },
    { value: 'rest', label: '😴 Descanso', labelEn: '😴 Rest' },
  ],
  expenses: [
    { value: 'food', label: '🍔 Comida', labelEn: '🍔 Food' },
    { value: 'transport', label: '🚗 Transporte', labelEn: '🚗 Transport' },
    { value: 'entertainment', label: '🎬 Entretenimiento', labelEn: '🎬 Entertainment' },
    { value: 'shopping', label: '🛍️ Compras', labelEn: '🛍️ Shopping' },
    { value: 'health', label: '💊 Salud', labelEn: '💊 Health' },
    { value: 'bills', label: '📄 Cuentas', labelEn: '📄 Bills' },
    { value: 'other', label: '📦 Otro', labelEn: '📦 Other' },
  ],
};

export const THEMES = {
  // Legacy themes for backwards compatibility
  female: {
    primary: '#ec4899',
    secondary: '#8b5cf6',
    accent: '#a855f7',
    glowColor1: 'rgba(236, 72, 153, 0.4)',
    glowColor2: 'rgba(139, 92, 246, 0.3)',
    ringColor: 'rgba(168, 85, 247, 0.4)',
    bgLight: '#fdf2f8',
    bgLight2: '#f3e8ff',
  },
  male: {
    primary: '#3b82f6',
    secondary: '#06b6d4',
    accent: '#6366f1',
    glowColor1: 'rgba(59, 130, 246, 0.4)',
    glowColor2: 'rgba(6, 182, 212, 0.3)',
    ringColor: 'rgba(99, 102, 241, 0.4)',
    bgLight: '#eff6ff',
    bgLight2: '#e0f2fe',
  },
  // New color themes
  rosa: {
    id: 'rosa',
    name: 'Rosa & Púrpura',
    emoji: '🌸',
    primary: '#ec4899',
    secondary: '#8b5cf6',
    accent: '#a855f7',
    glowColor1: 'rgba(236, 72, 153, 0.4)',
    glowColor2: 'rgba(139, 92, 246, 0.3)',
    ringColor: 'rgba(168, 85, 247, 0.4)',
    bgLight: '#fdf2f8',
    bgLight2: '#f3e8ff',
    gradient: 'from-pink-500 to-purple-600',
  },
  azul: {
    id: 'azul',
    name: 'Azul & Cyan',
    emoji: '🌊',
    primary: '#3b82f6',
    secondary: '#06b6d4',
    accent: '#6366f1',
    glowColor1: 'rgba(59, 130, 246, 0.4)',
    glowColor2: 'rgba(6, 182, 212, 0.3)',
    ringColor: 'rgba(99, 102, 241, 0.4)',
    bgLight: '#eff6ff',
    bgLight2: '#e0f2fe',
    gradient: 'from-blue-500 to-cyan-600',
  },
  verde: {
    id: 'verde',
    name: 'Verde & Esmeralda',
    emoji: '🌿',
    primary: '#10b981',
    secondary: '#059669',
    accent: '#34d399',
    glowColor1: 'rgba(16, 185, 129, 0.4)',
    glowColor2: 'rgba(5, 150, 105, 0.3)',
    ringColor: 'rgba(52, 211, 153, 0.4)',
    bgLight: '#ecfdf5',
    bgLight2: '#d1fae5',
    gradient: 'from-emerald-500 to-teal-600',
  },
  naranja: {
    id: 'naranja',
    name: 'Naranja & Dorado',
    emoji: '🔥',
    primary: '#f97316',
    secondary: '#eab308',
    accent: '#fb923c',
    glowColor1: 'rgba(249, 115, 22, 0.4)',
    glowColor2: 'rgba(234, 179, 8, 0.3)',
    ringColor: 'rgba(251, 146, 60, 0.4)',
    bgLight: '#fff7ed',
    bgLight2: '#fef3c7',
    gradient: 'from-orange-500 to-amber-500',
  },
  coral: {
    id: 'coral',
    name: 'Coral & Rojo',
    emoji: '❤️',
    primary: '#f43f5e',
    secondary: '#e11d48',
    accent: '#fb7185',
    glowColor1: 'rgba(244, 63, 94, 0.4)',
    glowColor2: 'rgba(225, 29, 72, 0.3)',
    ringColor: 'rgba(251, 113, 133, 0.4)',
    bgLight: '#fff1f2',
    bgLight2: '#ffe4e6',
    gradient: 'from-rose-500 to-red-600',
  },
  morado: {
    id: 'morado',
    name: 'Morado & Índigo',
    emoji: '💜',
    primary: '#8b5cf6',
    secondary: '#6366f1',
    accent: '#a78bfa',
    glowColor1: 'rgba(139, 92, 246, 0.4)',
    glowColor2: 'rgba(99, 102, 241, 0.3)',
    ringColor: 'rgba(167, 139, 250, 0.4)',
    bgLight: '#f5f3ff',
    bgLight2: '#ede9fe',
    gradient: 'from-violet-500 to-indigo-600',
  },
};

export const GOAL_TYPES = {
  fitness: { emoji: '💪', label: 'Fitness', labelEs: 'Mejorar condición física' },
  productivity: { emoji: '📈', label: 'Productivity', labelEs: 'Ser más productivo' },
  learning: { emoji: '📚', label: 'Learning', labelEs: 'Aprender algo nuevo' },
  health: { emoji: '🥗', label: 'Health', labelEs: 'Mejorar salud' },
  business: { emoji: '💼', label: 'Business', labelEs: 'Hacer crecer negocio' },
  competition: { emoji: '👑', label: 'Competition', labelEs: 'Prepararme para competencia' },
  personal: { emoji: '✨', label: 'Personal', labelEs: 'Desarrollo personal' },
};

export const DAYS_OF_WEEK = {
  es: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
  en: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
};

export const MONTHS = {
  es: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
  en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
};
