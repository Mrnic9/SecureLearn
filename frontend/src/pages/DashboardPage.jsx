import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { useAuth } from '../context/authStore';
import { useToast } from '../context/toastStore';
import { courseAPI } from '../services/api';
import '../styles/dashboard.css';

// ─── Skeleton de tarjeta de curso ─────────────────────────────────────────────
function CourseCardSkeleton() {
  return (
    <div className="skeleton-card">
      <div className="skeleton-card-top" />
      <div className="skeleton skeleton-title" style={{ width: '70%' }} />
      <div className="skeleton skeleton-text" />
      <div className="skeleton skeleton-text" style={{ width: '80%' }} />
      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
        <div className="skeleton skeleton-badge" />
        <div className="skeleton skeleton-badge" />
      </div>
      <div className="skeleton skeleton-btn" style={{ marginTop: '0.5rem' }} />
    </div>
  );
}

export default function DashboardPage() {
  const history = useHistory();
  const { user } = useAuth();
  const toast = useToast();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enrolledCourses, setEnrolledCourses] = useState([]);

  useEffect(() => {
    if (!user) { history.push('/login'); return; }
    loadCourses();
  }, [user, history]);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const data = await courseAPI.list();
      setCourses(data.courses || []);
    } catch (err) {
      toast.error(err.message || 'Error cargando cursos');
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (courseId, e) => {
    e.stopPropagation();
    try {
      await courseAPI.enroll(courseId);
      setEnrolledCourses(prev => [...prev, courseId]);
      toast.success('¡Inscripción exitosa! Ya puedes acceder al curso.');
    } catch (err) {
      toast.error(err.message || 'Error en la inscripción');
    }
  };

  const isEnrolled = (id) => enrolledCourses.includes(id);

  const roleLabel = { admin: '👑 Administrador', instructor: '🎓 Instructor', student: '👤 Estudiante' };

  return (
    <div className="dashboard">
      <div className="container">

        {/* Welcome Header */}
        <div className="dashboard-header">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h1>¡Hola, {user?.firstName}! 👋</h1>
              <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
                Continúa aprendiendo sobre ciberseguridad
              </p>
            </div>
            <span className="role-badge">
              {roleLabel[user?.role] || user?.role?.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Courses */}
        <div className="dashboard-section">
          <h2>📚 Cursos Disponibles</h2>

          {loading ? (
            <div className="courses-grid">
              {[1, 2, 3, 4, 5, 6].map(i => <CourseCardSkeleton key={i} />)}
            </div>
          ) : courses.length === 0 ? (
            <div className="empty-state">
              <div style={{ fontSize: '2.5rem', opacity: 0.4 }}>📭</div>
              <p>No hay cursos disponibles en este momento</p>
            </div>
          ) : (
            <div className="courses-grid">
              {courses.map(course => (
                <div
                  key={course.id}
                  className="course-card"
                  onClick={() => history.push(`/course/${course.uuid}`)}
                >
                  <div className="course-card-top" />
                  <div className="course-card-body">
                    <h3>{course.title}</h3>
                    <p className="course-description">{course.description}</p>
                    <div className="course-meta">
                      <span className="badge">{course.category}</span>
                      <span className="level">{course.level}</span>
                      <span className="duration">⏱ {course.durationMinutes} min</span>
                    </div>
                    <button
                      className={`btn-enroll${isEnrolled(course.id) ? ' enrolled' : ''}`}
                      onClick={(e) => handleEnroll(course.uuid, e)}
                      disabled={isEnrolled(course.id)}
                    >
                      {isEnrolled(course.id) ? '✓ Inscrito' : 'Inscribirse'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Admin Panel */}
        {user?.role === 'admin' && (
          <div className="dashboard-section">
            <h2>⚙️ Panel de Administración</h2>
            <div className="admin-links">
              <button className="btn-admin" onClick={() => history.push('/admin/users')}>
                <span style={{ fontSize: '1.75rem' }}>👥</span>
                Gestionar Usuarios
              </button>
              <button className="btn-admin" onClick={() => toast.info('Módulo de Auditoría en desarrollo. Próximamente disponible.')}>
                <span style={{ fontSize: '1.75rem' }}>📊</span>
                Auditoría
              </button>
            </div>
          </div>
        )}

        {/* Instructor Panel */}
        {user?.role === 'instructor' && (
          <div className="dashboard-section">
            <h2>📖 Panel de Instructor</h2>
            <div className="admin-links">
              <button className="btn-instructor" onClick={() => toast.info('Crear curso: próximamente disponible.')}>
                <span style={{ fontSize: '1.75rem' }}>➕</span>
                Crear Nuevo Curso
              </button>
              <button className="btn-instructor" onClick={() => toast.info('Mis Cursos: próximamente disponible.')}>
                <span style={{ fontSize: '1.75rem' }}>📚</span>
                Mis Cursos
              </button>
            </div>
          </div>
        )}

        {/* Student Panel */}
        {user?.role === 'student' && (
          <div className="dashboard-section">
            <h2>📈 Mi Progreso</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.7' }}>
              Completa cursos para obtener certificados y mejorar tus habilidades en seguridad.
              Visita la sección de <strong style={{ color: 'var(--primary)' }}>Certificados</strong> para ver tus logros.
            </p>
          </div>
        )}

      </div>
    </div>
  );
}
