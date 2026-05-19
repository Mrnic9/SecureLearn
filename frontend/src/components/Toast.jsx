import React, { useEffect, useState } from 'react';
import { useToast } from '../context/toastStore';
import '../styles/toast.css';

// ─── Toast individual ─────────────────────────────────────────────────────────
function ToastItem({ toast, onRemove }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Pequeño delay para que la animación de entrada se vea
    const enter = setTimeout(() => setVisible(true), 10);
    return () => clearTimeout(enter);
  }, []);

  const handleClose = () => {
    setVisible(false);
    setTimeout(() => onRemove(toast.id), 300); // esperar animación de salida
  };

  const icons = {
    success: '✅',
    error:   '❌',
    warning: '⚠️',
    info:    'ℹ️',
  };

  return (
    <div
      className={`toast toast--${toast.type} ${visible ? 'toast--visible' : ''}`}
      role="alert"
      aria-live="assertive"
    >
      <span className="toast__icon">{icons[toast.type] || 'ℹ️'}</span>
      <span className="toast__message">{toast.message}</span>
      <button
        className="toast__close"
        onClick={handleClose}
        aria-label="Cerrar notificación"
      >
        ×
      </button>
    </div>
  );
}

// ─── Contenedor de toasts ─────────────────────────────────────────────────────
export default function Toast() {
  const { toasts, remove } = useToast();

  if (!toasts.length) return null;

  return (
    <div className="toast-container" aria-label="Notificaciones">
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} onRemove={remove} />
      ))}
    </div>
  );
}
