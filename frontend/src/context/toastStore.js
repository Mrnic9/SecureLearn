import React, { createContext, useContext, useReducer, useCallback } from 'react';

// ─── Context ──────────────────────────────────────────────────────────────────
const ToastContext = createContext(null);

// ─── Reducer ──────────────────────────────────────────────────────────────────
function toastReducer(state, action) {
  switch (action.type) {
    case 'ADD':
      return [...state, action.payload];
    case 'REMOVE':
      return state.filter(t => t.id !== action.id);
    default:
      return state;
  }
}

// ─── Provider ─────────────────────────────────────────────────────────────────
export function ToastProvider({ children }) {
  const [toasts, dispatch] = useReducer(toastReducer, []);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    dispatch({ type: 'ADD', payload: { id, message, type, duration } });

    // Auto-dismiss
    setTimeout(() => {
      dispatch({ type: 'REMOVE', id });
    }, duration);

    return id;
  }, []);

  const removeToast = useCallback((id) => {
    dispatch({ type: 'REMOVE', id });
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
    </ToastContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast debe usarse dentro de <ToastProvider>');

  return {
    success: (msg, dur) => ctx.addToast(msg, 'success', dur),
    error:   (msg, dur) => ctx.addToast(msg, 'error',   dur || 6000),
    warning: (msg, dur) => ctx.addToast(msg, 'warning', dur),
    info:    (msg, dur) => ctx.addToast(msg, 'info',    dur),
    remove:  ctx.removeToast,
    toasts:  ctx.toasts,
  };
}
