/**
 * Módulo de gestión de temas y modo oscuro
 * @module ui/theme
 */

import { storage } from '../services/storage.js';
import { THEMES, STORAGE_KEYS } from '../config.js';

class ThemeManager {
  constructor() {
    this.currentTheme = 'female';
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
    const gender = profile.gender || 'female';

    if (gender === 'male' || gender === 'Male' || gender === 'masculino' || gender === 'Masculino') {
      this.currentTheme = 'male';
    } else {
      this.currentTheme = 'female';
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

    if (this.currentTheme === 'male') {
      document.body.classList.add('theme-male');
    } else {
      document.body.classList.remove('theme-male');
    }

    // Aplicar variables CSS
    root.style.setProperty('--theme-primary', theme.primary);
    root.style.setProperty('--theme-secondary', theme.secondary);
    root.style.setProperty('--theme-accent', theme.accent);
    root.style.setProperty('--theme-glow-1', theme.glowColor1);
    root.style.setProperty('--theme-glow-2', theme.glowColor2);
    root.style.setProperty('--theme-ring', theme.ringColor);
    root.style.setProperty('--theme-bg-light', theme.bgLight);
    root.style.setProperty('--theme-bg-light-2', theme.bgLight2);
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
    if (this.currentTheme === 'male') {
      return {
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
      };
    }

    return {
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
    };
  }
}

// Exportar instancia singleton
export const themeManager = new ThemeManager();
export default themeManager;
