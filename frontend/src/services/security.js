/**
 * SecurityService - Gestiona todas las medidas de seguridad
 */

class SecurityService {
  constructor() {
    this.loginAttempts = {};
    this.maxAttempts = 5;
    this.lockoutTime = 15 * 60 * 1000; // 15 minutos
    this.sessionTimeout = 1 * 60 * 1000;      // 1 minuto
    this.warningTime   = 45 * 1000;           // Advertencia a los 45 seg
    this.sessionWarningShown = false;
    this.warningTimer = null;
    this.expirationTimer = null;
    this.resetTimeout = null;
    this.listenersAttached = false;
    this.resetDelay = 1000; // 1 segundo de debounce
  }

  /**
   * Validar email
   */
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validar contraseña fuerte
   */
  validatePassword(password) {
    const requirements = {
      minLength: password.length >= 8,
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasNumbers: /\d/.test(password),
      hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
    };

    return {
      isValid: Object.values(requirements).every(req => req),
      requirements,
      strength: this.calculatePasswordStrength(requirements)
    };
  }

  /**
   * Calcular fortaleza de contraseña
   */
  calculatePasswordStrength(requirements) {
    const metRequirements = Object.values(requirements).filter(Boolean).length;
    if (metRequirements <= 2) return 'weak';
    if (metRequirements <= 3) return 'moderate';
    if (metRequirements <= 4) return 'strong';
    return 'very-strong';
  }

  /**
   * Registrar intento de login fallido
   */
  recordFailedLoginAttempt(email) {
    const now = Date.now();

    if (!this.loginAttempts[email]) {
      this.loginAttempts[email] = {
        attempts: 0,
        lockedUntil: null,
        history: []
      };
    }

    const attempt = this.loginAttempts[email];

    // Limpiar intentos antiguos (más de 15 minutos)
    attempt.history = attempt.history.filter(time => now - time < this.lockoutTime);

    // Si está bloqueado y pasó el tiempo
    if (attempt.lockedUntil && now > attempt.lockedUntil) {
      attempt.lockedUntil = null;
      attempt.history = [];
    }

    attempt.history.push(now);
    attempt.attempts = attempt.history.length;

    // Bloquear después de 5 intentos
    if (attempt.attempts >= this.maxAttempts) {
      attempt.lockedUntil = now + this.lockoutTime;
    }

    return attempt;
  }

  /**
   * Verificar si cuenta está bloqueada
   */
  isAccountLocked(email) {
    const attempt = this.loginAttempts[email];
    if (!attempt || !attempt.lockedUntil) return false;

    const now = Date.now();
    if (now > attempt.lockedUntil) {
      attempt.lockedUntil = null;
      return false;
    }

    return true;
  }

  /**
   * Obtener tiempo de bloqueo restante
   */
  getLockoutTimeRemaining(email) {
    const attempt = this.loginAttempts[email];
    if (!attempt || !attempt.lockedUntil) return 0;

    const remaining = attempt.lockedUntil - Date.now();
    return remaining > 0 ? Math.ceil(remaining / 1000) : 0;
  }

  /**
   * Limpiar intentos fallidos después de login exitoso
   */
  clearLoginAttempts(email) {
    if (this.loginAttempts[email]) {
      this.loginAttempts[email] = {
        attempts: 0,
        lockedUntil: null,
        history: []
      };
    }
  }

  /**
   * Generar token 2FA
   */
  generateTwoFactorCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Almacenar token de forma segura
   */
  storeToken(token, isSecure = true) {
    if (isSecure) {
      // Token en sessionStorage (más seguro que localStorage)
      sessionStorage.setItem('auth_token', token);
      sessionStorage.setItem('token_timestamp', Date.now().toString());
    } else {
      localStorage.setItem('auth_token', token);
    }
  }

  /**
   * Obtener token de forma segura
   */
  getToken() {
    return sessionStorage.getItem('auth_token') || localStorage.getItem('auth_token');
  }

  /**
   * Iniciar monitoreo de sesión
   */
  initSessionMonitor(onWarning, onExpire) {
    // Limpiar timers anteriores
    this.removeSessionListeners();

    // Advertencia a los 25 minutos
    this.warningTimer = setTimeout(() => {
      if (onWarning) onWarning();
      this.sessionWarningShown = true;
    }, this.warningTime);

    // Expiración a los 30 minutos
    this.expirationTimer = setTimeout(() => {
      if (onExpire) onExpire();
      this.clearSession();
    }, this.sessionTimeout);

    // Guardar referencias para después poder removerlas
    this.onWarningCallback = onWarning;
    this.onExpireCallback = onExpire;

    // Resetear timers en actividad del usuario (solo una vez)
    if (!this.listenersAttached) {
      document.addEventListener('mousemove', this.handleActivity.bind(this), { once: false });
      document.addEventListener('keypress', this.handleActivity.bind(this), { once: false });
      this.listenersAttached = true;
    }
  }

  /**
   * Manejar actividad del usuario con debounce
   */
  handleActivity() {
    // Debounce: solo resetear si pasaron al menos 1 segundo
    if (this.resetTimeout) return;

    this.resetTimeout = setTimeout(() => {
      this.resetTimeout = null;
      this.resetSessionTimer(this.onWarningCallback, this.onExpireCallback);
    }, this.resetDelay);
  }

  /**
   * Resetear timers de sesión
   */
  resetSessionTimer(onWarning, onExpire) {
    if (!onWarning || !onExpire) return; // Prevenir errores

    clearTimeout(this.warningTimer);
    clearTimeout(this.expirationTimer);
    this.sessionWarningShown = false;

    // Reiniciar timers
    this.warningTimer = setTimeout(() => {
      if (onWarning) onWarning();
      this.sessionWarningShown = true;
    }, this.warningTime);

    this.expirationTimer = setTimeout(() => {
      if (onExpire) onExpire();
      this.clearSession();
    }, this.sessionTimeout);
  }

  /**
   * Remover event listeners de sesión
   */
  removeSessionListeners() {
    // No podemos remover listeners anónimos, pero el debounce previene el flood
    this.listenersAttached = false;
  }

  /**
   * Limpiar sesión
   */
  clearSession() {
    sessionStorage.removeItem('auth_token');
    sessionStorage.removeItem('token_timestamp');
    localStorage.removeItem('auth_token');
    clearTimeout(this.warningTimer);
    clearTimeout(this.expirationTimer);
    clearTimeout(this.resetTimeout);
    this.warningTimer = null;
    this.expirationTimer = null;
    this.resetTimeout = null;
    this.listenersAttached = false;
  }

  /**
   * Sanitizar entrada (prevenir XSS)
   */
  sanitizeInput(input) {
    const div = document.createElement('div');
    div.textContent = input;
    return div.innerHTML;
  }

  /**
   * Validar CSRF token
   */
  generateCSRFToken() {
    const token = Math.random().toString(36).substring(2, 15) +
                  Math.random().toString(36).substring(2, 15);
    sessionStorage.setItem('csrf_token', token);
    return token;
  }

  /**
   * Verificar CSRF token
   */
  verifyCSRFToken(token) {
    return token === sessionStorage.getItem('csrf_token');
  }

  /**
   * Detectar comportamiento sospechoso
   */
  detectSuspiciousActivity(email) {
    const attempt = this.loginAttempts[email];
    if (!attempt) return false;

    // Más de 3 intentos en 5 minutos
    const recentAttempts = attempt.history.filter(
      time => Date.now() - time < 5 * 60 * 1000
    );

    return recentAttempts.length >= 3;
  }

  /**
   * Log de seguridad
   */
  logSecurityEvent(event, details) {
    const log = {
      timestamp: new Date().toISOString(),
      event,
      details,
      userAgent: navigator.userAgent,
      ip: 'client-side' // Se obtendría del servidor en producción
    };

    console.log('[SECURITY LOG]', log);
    // En producción, enviar al servidor
    // fetch('/api/logs/security', { method: 'POST', body: JSON.stringify(log) })
  }
}

export default new SecurityService();
