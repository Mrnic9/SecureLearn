import React, { useState, useEffect } from 'react';
import { useHistory, Link } from 'react-router-dom';
import { useAuth } from '../context/authStore';
import { useToast } from '../context/toastStore';
import securityService from '../services/security';
import '../styles/auth.css';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [lockoutMessage, setLockoutMessage] = useState('');
  const [lockoutTimeRemaining, setLockoutTimeRemaining] = useState(0);
  const [emailError, setEmailError] = useState('');
  const history = useHistory();
  const { login, error, isLoading } = useAuth();
  const toast = useToast();

  // Check for account lockout on email change
  useEffect(() => {
    if (email) {
      if (!securityService.isValidEmail(email)) {
        setEmailError('Email inválido. Use el formato: usuario@ejemplo.com');
      } else {
        setEmailError('');
      }

      // Check if account is locked
      if (securityService.isAccountLocked(email)) {
        const remaining = securityService.getLockoutTimeRemaining(email);
        setLockoutTimeRemaining(remaining);
        const minutes = Math.ceil(remaining / 60);
        setLockoutMessage(`🔒 Cuenta bloqueada. Reintentar en ${minutes} minuto${minutes !== 1 ? 's' : ''}`);
        securityService.logSecurityEvent('account_locked_display', { email, remainingSeconds: remaining });
      } else {
        setLockoutMessage('');
        setLockoutTimeRemaining(0);
      }
    }
  }, [email]);

  // Cuenta regresiva del bloqueo (actualiza cada segundo)
  useEffect(() => {
    if (lockoutTimeRemaining <= 0) return;
    const timer = setTimeout(() => {
      const remaining = securityService.getLockoutTimeRemaining(email);
      setLockoutTimeRemaining(remaining);
      if (remaining <= 0) {
        setLockoutMessage('');
      } else {
        const mins = Math.ceil(remaining / 60);
        setLockoutMessage(`🔒 Cuenta bloqueada. Reintentar en ${mins} minuto${mins !== 1 ? 's' : ''}`);
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [lockoutTimeRemaining, email]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate email format
    if (!securityService.isValidEmail(email)) {
      setEmailError('Email inválido. Use el formato: usuario@ejemplo.com');
      return;
    }

    // Check if account is locked
    if (securityService.isAccountLocked(email)) {
      const remaining = securityService.getLockoutTimeRemaining(email);
      const minutes = Math.ceil(remaining / 60);
      setLockoutMessage(`🔒 Cuenta bloqueada. Reintentar en ${minutes} minuto${minutes !== 1 ? 's' : ''}`);
      securityService.logSecurityEvent('login_attempt_while_locked', { email, remainingSeconds: remaining });
      return;
    }

    try {
      await login(email, password);
      securityService.clearLoginAttempts(email);
      securityService.logSecurityEvent('login_success', { email });
      toast.success('¡Bienvenido/a de nuevo!');
      history.push('/dashboard');
    } catch (err) {
      securityService.recordFailedLoginAttempt(email);
      const attempt = securityService.loginAttempts[email];
      const remaining = securityService.maxAttempts - attempt.attempts;

      if (remaining <= 0) {
        const lockoutRemaining = securityService.getLockoutTimeRemaining(email);
        const mins = Math.ceil(lockoutRemaining / 60);
        setLockoutTimeRemaining(lockoutRemaining);
        setLockoutMessage(`🔒 Demasiados intentos fallidos. Cuenta bloqueada por ${mins} minuto${mins !== 1 ? 's' : ''}`);
        toast.error(`Cuenta bloqueada por ${mins} minuto${mins !== 1 ? 's' : ''}. Intenta más tarde.`, 8000);
      } else {
        setLockoutMessage(`⚠️ Intento fallido. Intentos restantes: ${remaining}/${securityService.maxAttempts}`);
        toast.warning(`Credenciales incorrectas. Intentos restantes: ${remaining}`);
      }

      if (securityService.detectSuspiciousActivity(email)) {
        securityService.logSecurityEvent('suspicious_activity_detected', { email, attempts: attempt.attempts });
      }

      securityService.logSecurityEvent('login_failed', { email, remainingAttempts: remaining });
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form-wrapper">
        <h2>🔐 Iniciar Sesión</h2>

        {error && <div className="alert error">{error}</div>}
        {lockoutMessage && <div className="alert warning">{lockoutMessage}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              disabled={isLoading || lockoutTimeRemaining > 0}
              className={emailError ? 'input-error' : ''}
            />
            {emailError && <span className="field-error">{emailError}</span>}
          </div>

          <div className="form-group">
            <label>Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              disabled={isLoading || lockoutTimeRemaining > 0}
            />
          </div>

          <button
            type="submit"
            className="btn-submit"
            disabled={isLoading || lockoutTimeRemaining > 0 || !!emailError}
          >
            {isLoading ? 'Iniciando...' : lockoutTimeRemaining > 0 ? '⏳ Cuenta Bloqueada' : 'Iniciar Sesión'}
          </button>
        </form>

        <p className="auth-link">
          ¿No tienes cuenta? <Link to="/register">Regístrate aquí</Link>
        </p>

        <div className="demo-credentials">
          <p><strong>🔑 Credenciales de prueba:</strong></p>
          <ul>
            <li>Admin: admin@securelearn.local / Admin123!</li>
            <li>Instructor: instructor@securelearn.local / Instructor123!</li>
            <li>Estudiante: student@securelearn.local / Student123!</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
