/**
 * Módulo de gestión de modales
 * @module ui/modals
 */

class ModalManager {
  constructor() {
    this.openModals = new Set();
    this.callbacks = new Map();
    this.setupGlobalListeners();
  }

  /**
   * Configura listeners globales
   */
  setupGlobalListeners() {
    // Cerrar modal con Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.openModals.size > 0) {
        const lastModal = Array.from(this.openModals).pop();
        this.close(lastModal);
      }
    });
  }

  /**
   * Abre un modal
   * @param {string} modalId - ID del modal
   * @param {Object} options - Opciones del modal
   */
  open(modalId, options = {}) {
    const modal = document.getElementById(modalId);
    if (!modal) {
      console.error(`Modal not found: ${modalId}`);
      return;
    }

    modal.classList.remove('hidden');
    this.openModals.add(modalId);

    // Guardar callbacks
    if (options.onClose) {
      this.callbacks.set(`${modalId}-close`, options.onClose);
    }
    if (options.onConfirm) {
      this.callbacks.set(`${modalId}-confirm`, options.onConfirm);
    }

    // Focus trap
    if (options.focusFirst !== false) {
      const firstInput = modal.querySelector('input, select, textarea, button');
      if (firstInput) {
        setTimeout(() => firstInput.focus(), 100);
      }
    }

    // Prevenir scroll del body
    document.body.style.overflow = 'hidden';

    return modal;
  }

  /**
   * Cierra un modal
   * @param {string} modalId - ID del modal
   */
  close(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;

    modal.classList.add('hidden');
    this.openModals.delete(modalId);

    // Ejecutar callback de cierre
    const closeCallback = this.callbacks.get(`${modalId}-close`);
    if (closeCallback) {
      closeCallback();
      this.callbacks.delete(`${modalId}-close`);
    }

    // Limpiar callback de confirmación
    this.callbacks.delete(`${modalId}-confirm`);

    // Restaurar scroll del body si no hay más modales
    if (this.openModals.size === 0) {
      document.body.style.overflow = '';
    }
  }

  /**
   * Ejecuta la confirmación de un modal
   * @param {string} modalId - ID del modal
   * @param {*} data - Datos a pasar al callback
   */
  confirm(modalId, data) {
    const confirmCallback = this.callbacks.get(`${modalId}-confirm`);
    if (confirmCallback) {
      confirmCallback(data);
    }
    this.close(modalId);
  }

  /**
   * Cierra todos los modales abiertos
   */
  closeAll() {
    this.openModals.forEach(modalId => this.close(modalId));
  }

  /**
   * Verifica si un modal está abierto
   * @param {string} modalId - ID del modal
   * @returns {boolean}
   */
  isOpen(modalId) {
    return this.openModals.has(modalId);
  }

  /**
   * Verifica si hay algún modal abierto
   * @returns {boolean}
   */
  hasOpenModals() {
    return this.openModals.size > 0;
  }

  /**
   * Crea un elemento DOM de forma segura
   * @param {string} tag - Tag del elemento
   * @param {Object} attrs - Atributos
   * @param {string|Node[]} content - Contenido (texto o hijos)
   * @returns {HTMLElement}
   */
  createElement(tag, attrs = {}, content = null) {
    const el = document.createElement(tag);

    Object.entries(attrs).forEach(([key, value]) => {
      if (key === 'className') {
        el.className = value;
      } else if (key.startsWith('data')) {
        el.setAttribute(key.replace(/([A-Z])/g, '-$1').toLowerCase(), value);
      } else if (key.startsWith('on') && typeof value === 'function') {
        el.addEventListener(key.slice(2).toLowerCase(), value);
      } else {
        el.setAttribute(key, value);
      }
    });

    if (content !== null) {
      if (typeof content === 'string') {
        el.textContent = content;
      } else if (Array.isArray(content)) {
        content.forEach(child => {
          if (child) el.appendChild(child);
        });
      } else if (content instanceof Node) {
        el.appendChild(content);
      }
    }

    return el;
  }

  /**
   * Muestra un modal de confirmación
   * @param {Object} options - Opciones del modal
   * @returns {Promise<boolean>}
   */
  showConfirm({ title, message, confirmText = 'Confirmar', cancelText = 'Cancelar', type = 'default' }) {
    return new Promise((resolve) => {
      let modal = document.getElementById('dynamicConfirmModal');
      if (!modal) {
        modal = this.createConfirmModal();
        document.body.appendChild(modal);
      }

      const titleEl = modal.querySelector('[data-modal-title]');
      const messageEl = modal.querySelector('[data-modal-message]');
      const confirmBtn = modal.querySelector('[data-modal-confirm]');
      const cancelBtn = modal.querySelector('[data-modal-cancel]');

      if (titleEl) titleEl.textContent = title;
      if (messageEl) messageEl.textContent = message;
      if (confirmBtn) confirmBtn.textContent = confirmText;
      if (cancelBtn) cancelBtn.textContent = cancelText;

      // Estilo según tipo
      if (confirmBtn) {
        confirmBtn.className = 'flex-1 px-4 py-2 text-white rounded-xl transition font-medium';
        if (type === 'danger') {
          confirmBtn.classList.add('bg-red-500', 'hover:bg-red-600');
        } else {
          confirmBtn.classList.add('bg-purple-500', 'hover:bg-purple-600');
        }
      }

      const handleConfirm = () => {
        this.close('dynamicConfirmModal');
        resolve(true);
      };

      const handleCancel = () => {
        this.close('dynamicConfirmModal');
        resolve(false);
      };

      confirmBtn.onclick = handleConfirm;
      cancelBtn.onclick = handleCancel;

      this.open('dynamicConfirmModal');
    });
  }

  /**
   * Muestra un modal de alerta
   * @param {Object} options - Opciones del modal
   */
  showAlert({ title, message, buttonText = 'Aceptar', type = 'info' }) {
    return new Promise((resolve) => {
      let modal = document.getElementById('dynamicAlertModal');
      if (!modal) {
        modal = this.createAlertModal();
        document.body.appendChild(modal);
      }

      const titleEl = modal.querySelector('[data-modal-title]');
      const messageEl = modal.querySelector('[data-modal-message]');
      const acceptBtn = modal.querySelector('[data-modal-accept]');
      const iconEl = modal.querySelector('[data-modal-icon]');

      if (titleEl) titleEl.textContent = title;
      if (messageEl) messageEl.textContent = message;
      if (acceptBtn) acceptBtn.textContent = buttonText;

      const icons = {
        info: 'ℹ️',
        success: '✅',
        warning: '⚠️',
        error: '❌',
      };
      if (iconEl) iconEl.textContent = icons[type] || icons.info;

      acceptBtn.onclick = () => {
        this.close('dynamicAlertModal');
        resolve();
      };

      this.open('dynamicAlertModal');
    });
  }

  /**
   * Crea el modal de confirmación dinámico usando métodos DOM seguros
   * @returns {HTMLElement}
   */
  createConfirmModal() {
    const modal = this.createElement('div', {
      id: 'dynamicConfirmModal',
      className: 'fixed inset-0 modal-backdrop z-[100] hidden flex items-center justify-center p-4'
    });

    const container = this.createElement('div', {
      className: 'bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 transform transition-all'
    });

    const textCenter = this.createElement('div', { className: 'text-center' });

    const titleEl = this.createElement('h3', {
      className: 'text-xl font-bold text-gray-800 mb-2',
      'data-modal-title': ''
    });

    const messageEl = this.createElement('p', {
      className: 'text-gray-600 mb-6',
      'data-modal-message': ''
    });

    textCenter.appendChild(titleEl);
    textCenter.appendChild(messageEl);

    const buttonContainer = this.createElement('div', { className: 'flex gap-3' });

    const cancelBtn = this.createElement('button', {
      className: 'flex-1 px-4 py-2 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition',
      'data-modal-cancel': ''
    }, 'Cancelar');

    const confirmBtn = this.createElement('button', {
      className: 'flex-1 px-4 py-2 text-white rounded-xl transition font-medium bg-purple-500 hover:bg-purple-600',
      'data-modal-confirm': ''
    }, 'Confirmar');

    buttonContainer.appendChild(cancelBtn);
    buttonContainer.appendChild(confirmBtn);

    container.appendChild(textCenter);
    container.appendChild(buttonContainer);
    modal.appendChild(container);

    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        this.close('dynamicConfirmModal');
      }
    });

    return modal;
  }

  /**
   * Crea el modal de alerta dinámico usando métodos DOM seguros
   * @returns {HTMLElement}
   */
  createAlertModal() {
    const modal = this.createElement('div', {
      id: 'dynamicAlertModal',
      className: 'fixed inset-0 modal-backdrop z-[100] hidden flex items-center justify-center p-4'
    });

    const container = this.createElement('div', {
      className: 'bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 transform transition-all text-center'
    });

    const iconEl = this.createElement('span', {
      className: 'text-5xl block mb-4',
      'data-modal-icon': ''
    });

    const titleEl = this.createElement('h3', {
      className: 'text-xl font-bold text-gray-800 mb-2',
      'data-modal-title': ''
    });

    const messageEl = this.createElement('p', {
      className: 'text-gray-600 mb-6',
      'data-modal-message': ''
    });

    const acceptBtn = this.createElement('button', {
      className: 'w-full px-4 py-3 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition font-medium',
      'data-modal-accept': ''
    }, 'Aceptar');

    container.appendChild(iconEl);
    container.appendChild(titleEl);
    container.appendChild(messageEl);
    container.appendChild(acceptBtn);
    modal.appendChild(container);

    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        this.close('dynamicAlertModal');
      }
    });

    return modal;
  }
}

// Exportar instancia singleton
export const modalManager = new ModalManager();
export default modalManager;
