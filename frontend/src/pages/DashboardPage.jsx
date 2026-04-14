import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../context/authStore';
import { courseAPI } from '../services/api';
import '../styles/dashboard.css';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    loadCourses();
  }, [user, navigate]);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const data = await courseAPI.list();
      setCourses(data.courses || []);
    } catch (err) {
      setError('Error cargando cursos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (courseId) => {
    try {
      await courseAPI.enroll(courseId);
      alert('¡Inscripción exitosa!');
      loadCourses();
    } catch (err) {
      alert(err.message || 'Error en la inscripción');
    }
  };

  return (
    <div className="dashboard">
      <div className="container">
        <div className="dashboard-header">
          <h1>Bienvenido, {user?.firstName}!</h1>
          <p>Rol: <span className="role-badge">{user?.role}</span></p>
        </div>

        {error && <div className="alert error">{error}</div>}

        <div className="dashboard-section">
          <h2>📚 Cursos Disponibles</h2>

          {loading ? (
            <div className="loading">
              <div className="spinner"></div>
              <p>Cargando cursos...</p>
            </div>
          ) : courses.length === 0 ? (
            <div className="empty-state">
              <p>No hay cursos disponibles en este momento</p>
            </div>
          ) : (
            <div className="courses-grid">
              {courses.map(course => (
                <div key={course.id} className="course-card">
                  <h3>{course.title}</h3>
                  <p className="course-description">{course.description}</p>
                  <div className="course-meta">
                    <span className="badge">{course.category}</span>
                    <span className="level">{course.level}</span>
                    <span className="duration">⏱️ {course.durationMinutes} min</span>
                  </div>
                  <button
                    className="btn-enroll"
                    onClick={() => handleEnroll(course.uuid)}
                  >
                    Inscribirse
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {user?.role === 'admin' && (
          <div className="dashboard-section">
            <h2>⚙️ Panel de Administración</h2>
            <div className="admin-links">
              <button className="btn-admin" onClick={() => navigate('/admin/users')}>
                Gestionar Usuarios
              </button>
              <button className="btn-admin" onClick={() => navigate('/admin/audit')}>
                Auditoría
              </button>
            </div>
          </div>
        )}

        {user?.role === 'instructor' && (
          <div className="dashboard-section">
            <h2>📖 Panel de Instructor</h2>
            <button className="btn-instructor" onClick={() => navigate('/instructor/create-course')}>
              ➕ Crear Nuevo Curso
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
