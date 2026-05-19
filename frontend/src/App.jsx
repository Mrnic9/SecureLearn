import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Switch, Route, Redirect } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/authStore';
import { ToastProvider } from './context/toastStore';
import securityService from './services/security';
import Header from './components/Header';
import ErrorBoundary from './components/ErrorBoundary';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import CourseDetailPage from './pages/CourseDetailPage';
import ProfilePage from './pages/ProfilePage';
import CertificatesPage from './pages/CertificatesPage';
import AdminUsersPage from './pages/AdminUsersPage';
import SessionWarningModal from './components/SessionWarningModal';
import Toast from './components/Toast';
import './styles/globals.css';
import './styles/home.css';
import './styles/auth.css';
import './styles/dashboard.css';
import './styles/header.css';
import './styles/profile.css';

function PrivateRoute({ children, ...rest }) {
  const { user, isInitializing } = useAuth();
  return (
    <Route
      {...rest}
      render={() => {
        if (isInitializing) {
          // Esperar a que se carguen los datos de localStorage
          return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
              <div style={{ textAlign: 'center' }}>
                <div className="spinner"></div>
                <p style={{ marginTop: '1rem', color: '#666' }}>Cargando...</p>
              </div>
            </div>
          );
        }
        return user ? children : <Redirect to="/login" />;
      }}
    />
  );
}

function AppContent() {
  const { user, logout } = useAuth();
  const [showSessionWarning, setShowSessionWarning] = useState(false);

  useEffect(() => {
    if (user) {
      // Initialize session monitoring
      const handleWarning = () => {
        securityService.logSecurityEvent('session_warning_shown', { user: user.email });
        setShowSessionWarning(true);
      };

      const handleExpire = () => {
        securityService.logSecurityEvent('session_expired', { user: user.email });
        logout();
      };

      securityService.initSessionMonitor(handleWarning, handleExpire);

      return () => {
        // Cleanup on unmount
        securityService.clearSession();
      };
    }
  }, [user, logout]);

  const handleExtendSession = () => {
    setShowSessionWarning(false);
    securityService.logSecurityEvent('session_extended', { user: user?.email });
    // Reset session timers - reuse the same callbacks
    if (user) {
      const handleWarning = () => setShowSessionWarning(true);
      const handleExpire = () => logout();
      securityService.resetSessionTimer(handleWarning, handleExpire);
    }
  };

  const handleLogout = () => {
    setShowSessionWarning(false);
    securityService.logSecurityEvent('session_logout_from_warning', { user: user?.email });
    logout();
  };

  return (
    <>
      {showSessionWarning && user && (
        <SessionWarningModal
          onExtend={handleExtendSession}
          onLogout={handleLogout}
          userName={user.firstName}
        />
      )}
      <Router>
        <Header />
        <Switch>
          <Route exact path="/" component={HomePage} />
          <Route exact path="/login" component={LoginPage} />
          <Route exact path="/register" component={RegisterPage} />
          <PrivateRoute exact path="/dashboard">
            <DashboardPage />
          </PrivateRoute>
          <PrivateRoute exact path="/course/:id">
            <CourseDetailPage />
          </PrivateRoute>
          <PrivateRoute exact path="/profile">
            <ProfilePage />
          </PrivateRoute>
          <PrivateRoute exact path="/certificates">
            <CertificatesPage />
          </PrivateRoute>
          <PrivateRoute exact path="/admin/users">
            <AdminUsersPage />
          </PrivateRoute>
        </Switch>
      </Router>
    </>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <AuthProvider>
          <AppContent />
          <Toast />
        </AuthProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
}
