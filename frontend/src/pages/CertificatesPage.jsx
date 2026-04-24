import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { useAuth } from '../context/authStore';

export default function CertificatesPage() {
  const history = useHistory();
  const { user } = useAuth();
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      history.push('/login');
      return;
    }
    loadCertificates();
  }, [user, history]);

  const loadCertificates = async () => {
    try {
      setLoading(false);
      // Simulado por ahora - será conectado al backend
      setCertificates([
        {
          id: 1,
          title: 'Introducción a la Seguridad',
          date: new Date().toLocaleDateString(),
          number: 'SL-A1B2C3D4'
        }
      ]);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="container" style={{ padding: '2rem' }}>
      <h1>Mis Certificados</h1>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <div className="spinner"></div>
          <p>Cargando certificados...</p>
        </div>
      ) : certificates.length === 0 ? (
        <div style={{
          background: 'white',
          padding: '2rem',
          borderRadius: '8px',
          textAlign: 'center',
          marginTop: '2rem'
        }}>
          <p style={{ color: '#666', fontSize: '1.1rem' }}>
            Aún no tienes certificados. ¡Completa cursos para obtenerlos!
          </p>
          <button
            onClick={() => history.push('/dashboard')}
            style={{
              padding: '0.75rem 2rem',
              background: '#0066cc',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              marginTop: '1rem'
            }}
          >
            Ver Cursos
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem', marginTop: '2rem' }}>
          {certificates.map(cert => (
            <div
              key={cert.id}
              style={{
                background: 'white',
                padding: '2rem',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                textAlign: 'center',
                border: '2px solid #ffd700'
              }}
            >
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏆</div>
              <h3 style={{ color: '#0066cc', marginBottom: '0.5rem' }}>Certificado</h3>
              <p style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '1rem' }}>
                {cert.title}
              </p>
              <p style={{ color: '#666', marginBottom: '1rem' }}>
                Obtenido el: {cert.date}
              </p>
              <p style={{ color: '#999', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                Número: {cert.number}
              </p>
              <button
                style={{
                  padding: '0.75rem 1.5rem',
                  background: '#0066cc',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
                onClick={() => alert('Descargando certificado...')}
              >
                📥 Descargar
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
