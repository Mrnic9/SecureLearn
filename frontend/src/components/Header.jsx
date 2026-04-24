import React, { useState, useEffect } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { useAuth } from '../context/authStore';
import '../styles/header.css';

export default function Header() {
  const history = useHistory();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  // Cerrar menú al cambiar de ruta
  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

  // Cerrar menú al hacer click fuera
  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e) => {
      if (!e.target.closest('.header') && !e.target.closest('.mobile-menu')) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, [menuOpen]);

  const handleLogout = () => {
    logout();
    history.push('/login');
  };

  const initials = user ? (user.firstName?.[0] || '') + (user.lastName?.[0] || '') : '?';
  const isActive = (path) => location.pathname === path;

  return (
    <>
      <header className="header">
        <div className="header-inner">
          {/* Logo */}
          <div className="logo" onClick={() => history.push('/')}>
            <div className="logo-icon">🔒</div>
            SecureLearn
          </div>

          {/* Desktop Nav */}
          <nav className="nav">
            {user ? (
              <div className="nav-authenticated">
                <button
                  className={`btn-nav${isActive('/dashboard') ? ' active' : ''}`}
                  onClick={() => history.push('/dashboard')}
                >
                  Dashboard
                </button>
                <button
                  className={`btn-nav${isActive('/profile') ? ' active' : ''}`}
                  onClick={() => history.push('/profile')}
                >
                  Perfil
                </button>
                <button
                  className={`btn-nav${isActive('/certificates') ? ' active' : ''}`}
                  onClick={() => history.push('/certificates')}
                >
                  Certificados
                </button>
                {user.role === 'admin' && (
                  <button
                    className={`btn-nav${isActive('/admin/users') ? ' active' : ''}`}
                    onClick={() => history.push('/admin/users')}
                  >
                    Admin
                  </button>
                )}

                <div className="user-pill">
                  <div className="user-avatar">{initials.toUpperCase()}</div>
                  <span className="user-name">{user.firstName}</span>
                </div>

                <button className="btn-logout-header" onClick={handleLogout}>
                  Salir
                </button>
              </div>
            ) : (
              <div className="nav-guest">
                <button className="btn-nav-login" onClick={() => history.push('/login')}>
                  Iniciar sesión
                </button>
                <button className="btn-nav-register" onClick={() => history.push('/register')}>
                  Registrarse
                </button>
              </div>
            )}
          </nav>

          {/* Hamburger */}
          <button
            className={`hamburger${menuOpen ? ' open' : ''}`}
            onClick={() => setMenuOpen(v => !v)}
            aria-label="Abrir menú"
          >
            <span className="hamburger-line" />
            <span className="hamburger-line" />
            <span className="hamburger-line" />
          </button>
        </div>
      </header>

      {/* Mobile Menu */}
      <div className={`mobile-menu${menuOpen ? ' open' : ''}`}>
        {user ? (
          <>
            <div className="mobile-user-info">
              <div className="user-avatar">{initials.toUpperCase()}</div>
              <div>
                <div className="user-name">{user.firstName} {user.lastName}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{user.email}</div>
              </div>
            </div>

            <div className="mobile-divider" />

            <button className="btn-nav" onClick={() => history.push('/dashboard')}>
              📊 Dashboard
            </button>
            <button className="btn-nav" onClick={() => history.push('/profile')}>
              👤 Perfil
            </button>
            <button className="btn-nav" onClick={() => history.push('/certificates')}>
              🏆 Certificados
            </button>
            {user.role === 'admin' && (
              <button className="btn-nav" onClick={() => history.push('/admin/users')}>
                ⚙️ Administración
              </button>
            )}

            <div className="mobile-divider" />
            <button className="btn-logout-header" onClick={handleLogout}>
              🚪 Cerrar sesión
            </button>
          </>
        ) : (
          <>
            <button className="btn-nav-login" onClick={() => history.push('/login')}>
              Iniciar sesión
            </button>
            <button className="btn-nav-register" onClick={() => history.push('/register')}>
              Registrarse gratis
            </button>
          </>
        )}
      </div>
    </>
  );
}
