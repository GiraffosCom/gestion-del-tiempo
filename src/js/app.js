/**
 * Aplicación principal - Gestión del Tiempo
 * Punto de entrada que inicializa y coordina todos los módulos
 * @module app
 */

import { APP_CONFIG } from './config.js';
import { storage, auth, registerServiceWorker, onConnectivityChange } from './services/index.js';
import { themeManager, modalManager } from './ui/index.js';
import { habitsManager, scheduleManager, goalsManager, expensesManager } from './modules/index.js';
import { getDayName, addDays } from './utils/index.js';

class App {
  constructor() {
    this.currentDate = new Date();
    this.currentTab = 'home';
    this.initialized = false;
    this.isOnline = navigator.onLine;
    this.swRegistration = null;
  }

  /**
   * Inicializa la aplicación
   */
  async init() {
    console.log(`[${APP_CONFIG.name}] Inicializando v${APP_CONFIG.version}...`);

    // Registrar Service Worker para funcionalidad offline
    this.swRegistration = await registerServiceWorker();

    // Monitorear conectividad
    onConnectivityChange(online => {
      this.isOnline = online;
      this.handleConnectivityChange(online);
    });

    // Verificar autenticación
    if (!auth.getCurrentUser()) {
      this.redirectToLogin();
      return;
    }

    // Verificar onboarding
    if (auth.needsOnboarding()) {
      window.location.href = 'onboarding.html';
      return;
    }

    // Inicializar tema
    themeManager.init();

    // Configurar callbacks de actualización
    this.setupUpdateCallbacks();

    // Renderizar UI inicial
    this.render();

    this.initialized = true;
    console.log(`[${APP_CONFIG.name}] Inicialización completa`);
  }

  /**
   * Maneja cambios en la conectividad
   * @param {boolean} online
   */
  handleConnectivityChange(online) {
    window.dispatchEvent(new CustomEvent('app:connectivity', {
      detail: { online },
    }));

    if (online) {
      console.log('[App] Conexión restaurada');
    } else {
      console.log('[App] Modo offline activado');
    }
  }

  /**
   * Configura callbacks para actualizar UI cuando cambian los datos
   */
  setupUpdateCallbacks() {
    const updateUI = () => this.render();

    habitsManager.setOnUpdate(updateUI);
    scheduleManager.setOnUpdate(updateUI);
    goalsManager.setOnUpdate(updateUI);
    expensesManager.setOnUpdate(updateUI);
  }

  /**
   * Redirige a la página de login
   */
  redirectToLogin() {
    window.location.href = 'login.html';
  }

  /**
   * Cierra sesión
   */
  logout() {
    auth.logout();
    this.redirectToLogin();
  }

  /**
   * Cambia la fecha actual
   * @param {number} days - Días a añadir/restar
   */
  navigateDay(days) {
    this.currentDate = addDays(this.currentDate, days);
    this.render();
  }

  /**
   * Va a la fecha actual
   */
  goToToday() {
    this.currentDate = new Date();
    this.render();
  }

  /**
   * Establece una fecha específica
   * @param {Date} date
   */
  setDate(date) {
    this.currentDate = date;
    this.render();
  }

  /**
   * Cambia la pestaña activa
   * @param {string} tab
   */
  setTab(tab) {
    this.currentTab = tab;
    this.render();
  }

  /**
   * Alterna modo oscuro
   */
  toggleDarkMode() {
    themeManager.toggleDarkMode();
    this.render();
  }

  /**
   * Obtiene el progreso diario combinado
   * @returns {Object}
   */
  getDailyProgress() {
    const habitsProgress = habitsManager.getProgress(this.currentDate);
    const scheduleProgress = scheduleManager.getProgress(this.currentDate);

    const totalCompleted = habitsProgress.completed + scheduleProgress.completed;
    const totalItems = habitsProgress.total + scheduleProgress.total;
    const percentage = totalItems > 0 ? Math.round((totalCompleted / totalItems) * 100) : 0;

    return {
      habits: habitsProgress,
      schedule: scheduleProgress,
      total: {
        completed: totalCompleted,
        total: totalItems,
        percentage,
      },
    };
  }

  /**
   * Obtiene el progreso semanal
   * @returns {Object}
   */
  getWeeklyProgress() {
    const weekProgress = [];
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() + 1); // Lunes

    for (let i = 0; i < 7; i++) {
      const date = addDays(startOfWeek, i);
      const habits = habitsManager.getProgress(date);
      const schedule = scheduleManager.getProgress(date);

      weekProgress.push({
        date,
        dayName: getDayName(date.getDay()),
        habits,
        schedule,
        total: {
          completed: habits.completed + schedule.completed,
          total: habits.total + schedule.total,
        },
      });
    }

    const totalCompleted = weekProgress.reduce((sum, day) => sum + day.total.completed, 0);
    const totalItems = weekProgress.reduce((sum, day) => sum + day.total.total, 0);

    return {
      days: weekProgress,
      total: {
        completed: totalCompleted,
        total: totalItems,
        percentage: totalItems > 0 ? Math.round((totalCompleted / totalItems) * 100) : 0,
      },
    };
  }

  /**
   * Renderiza la aplicación
   * Este método será llamado por el HTML para actualizar la UI
   */
  render() {
    // Este método será implementado en el HTML o en un módulo de renderizado
    // Por ahora, dispara un evento para que el HTML pueda escucharlo
    window.dispatchEvent(new CustomEvent('app:render', {
      detail: {
        currentDate: this.currentDate,
        currentTab: this.currentTab,
        user: auth.getCurrentUser(),
        dailyProgress: this.getDailyProgress(),
      },
    }));
  }

  /**
   * Exporta todos los datos del usuario
   * @returns {Object}
   */
  exportAllData() {
    return {
      version: APP_CONFIG.version,
      exportedAt: new Date().toISOString(),
      user: auth.getCurrentUser(),
      data: storage.exportData(),
    };
  }

  /**
   * Importa datos
   * @param {Object} data
   */
  importAllData(data) {
    if (!data || !data.data) {
      throw new Error('Formato de datos inválido');
    }
    storage.importData(data.data);
    this.render();
  }
}

// Crear instancia global
const app = new App();

// Exponer API pública en window para uso desde HTML
window.GestionApp = {
  // Instancia principal
  app,

  // Servicios
  auth,
  storage,

  // UI
  themeManager,
  modalManager,

  // Módulos
  habitsManager,
  scheduleManager,
  goalsManager,
  expensesManager,

  // Métodos de acceso rápido
  init: () => app.init(),
  render: () => app.render(),
  logout: () => app.logout(),
  setTab: (tab) => app.setTab(tab),
  navigateDay: (days) => app.navigateDay(days),
  goToToday: () => app.goToToday(),
  setDate: (date) => app.setDate(date),
  toggleDarkMode: () => app.toggleDarkMode(),
  getDailyProgress: () => app.getDailyProgress(),
  getWeeklyProgress: () => app.getWeeklyProgress(),
  exportData: () => app.exportAllData(),
  importData: (data) => app.importAllData(data),

  // Estado
  get currentDate() { return app.currentDate; },
  get currentTab() { return app.currentTab; },
  get currentUser() { return auth.getCurrentUser(); },
  get isOnline() { return app.isOnline; },
  get swRegistration() { return app.swRegistration; },
};

// Auto-inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => app.init());
} else {
  app.init();
}

export default app;
