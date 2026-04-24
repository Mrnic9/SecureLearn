import React from 'react';
import { useHistory } from 'react-router-dom';
import { useAuth } from '../context/authStore';
import '../styles/home.css';

const features = [
  { icon: '📚', title: 'Cursos Especializados', desc: 'Accede a cursos sobre seguridad de la información, phishing, cifrado y más, diseñados por expertos.' },
  { icon: '✅', title: 'Evaluaciones Interactivas', desc: 'Pon a prueba tus conocimientos con quizzes dinámicos al final de cada módulo.' },
  { icon: '🏆', title: 'Certificados Digitales', desc: 'Obtén certificados verificables al completar los cursos exitosamente.' },
  { icon: '🔐', title: 'Segura por Diseño', desc: 'Plataforma construida con OWASP Top 10, JWT y cifrado de extremo a extremo.' },
  { icon: '📊', title: 'Progreso en Tiempo Real', desc: 'Monitorea tu avance, estadísticas y logros desde un dashboard intuitivo.' },
  { icon: '👥', title: 'Gestión de Roles', desc: 'Sistema de permisos con roles de Admin, Instructor y Estudiante.' },
];

export default function HomePage() {
  const history = useHistory();
  const { user } = useAuth();

  return (
    <div className="home">
      {/* HERO */}
      <section className="hero">
        <div className="hero-grid" aria-hidden="true" />
        <div className="container hero-content">
          <div className="hero-badge">🛡️ Plataforma de Ciberseguridad Educativa</div>

          <h1>
            Aprende a proteger<br />
            <span className="gradient-text">el mundo digital</span>
          </h1>

          <p className="hero-subtitle">
            Capacita a tu equipo en seguridad de la información con cursos prácticos,
            evaluaciones y certificados digitales verificables.
          </p>

          <div className="hero-cta">
            {!user ? (
              <>
                <button className="btn-hero-primary" onClick={() => history.push('/register')}>
                  🚀 Comenzar gratis
                </button>
                <button className="btn-hero-secondary" onClick={() => history.push('/login')}>
                  Iniciar sesión →
                </button>
              </>
            ) : (
              <button className="btn-hero-primary" onClick={() => history.push('/dashboard')}>
                📊 Ir al Dashboard →
              </button>
            )}
          </div>

          <div className="hero-stats-row">
            <div className="hero-stat">
              <span className="hero-stat-number">5+</span>
              <span className="hero-stat-label">Cursos disponibles</span>
            </div>
            <div className="hero-stat">
              <span className="hero-stat-number">OWASP</span>
              <span className="hero-stat-label">Top 10 cubierto</span>
            </div>
            <div className="hero-stat">
              <span className="hero-stat-number">100%</span>
              <span className="hero-stat-label">Seguro por diseño</span>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="features">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Características</span>
            <h2 className="section-title">Todo lo que necesitas para aprender</h2>
            <p className="section-subtitle">
              Una plataforma completa con las mejores herramientas para dominar la ciberseguridad.
            </p>
          </div>
          <div className="features-grid">
            {features.map((f, i) => (
              <div className="feature-card" key={i}>
                <div className="feature-icon-wrap">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="stats">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Nuestro impacto</span>
            <h2 className="section-title">Números que hablan por sí solos</h2>
            <p className="section-subtitle">SecureLearn crece con cada profesional que se capacita.</p>
          </div>
          <div className="stats-grid">
            {[
              { n: '5+',   l: 'Cursos disponibles' },
              { n: '3',    l: 'Roles de usuario' },
              { n: '100%', l: 'Seguridad implementada' },
              { n: '∞',    l: 'Conocimiento compartido' },
            ].map((s, i) => (
              <div className="stat-card" key={i}>
                <span className="stat-number">{s.n}</span>
                <span className="stat-label">{s.l}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      {!user && (
        <section className="cta-section">
          <div className="container">
            <div className="cta-box">
              <h2>¿Listo para comenzar tu camino en ciberseguridad?</h2>
              <p>
                Únete a la plataforma que capacita profesionales con las mejores prácticas de seguridad.
                Completamente seguro, completamente educativo.
              </p>
              <button className="btn-cta" onClick={() => history.push('/register')}>
                🚀 Crear cuenta gratuita
              </button>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
