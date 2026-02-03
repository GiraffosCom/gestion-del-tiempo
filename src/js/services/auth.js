/**
 * Servicio de autenticación
 * Maneja login, registro, sesión de usuario
 * Usa Supabase como backend principal con localStorage como fallback
 * @module services/auth
 */

import { storage } from './storage.js';
import { STORAGE_KEYS } from '../config.js';

class AuthService {
  constructor() {
    this.currentUser = null;
    this.supabaseAPI = null;
    this.isOnline = navigator.onLine;
    this.init();

    // Listen for online/offline events
    window.addEventListener('online', () => { this.isOnline = true; });
    window.addEventListener('offline', () => { this.isOnline = false; });
  }

  /**
   * Inicializa el servicio, cargando usuario de sesión
   */
  init() {
    // Get supabaseAPI from window (loaded via script tag)
    if (typeof window !== 'undefined' && window.supabaseAPI) {
      this.supabaseAPI = window.supabaseAPI;
    }

    const userData = storage.getGlobal(STORAGE_KEYS.currentUser);
    if (userData) {
      this.currentUser = userData;
      storage.setUser(userData.email);
    }
  }

  /**
   * Check if Supabase is available
   */
  async isSupabaseAvailable() {
    if (!this.supabaseAPI || !this.isOnline) return false;
    try {
      return await this.supabaseAPI.testConnection();
    } catch {
      return false;
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

    const hashedPassword = await this.hashPassword(password);
    const startDate = new Date().toISOString().split('T')[0];
    const createdAt = new Date().toISOString();

    // Try Supabase first
    const supabaseAvailable = await this.isSupabaseAvailable();

    if (supabaseAvailable) {
      try {
        await this.supabaseAPI.registerUser({
          email: normalizedEmail,
          password,
          name: name.trim(),
          goal: goal || 'personal',
          duration: duration || 60
        });
        console.log('User registered in Supabase');
      } catch (e) {
        console.error('Supabase registration error:', e);
        return { success: false, error: e.message };
      }
    }

    // Also save to localStorage as cache/fallback
    const users = storage.getGlobal(STORAGE_KEYS.users, {});

    // Check if exists locally (only block if Supabase was not available)
    if (!supabaseAvailable && users[normalizedEmail]) {
      return { success: false, error: 'Ya existe una cuenta con este email' };
    }

    users[normalizedEmail] = {
      name: name.trim(),
      password: hashedPassword,
      goal: goal || 'personal',
      duration: duration || 60,
      startDate,
      createdAt,
      syncedWithSupabase: supabaseAvailable
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
    let user = null;
    let fromSupabase = false;

    // Try Supabase first
    const supabaseAvailable = await this.isSupabaseAvailable();

    if (supabaseAvailable) {
      try {
        const supabaseUser = await this.supabaseAPI.loginUser(normalizedEmail, password);
        user = {
          name: supabaseUser.full_name,
          goal: supabaseUser.goal,
          duration: supabaseUser.duration,
          startDate: supabaseUser.start_date,
          createdAt: supabaseUser.created_at,
          supabaseId: supabaseUser.id
        };
        fromSupabase = true;
        console.log('User logged in via Supabase');

        // Update local cache
        const users = storage.getGlobal(STORAGE_KEYS.users, {});
        users[normalizedEmail] = {
          ...user,
          password: await this.hashPassword(password),
          syncedWithSupabase: true
        };
        storage.setGlobal(STORAGE_KEYS.users, users);
      } catch (e) {
        console.log('Supabase login failed, trying localStorage:', e.message);
      }
    }

    // Fallback to localStorage
    if (!user) {
      const users = storage.getGlobal(STORAGE_KEYS.users, {});

      if (!users[normalizedEmail]) {
        return { success: false, error: 'No existe una cuenta con este email' };
      }

      const localUser = users[normalizedEmail];

      // Verificar contraseña
      let isValidPassword = false;
      if (localUser.password && localUser.password.length === 64) {
        isValidPassword = await this.verifyPassword(password, localUser.password);
      } else if (localUser.password) {
        // Contraseña legacy en texto plano - migrar
        isValidPassword = localUser.password === password;
        if (isValidPassword) {
          localUser.password = await this.hashPassword(password);
          storage.setGlobal(STORAGE_KEYS.users, users);
        }
      }

      if (!isValidPassword) {
        return { success: false, error: 'Contraseña incorrecta' };
      }

      user = localUser;
    }

    // Crear sesión
    this.currentUser = {
      email: normalizedEmail,
      name: user.name,
      goal: user.goal,
      duration: user.duration,
      startDate: user.startDate,
      needsOnboarding: isNewUser,
      supabaseId: user.supabaseId || null,
      fromSupabase
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
  async updateCurrentUser(updates) {
    if (!this.currentUser) return;

    this.currentUser = { ...this.currentUser, ...updates };
    storage.setGlobal(STORAGE_KEYS.currentUser, this.currentUser);

    // También actualizar en la lista de usuarios locales
    if (!this.isDemo()) {
      const users = storage.getGlobal(STORAGE_KEYS.users, {});
      if (users[this.currentUser.email]) {
        users[this.currentUser.email] = {
          ...users[this.currentUser.email],
          ...updates,
        };
        storage.setGlobal(STORAGE_KEYS.users, users);
      }

      // Also update in Supabase if available
      if (this.currentUser.supabaseId && await this.isSupabaseAvailable()) {
        try {
          const supabaseUpdates = {};
          if (updates.name) supabaseUpdates.full_name = updates.name;
          if (updates.goal) supabaseUpdates.goal = updates.goal;
          if (updates.duration) supabaseUpdates.duration = updates.duration;

          if (Object.keys(supabaseUpdates).length > 0) {
            await this.supabaseAPI.updateCustomer(this.currentUser.supabaseId, supabaseUpdates);
          }
        } catch (e) {
          console.error('Error updating user in Supabase:', e);
        }
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

  /**
   * Sync pending local users to Supabase
   * Call this when coming online
   */
  async syncPendingUsers() {
    if (!await this.isSupabaseAvailable()) return;

    const users = storage.getGlobal(STORAGE_KEYS.users, {});

    for (const email of Object.keys(users)) {
      const user = users[email];
      if (!user.syncedWithSupabase) {
        try {
          // Check if user exists in Supabase
          const existing = await this.supabaseAPI.getUserByEmail(email);
          if (!existing) {
            // Create in Supabase (need original password, which we don't have)
            // Mark as synced anyway to avoid repeated attempts
            console.log(`User ${email} needs manual sync (password not available)`);
          }
          users[email].syncedWithSupabase = true;
        } catch (e) {
          console.error(`Error syncing user ${email}:`, e);
        }
      }
    }

    storage.setGlobal(STORAGE_KEYS.users, users);
  }
}

// Exportar instancia singleton
export const auth = new AuthService();
export default auth;
