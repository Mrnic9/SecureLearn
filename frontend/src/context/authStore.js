import React, { createContext, useState, useCallback } from 'react';
import securityService from '../services/security';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true); // true hasta que se revise localStorage
  const [error, setError] = useState(null);

  // Cargar datos guardados al iniciar
  React.useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch (e) {
        // Si el JSON está corrupto, limpiar
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setIsInitializing(false); // Ya terminamos de revisar
  }, []);

  const login = useCallback(async (email, password) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Error en login');
      }

      const data = await response.json();
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      // Also store in sessionStorage for SecurityService
      sessionStorage.setItem('auth_token', data.token);
      securityService.logSecurityEvent('user_login', { email });
      setToken(data.token);
      setUser(data.user);
      setIsLoading(false);
      return data;
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
      throw err;
    }
  }, []);

  const register = useCallback(async (email, password, firstName, lastName) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, firstName, lastName })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Error en registro');
      }

      const data = await response.json();
      setIsLoading(false);
      return data;
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
      throw err;
    }
  }, []);

  const logout = useCallback(() => {
    securityService.logSecurityEvent('user_logout', { userId: user?.id });
    securityService.clearSession();
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setToken(null);
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, token, isLoading, isInitializing, error, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook para usar el contexto
export function useAuth() {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de AuthProvider');
  }
  return context;
}
