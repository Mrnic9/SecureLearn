import React from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../context/authStore';
import '../styles/home.css';

export default function HomePage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  return (
    <div className="home">
      <section className="hero">
        <div className="container">
          <h1>🔒 SecureLearn</h1>
          <h2>Portal de Capacitación en Seguridad de Información</h2>
          <p>Aprende sobre ciberseguridad, protección de datos y buenas prácticas de seguridad</p>

          {!user ? (
            <div className="cta-buttons">
              <button className="btn-primary" onClick={() => navigate('/login')}>
                Iniciar Sesión
              </button>
              <button className="btn-secondary" onClick={() => navigate('/register')}>
                Crear Cuenta
              </button>
            </div>
          ) : (
            <button className="btn-primary" onClick={() => navigate('/dashboard')}>
              Ir al Dashboard
            </button>
          )}
        </div>
      </section>

      <section className="features">
        <div className="container">
          <h2>Características Principales</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">📚</div>
              <h3>Cursos Especializados</h3>
              <p>Acceso a cursos sobre seguridad de información, phishing, cifrado y más</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">✅</div>
              <h3>Evaluaciones</h3>
              <p>Tests interactivos para validar tu conocimiento en seguridad</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🏆</div>
              <h3>Certificados</h3>
              <p>Obtén certificados digitales al completar los cursos</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🔐</div>
              <h3>Segura por Diseño</h3>
              <p>Plataforma construida con los más altos estándares de seguridad</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3>Progreso Tracking</h3>
              <p>Monitorea tu progreso y progresa a tu propio ritmo</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">👥</div>
              <h3>Comunidad</h3>
              <p>Conecta con otros profesionales de seguridad</p>
            </div>
          </div>
        </div>
      </section>

      <section className="about">
        <div className="container">
          <h2>Sobre SecureLearn</h2>
          <p>
            SecureLearn es una plataforma educativa diseñada para capacitar a profesionales y empleados
            en el campo de la ciberseguridad. Nuestro objetivo es crear conciencia sobre las amenazas
            de seguridad y promover buenas prácticas en la protección de información sensible.
          </p>
          <p>
            La plataforma implementa los más rigurosos estándares de seguridad, incluyendo encriptación
            de datos, autenticación segura y validación de entradas para proteger contra las
            vulnerabilidades más comunes del OWASP Top 10.
          </p>
        </div>
      </section>
    </div>
  );
}
