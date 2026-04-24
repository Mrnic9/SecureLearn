import React, { useState, useEffect } from 'react';
import '../styles/modal.css';

export default function SessionWarningModal({ onExtend, onLogout, userName }) {
  const [secondsLeft, setSecondsLeft] = useState(15); // 15 seg restantes al aparecer

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) { clearInterval(timer); onLogout(); return 0; }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onLogout]);

  // Color de urgencia
  const isUrgent = secondsLeft <= 5;

  return (
    <div className="modal-overlay">
      <div className="modal-content session-warning">
        <div className="modal-header warning">
          <h2>⏰ Sesión por Expirar</h2>
        </div>

        <div className="modal-body">
          <p>
            ¡Hola <strong>{userName}</strong>! Tu sesión expirará por inactividad.
          </p>

          <div
            className="time-warning"
            style={{
              borderColor: isUrgent ? '#dc3545' : '#ffc107',
              background:  isUrgent ? '#fff5f5'  : '#fffbeb',
              color:       isUrgent ? '#b91c1c'  : '#92400e',
              fontSize: '1.1rem',
              fontWeight: 700,
              textAlign: 'center',
              transition: 'all 0.3s ease',
            }}
          >
            {isUrgent ? '🚨' : '⚠️'} Cerrando sesión en{' '}
            <span style={{ fontSize: '1.5rem' }}>{secondsLeft}</span> segundo{secondsLeft !== 1 ? 's' : ''}
          </div>

          <p>¿Deseas continuar en la plataforma?</p>
        </div>

        <div className="modal-footer">
          <button className="btn-extend" onClick={onExtend} title="Extender sesión">
            ✓ Seguir aquí
          </button>
          <button className="btn-logout" onClick={onLogout} title="Cerrar sesión ahora">
            ✕ Salir
          </button>
        </div>

        <div className="modal-footer-text">
          <small>🔒 La sesión se cierra automáticamente tras 1 min de inactividad</small>
        </div>
      </div>
    </div>
  );
}
