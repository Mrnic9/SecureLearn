import React from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../context/authStore';
import '../styles/header.css';

export default function Header() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="header">
      <div className="container flex-between">
        <div className="logo" onClick={() => navigate('/')}>
          🔒 SecureLearn
        </div>

        <nav className="nav">
          {user ? (
            <div className="nav-authenticated flex-between">
              <span className="user-info">
                {user.firstName} ({user.role})
              </span>
              <button className="btn-logout" onClick={handleLogout}>
                Logout
              </button>
            </div>
          ) : (
            <div className="nav-guest flex-between">
              <button className="btn-link" onClick={() => navigate('/login')}>
                Login
              </button>
              <button className="btn-link" onClick={() => navigate('/register')}>
                Registrarse
              </button>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
