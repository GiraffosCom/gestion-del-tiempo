/**
 * Módulo de gestión de temas y modo oscuro
 * @module ui/theme
 */

import { storage } from '../services/storage.js';
import { THEMES, STORAGE_KEYS } from '../config.js';

class ThemeManager {
  constructor() {
    this.currentTheme = 'rosa'; // Default theme
    this.isDark = false;
  }

  /**
   * Inicializa el tema basado en preferencias guardadas
   */
  init() {
    this.loadTheme();
    this.loadDarkMode();
    this.applyTheme();
    this.applyDarkMode();
  }

  /**
   * Carga el tema desde el perfil del usuario
   */
  loadTheme() {
    const profile = storage.get(STORAGE_KEYS.userProfile, {});

    // First check for new theme color preference
    if (profile.themeColor && THEMES[profile.themeColor]) {
      this.currentTheme = profile.themeColor;
      return;
    }

    // Fallback to legacy gender-based theme for backwards compatibility
    const gender = profile.gender || 'female';
    if (gender === 'male' || gender === 'Male' || gender === 'masculino' || gender === 'Masculino') {
      this.currentTheme = 'azul'; // Map male to azul
    } else {
      this.currentTheme = 'rosa'; // Map female to rosa
    }
  }

  /**
   * Carga el estado del modo oscuro
   */
  loadDarkMode() {
    this.isDark = storage.getRaw('dark-mode') === 'true';
  }

  /**
   * Aplica el tema actual al documento
   */
  applyTheme() {
    const root = document.documentElement;
    const theme = THEMES[this.currentTheme];

    // Remove all theme classes
    document.body.classList.remove('theme-male', 'theme-rosa', 'theme-azul', 'theme-verde', 'theme-naranja', 'theme-coral', 'theme-morado');

    // Add current theme class
    if (this.currentTheme === 'male' || this.currentTheme === 'azul') {
      document.body.classList.add('theme-male'); // Keep for backwards compatibility
    }
    document.body.classList.add(`theme-${this.currentTheme}`);

    // Aplicar variables CSS
    root.style.setProperty('--theme-primary', theme.primary);
    root.style.setProperty('--theme-secondary', theme.secondary);
    root.style.setProperty('--theme-accent', theme.accent);
    root.style.setProperty('--theme-glow-1', theme.glowColor1);
    root.style.setProperty('--theme-glow-2', theme.glowColor2);
    root.style.setProperty('--theme-ring', theme.ringColor);
    root.style.setProperty('--theme-bg-light', theme.bgLight);
    root.style.setProperty('--theme-bg-light-2', theme.bgLight2);
    if (theme.gradient) {
      root.style.setProperty('--theme-gradient', theme.gradient);
    }
  }

  /**
   * Aplica el modo oscuro
   */
  applyDarkMode() {
    if (this.isDark) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  }

  /**
   * Alterna el modo oscuro
   * @returns {boolean} Nuevo estado del modo oscuro
   */
  toggleDarkMode() {
    this.isDark = !this.isDark;
    storage.set('dark-mode', this.isDark.toString());
    this.applyDarkMode();
    return this.isDark;
  }

  /**
   * Establece el tema
   * @param {'female'|'male'} theme
   */
  setTheme(theme) {
    this.currentTheme = theme;
    this.applyTheme();
  }

  /**
   * Obtiene el tema actual
   * @returns {string}
   */
  getTheme() {
    return this.currentTheme;
  }

  /**
   * Verifica si el modo oscuro está activo
   * @returns {boolean}
   */
  isDarkMode() {
    return this.isDark;
  }

  /**
   * Obtiene los colores del tema actual
   * @returns {Object}
   */
  getColors() {
    return THEMES[this.currentTheme];
  }

  /**
   * Obtiene clases de Tailwind según el tema
   * @returns {Object}
   */
  getTailwindClasses() {
    const themeClasses = {
      rosa: {
        primary: 'rose',
        secondary: 'purple',
        gradientFrom: 'from-rose-500',
        gradientTo: 'to-purple-600',
        gradientVia: 'via-pink-500',
        accent: 'purple',
        accentLight: 'purple-100',
        accentDark: 'purple-600',
        headerGradient: 'from-rose-500 to-purple-600',
        cardGradient: 'from-rose-500 to-purple-600',
        buttonGradient: 'from-rose-500 to-purple-500',
        textGradient: 'from-rose-600 to-purple-600',
        photoGlow: 'from-pink-500 to-purple-500',
        border: 'purple-200',
        ring: 'ring-purple-400',
        focus: 'focus:ring-purple-400',
      },
      azul: {
        primary: 'blue',
        secondary: 'cyan',
        gradientFrom: 'from-blue-500',
        gradientTo: 'to-cyan-600',
        gradientVia: 'via-indigo-500',
        accent: 'blue',
        accentLight: 'blue-100',
        accentDark: 'blue-600',
        headerGradient: 'from-blue-500 to-cyan-600',
        cardGradient: 'from-blue-500 to-indigo-600',
        buttonGradient: 'from-blue-500 to-cyan-500',
        textGradient: 'from-blue-600 to-cyan-600',
        photoGlow: 'from-blue-500 to-cyan-500',
        border: 'blue-200',
        ring: 'ring-blue-400',
        focus: 'focus:ring-blue-400',
      },
      verde: {
        primary: 'emerald',
        secondary: 'teal',
        gradientFrom: 'from-emerald-500',
        gradientTo: 'to-teal-600',
        gradientVia: 'via-green-500',
        accent: 'emerald',
        accentLight: 'emerald-100',
        accentDark: 'emerald-600',
        headerGradient: 'from-emerald-500 to-teal-600',
        cardGradient: 'from-emerald-500 to-teal-600',
        buttonGradient: 'from-emerald-500 to-teal-500',
        textGradient: 'from-emerald-600 to-teal-600',
        photoGlow: 'from-emerald-500 to-teal-500',
        border: 'emerald-200',
        ring: 'ring-emerald-400',
        focus: 'focus:ring-emerald-400',
      },
      naranja: {
        primary: 'orange',
        secondary: 'amber',
        gradientFrom: 'from-orange-500',
        gradientTo: 'to-amber-500',
        gradientVia: 'via-yellow-500',
        accent: 'orange',
        accentLight: 'orange-100',
        accentDark: 'orange-600',
        headerGradient: 'from-orange-500 to-amber-500',
        cardGradient: 'from-orange-500 to-amber-500',
        buttonGradient: 'from-orange-500 to-amber-500',
        textGradient: 'from-orange-600 to-amber-600',
        photoGlow: 'from-orange-500 to-amber-500',
        border: 'orange-200',
        ring: 'ring-orange-400',
        focus: 'focus:ring-orange-400',
      },
      coral: {
        primary: 'rose',
        secondary: 'red',
        gradientFrom: 'from-rose-500',
        gradientTo: 'to-red-600',
        gradientVia: 'via-pink-500',
        accent: 'rose',
        accentLight: 'rose-100',
        accentDark: 'rose-600',
        headerGradient: 'from-rose-500 to-red-600',
        cardGradient: 'from-rose-500 to-red-600',
        buttonGradient: 'from-rose-500 to-red-500',
        textGradient: 'from-rose-600 to-red-600',
        photoGlow: 'from-rose-500 to-red-500',
        border: 'rose-200',
        ring: 'ring-rose-400',
        focus: 'focus:ring-rose-400',
      },
      morado: {
        primary: 'violet',
        secondary: 'indigo',
        gradientFrom: 'from-violet-500',
        gradientTo: 'to-indigo-600',
        gradientVia: 'via-purple-500',
        accent: 'violet',
        accentLight: 'violet-100',
        accentDark: 'violet-600',
        headerGradient: 'from-violet-500 to-indigo-600',
        cardGradient: 'from-violet-500 to-indigo-600',
        buttonGradient: 'from-violet-500 to-indigo-500',
        textGradient: 'from-violet-600 to-indigo-600',
        photoGlow: 'from-violet-500 to-indigo-500',
        border: 'violet-200',
        ring: 'ring-violet-400',
        focus: 'focus:ring-violet-400',
      },
    };

    // Map legacy themes to new ones
    if (this.currentTheme === 'female') return themeClasses.rosa;
    if (this.currentTheme === 'male') return themeClasses.azul;

    return themeClasses[this.currentTheme] || themeClasses.rosa;
  }
}

// Exportar instancia singleton
export const themeManager = new ThemeManager();
export default themeManager;
