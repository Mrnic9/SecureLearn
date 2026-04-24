import React, { useState, useEffect } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { useAuth } from '../context/authStore';
import { courseAPI } from '../services/api';

export default function CourseDetailPage() {
  const history = useHistory();
  const { id } = useParams();
  const { user } = useAuth();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEnrolled, setIsEnrolled] = useState(false);

  useEffect(() => {
    if (!user) {
      history.push('/login');
      return;
    }
    loadCourse();
  }, [id, user, history]);

  const loadCourse = async () => {
    try {
      setLoading(true);
      const data = await courseAPI.getById(id);
      setCourse(data);
      setError('');
    } catch (err) {
      setError(err.message || 'Error cargando curso');
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    try {
      await courseAPI.enroll(course.uuid);
      setIsEnrolled(true);
      alert('¡Inscripción exitosa!');
    } catch (err) {
      alert(err.message || 'Error en la inscripción');
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '2rem', textAlign: 'center' }}>
        <div className="spinner"></div>
        <p>Cargando curso...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container" style={{ padding: '2rem' }}>
        <div className="alert error">{error}</div>
        <button onClick={() => history.push('/dashboard')}>Volver al Dashboard</button>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="container" style={{ padding: '2rem' }}>
        <p>Curso no encontrado</p>
        <button onClick={() => history.push('/dashboard')}>Volver al Dashboard</button>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '2rem' }}>
      <button
        onClick={() => history.push('/dashboard')}
        style={{ marginBottom: '2rem', padding: '0.5rem 1rem' }}
      >
        ← Volver
      </button>

      <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <h1>{course.title}</h1>

        <div style={{ display: 'flex', gap: '1rem', margin: '1rem 0', flexWrap: 'wrap' }}>
          <span style={{
            background: '#e3f2fd',
            color: '#0066cc',
            padding: '0.5rem 1rem',
            borderRadius: '4px',
            fontSize: '0.9rem'
          }}>
            {course.category}
          </span>
          <span style={{
            background: '#fff3e0',
            color: '#f57c00',
            padding: '0.5rem 1rem',
            borderRadius: '4px',
            fontSize: '0.9rem'
          }}>
            {course.level}
          </span>
          <span style={{
            background: '#f3e5f5',
            color: '#7b1fa2',
            padding: '0.5rem 1rem',
            borderRadius: '4px',
            fontSize: '0.9rem'
          }}>
            ⏱️ {course.durationMinutes} minutos
          </span>
        </div>

        <p style={{ fontSize: '1.1rem', color: '#666', lineHeight: '1.6', margin: '1.5rem 0' }}>
          {course.description}
        </p>

        {!isEnrolled && (
          <button
            onClick={handleEnroll}
            style={{
              padding: '0.75rem 2rem',
              background: '#0066cc',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              marginTop: '1rem'
            }}
          >
            Inscribirse al Curso
          </button>
        )}

        {isEnrolled && (
          <div style={{
            background: '#d4edda',
            color: '#155724',
            padding: '1rem',
            borderRadius: '4px',
            marginTop: '1rem'
          }}>
            ✅ Ya estás inscrito en este curso
          </div>
        )}

        <div style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid #ddd' }}>
          <h3>Contenido del Curso</h3>
          <p style={{ color: '#666', marginTop: '1rem' }}>
            Este curso contiene lecciones prácticas, evaluaciones y certificados al completar.
          </p>
          {isEnrolled && (
            <div style={{ marginTop: '1rem' }}>
              <button
                onClick={() => alert('Quiz en desarrollo')}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  marginRight: '1rem',
                  marginBottom: '1rem'
                }}
              >
                Realizar Evaluación
              </button>
              <button
                onClick={() => alert('Módulos en desarrollo')}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Ver Módulos
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
