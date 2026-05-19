import React, { useState, useEffect } from 'react';
import { useHistory, Link } from 'react-router-dom';
import { useAuth } from '../context/authStore';
import { useToast } from '../context/toastStore';
import securityService from '../services/security';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: ''
  });
  const [error, setError] = useState('');
  const [passwordStrength, setPasswordStrength] = useState(null);
  const [emailError, setEmailError] = useState('');
  const history = useHistory();
  const { register, isLoading } = useAuth();
  const toast = useToast();

  // Validate password strength in real-time
  useEffect(() => {
    if (formData.password) {
      const strength = securityService.validatePassword(formData.password);
      setPasswordStrength(strength);
    } else {
      setPasswordStrength(null);
    }
  }, [formData.password]);

  // Validate email in real-time
  useEffect(() => {
    if (formData.email && !securityService.isValidEmail(formData.email)) {
      setEmailError('Email inválido. Use el formato: usuario@ejemplo.com');
    } else {
      setEmailError('');
    }
  }, [formData.email]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const getStrengthColor = (strength) => {
    switch (strength) {
      case 'weak':
        return '#dc3545';
      case 'moderate':
        return '#ffc107';
      case 'strong':
        return '#17a2b8';
      case 'very-strong':
        return '#28a745';
      default:
        return '#ccc';
    }
  };

  const getStrengthLabel = (strength) => {
    switch (strength) {
      case 'weak':
        return '❌ Débil';
      case 'moderate':
        return '⚠️ Regular';
      case 'strong':
        return '✓ Fuerte';
      case 'very-strong':
        return '✅ Muy Fuerte';
      default:
        return '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password || !formData.firstName || !formData.lastName) {
      setError('Todos los campos son requeridos');
      return;
    }

    if (emailError) {
      setError('Por favor, corrija el email');
      return;
    }

    if (!passwordStrength?.isValid) {
      setError('La contraseña no cumple con los requisitos de seguridad');
      return;
    }

    try {
      await register(formData.email, formData.password, formData.firstName, formData.lastName);
      securityService.logSecurityEvent('user_registration_success', { email: formData.email });
      toast.success('¡Cuenta creada correctamente! Ya puedes iniciar sesión.');
      history.push('/login');
    } catch (err) {
      securityService.logSecurityEvent('user_registration_failed', { email: formData.email, error: err.message });
      setError(err.message);
      toast.error(err.message || 'Error al crear la cuenta');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form-wrapper">
        <h2>🔐 Crear Cuenta Segura</h2>

        {error && <div className="alert error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nombre</label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              placeholder="Tu nombre"
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label>Apellido</label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              placeholder="Tu apellido"
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="tu@email.com"
              disabled={isLoading}
              className={emailError ? 'input-error' : ''}
            />
            {emailError && <span className="field-error">{emailError}</span>}
          </div>

          <div className="form-group">
            <label>Contraseña</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Mínimo 8 caracteres"
              disabled={isLoading}
              className={passwordStrength ? (passwordStrength.isValid ? 'input-valid' : 'input-error') : ''}
            />

            {/* Password Strength Indicator */}
            {passwordStrength && (
              <div className="password-strength-container">
                <div className="password-strength-bar">
                  <div
                    className="password-strength-fill"
                    style={{
                      width: passwordStrength.isValid ? '100%' : '33%',
                      backgroundColor: getStrengthColor(passwordStrength.strength),
                      height: '6px',
                      borderRadius: '3px',
                      transition: 'all 0.3s ease'
                    }}
                  />
                </div>
                <p className="password-strength-label" style={{ color: getStrengthColor(passwordStrength.strength) }}>
                  Fortaleza: {getStrengthLabel(passwordStrength.strength)}
                </p>

                {/* Requirements Checklist */}
                <div className="password-requirements">
                  <h4>Requisitos:</h4>
                  <ul>
                    <li className={passwordStrength.requirements.minLength ? 'requirement-met' : 'requirement-unmet'}>
                      {passwordStrength.requirements.minLength ? '✅' : '❌'} Mínimo 8 caracteres
                    </li>
                    <li className={passwordStrength.requirements.hasUppercase ? 'requirement-met' : 'requirement-unmet'}>
                      {passwordStrength.requirements.hasUppercase ? '✅' : '❌'} Una letra mayúscula
                    </li>
                    <li className={passwordStrength.requirements.hasLowercase ? 'requirement-met' : 'requirement-unmet'}>
                      {passwordStrength.requirements.hasLowercase ? '✅' : '❌'} Una letra minúscula
                    </li>
                    <li className={passwordStrength.requirements.hasNumbers ? 'requirement-met' : 'requirement-unmet'}>
                      {passwordStrength.requirements.hasNumbers ? '✅' : '❌'} Un número
                    </li>
                    <li className={passwordStrength.requirements.hasSpecialChar ? 'requirement-met' : 'requirement-unmet'}>
                      {passwordStrength.requirements.hasSpecialChar ? '✅' : '❌'} Un carácter especial (!@#$%^&* etc.)
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </div>

          <button
            type="submit"
            className="btn-submit"
            disabled={isLoading || !passwordStrength?.isValid || !!emailError}
          >
            {isLoading ? 'Registrando...' : 'Crear Cuenta Segura'}
          </button>
        </form>

        <p className="auth-link">
          ¿Ya tienes cuenta? <Link to="/login">Inicia sesión aquí</Link>
        </p>
      </div>
    </div>
  );
}
