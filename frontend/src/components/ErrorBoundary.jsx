import React from 'react';
import securityService from '../services/security';

/**
 * ErrorBoundary — Captura errores no manejados en el árbol de componentes.
 * En producción muestra UI amigable; en desarrollo muestra el stack trace.
 */
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });

    // Loguear evento de seguridad
    try {
      securityService.logSecurityEvent('react_error_boundary', {
        message: error.message,
        componentStack: errorInfo.componentStack?.slice(0, 500),
      });
    } catch {
      // silenciar si securityService también falla
    }

    console.error('[ErrorBoundary] Error capturado:', error, errorInfo);
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    const isDev = process.env.NODE_ENV === 'development';

    return (
      <div style={styles.wrapper}>
        <div style={styles.card}>
          <div style={styles.icon}>💥</div>
          <h2 style={styles.title}>Algo salió mal</h2>
          <p style={styles.subtitle}>
            {isDev
              ? this.state.error?.message || 'Error desconocido'
              : 'Ocurrió un error inesperado. Por favor recarga la página.'}
          </p>

          {isDev && this.state.errorInfo && (
            <details style={styles.details}>
              <summary style={styles.summary}>Ver detalles técnicos</summary>
              <pre style={styles.pre}>
                {this.state.error?.stack}
                {'\n\nComponent Stack:'}
                {this.state.errorInfo.componentStack}
              </pre>
            </details>
          )}

          <button style={styles.button} onClick={this.handleReload}>
            🔄 Recargar página
          </button>
        </div>
      </div>
    );
  }
}

const styles = {
  wrapper: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
    padding: '1rem',
    fontFamily: "'Inter', sans-serif",
  },
  card: {
    background: 'rgba(255,255,255,0.05)',
    backdropFilter: 'blur(12px)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '1.5rem',
    padding: '3rem 2.5rem',
    maxWidth: '560px',
    width: '100%',
    textAlign: 'center',
    color: '#fff',
  },
  icon: {
    fontSize: '4rem',
    marginBottom: '1rem',
  },
  title: {
    fontSize: '1.8rem',
    fontWeight: 700,
    margin: '0 0 0.75rem',
    background: 'linear-gradient(135deg, #f43f5e, #fb923c)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  subtitle: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: '1rem',
    marginBottom: '1.5rem',
    lineHeight: 1.6,
  },
  details: {
    textAlign: 'left',
    marginBottom: '1.5rem',
  },
  summary: {
    cursor: 'pointer',
    color: '#94a3b8',
    fontSize: '0.85rem',
    marginBottom: '0.5rem',
  },
  pre: {
    background: 'rgba(0,0,0,0.4)',
    borderRadius: '0.5rem',
    padding: '1rem',
    fontSize: '0.75rem',
    color: '#fca5a5',
    overflowX: 'auto',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
    maxHeight: '200px',
    overflowY: 'auto',
  },
  button: {
    background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
    color: '#fff',
    border: 'none',
    borderRadius: '0.75rem',
    padding: '0.75rem 2rem',
    fontSize: '1rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'opacity 0.2s',
  },
};
