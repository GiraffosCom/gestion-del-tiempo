/**
 * Servicio de autenticación
 * Maneja login, registro, sesión de usuario
 * @module services/auth
 */

import { storage } from './storage.js';
import { STORAGE_KEYS } from '../config.js';

class AuthService {
  constructor() {
    this.currentUser = null;
    this.init();
  }

  /**
   * Inicializa el servicio, cargando usuario de sesión
   */
  init() {
    const userData = storage.getGlobal(STORAGE_KEYS.currentUser);
    if (userData) {
      this.currentUser = userData;
      storage.setUser(userData.email);
    }
  }

  /**
   * Verifica si hay un usuario logueado
   * @returns {boolean}
   */
  isAuthenticated() {
    return this.currentUser !== null && !this.currentUser.isDemo;
  }

  /**
   * Verifica si el usuario actual es demo
   * @returns {boolean}
   */
  isDemo() {
    return this.currentUser?.isDemo === true;
  }

  /**
   * Obtiene el usuario actual
   * @returns {Object|null}
   */
  getCurrentUser() {
    return this.currentUser;
  }

  /**
   * Hashea una contraseña (básico - para producción usar bcrypt en backend)
   * @param {string} password - Contraseña en texto plano
   * @returns {Promise<string>} Hash de la contraseña
   */
  async hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Verifica una contraseña contra su hash
   * @param {string} password - Contraseña a verificar
   * @param {string} hash - Hash almacenado
   * @returns {Promise<boolean>}
   */
  async verifyPassword(password, hash) {
    const passwordHash = await this.hashPassword(password);
    return passwordHash === hash;
  }

  /**
   * Registra un nuevo usuario
   * @param {Object} userData - Datos del usuario
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async register({ name, email, password, goal, duration }) {
    const normalizedEmail = email.toLowerCase().trim();

    // Validaciones
    if (!name || !normalizedEmail || !password) {
      return { success: false, error: 'Todos los campos son requeridos' };
    }

    if (password.length < 6) {
      return { success: false, error: 'La contraseña debe tener al menos 6 caracteres' };
    }

    if (!this.isValidEmail(normalizedEmail)) {
      return { success: false, error: 'Email inválido' };
    }

    // Verificar si ya existe
    const users = storage.getGlobal(STORAGE_KEYS.users, {});
    if (users[normalizedEmail]) {
      return { success: false, error: 'Ya existe una cuenta con este email' };
    }

    // Crear usuario con contraseña hasheada
    const hashedPassword = await this.hashPassword(password);
    const startDate = new Date().toISOString().split('T')[0];

    users[normalizedEmail] = {
      name: name.trim(),
      password: hashedPassword,
      goal: goal || 'personal',
      duration: duration || 60,
      startDate,
      createdAt: new Date().toISOString(),
    };

    storage.setGlobal(STORAGE_KEYS.users, users);

    // Auto-login
    return this.login(normalizedEmail, password, true);
  }

  /**
   * Inicia sesión
   * @param {string} email - Email del usuario
   * @param {string} password - Contraseña
   * @param {boolean} isNewUser - Si es un registro nuevo
   * @returns {Promise<{success: boolean, error?: string, needsOnboarding?: boolean}>}
   */
  async login(email, password, isNewUser = false) {
    const normalizedEmail = email.toLowerCase().trim();
    const users = storage.getGlobal(STORAGE_KEYS.users, {});

    if (!users[normalizedEmail]) {
      return { success: false, error: 'No existe una cuenta con este email' };
    }

    const user = users[normalizedEmail];

    // Verificar contraseña (soporta hash y texto plano para migración)
    let isValidPassword = false;
    if (user.password.length === 64) {
      // Es un hash SHA-256
      isValidPassword = await this.verifyPassword(password, user.password);
    } else {
      // Contraseña legacy en texto plano - migrar
      isValidPassword = user.password === password;
      if (isValidPassword) {
        // Migrar a hash
        user.password = await this.hashPassword(password);
        storage.setGlobal(STORAGE_KEYS.users, users);
      }
    }

    if (!isValidPassword) {
      return { success: false, error: 'Contraseña incorrecta' };
    }

    // Crear sesión
    this.currentUser = {
      email: normalizedEmail,
      name: user.name,
      goal: user.goal,
      duration: user.duration,
      startDate: user.startDate,
      needsOnboarding: isNewUser,
    };

    storage.setGlobal(STORAGE_KEYS.currentUser, this.currentUser);
    storage.setUser(normalizedEmail);

    return {
      success: true,
      needsOnboarding: isNewUser,
    };
  }

  /**
   * Inicia sesión como usuario demo
   * @returns {{success: boolean}}
   */
  loginAsDemo() {
    this.currentUser = {
      email: 'demo@demo.com',
      name: 'Usuario Demo',
      goal: 'personal',
      duration: 60,
      startDate: new Date().toISOString().split('T')[0],
      isDemo: true,
    };

    storage.setGlobal(STORAGE_KEYS.currentUser, this.currentUser);
    storage.setUser('demo@demo.com');

    return { success: true };
  }

  /**
   * Cierra sesión
   */
  logout() {
    this.currentUser = null;
    storage.removeGlobal(STORAGE_KEYS.currentUser);
    storage.setUser(null);
  }

  /**
   * Actualiza datos del usuario actual
   * @param {Object} updates - Campos a actualizar
   */
  updateCurrentUser(updates) {
    if (!this.currentUser) return;

    this.currentUser = { ...this.currentUser, ...updates };
    storage.setGlobal(STORAGE_KEYS.currentUser, this.currentUser);

    // También actualizar en la lista de usuarios
    if (!this.isDemo()) {
      const users = storage.getGlobal(STORAGE_KEYS.users, {});
      if (users[this.currentUser.email]) {
        users[this.currentUser.email] = {
          ...users[this.currentUser.email],
          ...updates,
        };
        storage.setGlobal(STORAGE_KEYS.users, users);
      }
    }
  }

  /**
   * Marca el onboarding como completado
   */
  completeOnboarding() {
    this.updateCurrentUser({
      needsOnboarding: false,
      onboardingCompleted: true,
    });
  }

  /**
   * Valida formato de email
   * @param {string} email
   * @returns {boolean}
   */
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Verifica si el usuario necesita completar onboarding
   * @returns {boolean}
   */
  needsOnboarding() {
    return this.currentUser?.needsOnboarding === true &&
           !this.currentUser?.onboardingCompleted;
  }
}

// Exportar instancia singleton
export const auth = new AuthService();
export default auth;
