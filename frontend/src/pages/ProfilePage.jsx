import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { useAuth } from '../context/authStore';
import { userAPI } from '../services/api';
import '../styles/profile.css';

const ROLE_META = {
  admin:      { label: '👑 Administrador', icon: '👑' },
  instructor: { label: '🎓 Instructor',    icon: '🎓' },
  student:    { label: '👤 Estudiante',    icon: '👤' },
};

export default function ProfilePage() {
  const history = useHistory();
  const { user, login } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData]   = useState({ firstName: '', lastName: '' });
  const [loading,  setLoading]    = useState(false);
  const [toast,    setToast]      = useState(null); // { type, msg }

  useEffect(() => {
    if (!user) { history.push('/login'); return; }
    setFormData({ firstName: user.firstName || '', lastName: user.lastName || '' });
  }, [user, history]);

  const flash = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      flash('error', 'El nombre y apellido no pueden estar vacíos');
      return;
    }
    setLoading(true);
    try {
      await userAPI.updateProfile(formData.firstName.trim(), formData.lastName.trim());
      flash('success', 'Perfil actualizado correctamente');
      setIsEditing(false);
    } catch (err) {
      flash('error', err.message || 'Error al actualizar el perfil');
    } finally {
      setLoading(false);
    }
  };

  const cancelEdit = () => {
    setFormData({ firstName: user?.firstName || '', lastName: user?.lastName || '' });
    setIsEditing(false);
  };

  if (!user) return null;

  const initials  = (user.firstName?.[0] || '') + (user.lastName?.[0] || '');
  const roleMeta  = ROLE_META[user.role] || { label: user.role, icon: '👤' };
  const joinDate  = new Date().toLocaleDateString('es', { year: 'numeric', month: 'long' });

  return (
    <div className="profile-page">

      {/* ── HERO ── */}
      <div className="profile-hero">
        <div className="profile-hero-grid" aria-hidden="true" />
        <div className="container profile-hero-inner">

          {/* Avatar */}
          <div className="profile-avatar-wrap">
            <div className="profile-avatar">
              {initials.toUpperCase() || '?'}
            </div>
            <div className={`profile-avatar-badge ${user.role}`}>
              {roleMeta.icon}
            </div>
          </div>

          {/* Info */}
          <div className="profile-meta">
            <h1 className="profile-name">{user.firstName} {user.lastName}</h1>
            <p className="profile-email">📧 {user.email}</p>
            <span className={`profile-role-badge ${user.role}`}>
              {roleMeta.label}
            </span>
            <p className="profile-since">📅 Miembro desde {joinDate}</p>
          </div>
        </div>
      </div>

      {/* ── BODY ── */}
      <div className="profile-body">

        {/* ── MAIN COLUMN ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          {/* Toast */}
          {toast && (
            <div className={`profile-toast ${toast.type}`}>
              {toast.type === 'success' ? '✅' : '❌'} {toast.msg}
            </div>
          )}

          {/* Info / Edit Card */}
          <div className="profile-card">
            <div className="profile-card-header">
              <h2 className="profile-card-title">👤 Información Personal</h2>
              {!isEditing && (
                <button className="btn-edit-profile" onClick={() => setIsEditing(true)}>
                  ✏️ Editar
                </button>
              )}
            </div>

            <div className="profile-card-body">
              {!isEditing ? (
                /* ── VIEW MODE ── */
                <div className="info-grid">
                  <div className="info-field">
                    <span className="info-label">Nombre</span>
                    <span className="info-value">{user.firstName}</span>
                  </div>

                  <div className="info-field">
                    <span className="info-label">Apellido</span>
                    <span className="info-value">{user.lastName}</span>
                  </div>

                  <div className="info-field full">
                    <span className="info-label">Correo electrónico</span>
                    <div className="info-email">
                      <span className="info-email-icon">📧</span>
                      {user.email}
                      <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: 'var(--success-text)', fontWeight: 600 }}>
                        ✓ Verificado
                      </span>
                    </div>
                  </div>

                  <div className="info-field">
                    <span className="info-label">Rol en la plataforma</span>
                    <span className={`profile-role-badge ${user.role}`} style={{ marginTop: '0.25rem' }}>
                      {roleMeta.label}
                    </span>
                  </div>

                  <div className="info-field">
                    <span className="info-label">ID de Usuario</span>
                    <span className="info-value" style={{ color: 'var(--text-muted)', fontFamily: 'monospace', fontSize: '0.85rem' }}>
                      #{user.id || '—'}
                    </span>
                  </div>
                </div>
              ) : (
                /* ── EDIT MODE ── */
                <form className="edit-form" onSubmit={handleSubmit}>
                  <div className="edit-hint">
                    ℹ️ Solo puedes editar tu nombre y apellido. El email y el rol no son modificables.
                  </div>

                  <div className="edit-row">
                    <div className="edit-group">
                      <label className="edit-label">Nombre</label>
                      <input
                        className="edit-input"
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        placeholder="Tu nombre"
                        autoFocus
                      />
                    </div>
                    <div className="edit-group">
                      <label className="edit-label">Apellido</label>
                      <input
                        className="edit-input"
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        placeholder="Tu apellido"
                      />
                    </div>
                  </div>

                  <div className="edit-group">
                    <label className="edit-label">Correo electrónico</label>
                    <input
                      className="edit-input"
                      type="email"
                      value={user.email}
                      disabled
                      style={{ opacity: 0.55, cursor: 'not-allowed' }}
                    />
                  </div>

                  <div className="edit-actions">
                    <button
                      type="submit"
                      className="btn-save-profile"
                      disabled={loading}
                    >
                      {loading
                        ? <><span className="spinner spinner-sm" /> Guardando…</>
                        : '💾 Guardar cambios'}
                    </button>
                    <button type="button" className="btn-cancel-edit" onClick={cancelEdit}>
                      Cancelar
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* Security Card */}
          <div className="profile-card">
            <div className="profile-card-header">
              <h2 className="profile-card-title">🔐 Estado de Seguridad</h2>
            </div>
            <div className="profile-card-body">
              <div className="security-items">
                <div className="security-item">
                  <div className="security-icon">🔒</div>
                  <div className="security-text">
                    <span className="security-label">Contraseña</span>
                    <span className="security-sub">Cifrada con bcrypt (salt rounds: 12)</span>
                  </div>
                  <span className="security-status ok">Segura</span>
                </div>

                <div className="security-item">
                  <div className="security-icon">🎫</div>
                  <div className="security-text">
                    <span className="security-label">Sesión activa</span>
                    <span className="security-sub">Token JWT · Expira en 30 min de inactividad</span>
                  </div>
                  <span className="security-status ok">Activa</span>
                </div>

                <div className="security-item">
                  <div className="security-icon warning">🛡️</div>
                  <div className="security-text">
                    <span className="security-label">Autenticación 2 factores</span>
                    <span className="security-sub">Añade una capa extra de seguridad</span>
                  </div>
                  <span className="security-status warning">Pendiente</span>
                </div>

                <div className="security-item">
                  <div className="security-icon info">📋</div>
                  <div className="security-text">
                    <span className="security-label">Auditoría de accesos</span>
                    <span className="security-sub">Todos los eventos de login son registrados</span>
                  </div>
                  <span className="security-status ok">Activa</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── SIDEBAR ── */}
        <div className="profile-sidebar">

          {/* Quick Actions */}
          <div className="profile-card">
            <div className="profile-card-header">
              <h2 className="profile-card-title">⚡ Accesos Rápidos</h2>
            </div>
            <div className="profile-card-body" style={{ padding: '1rem 1.25rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <button className="quick-action" onClick={() => history.push('/dashboard')}>
                  <div className="quick-action-icon blue">📊</div>
                  <div className="quick-action-text">
                    <span className="quick-action-label">Dashboard</span>
                    <span className="quick-action-sub">Ver cursos disponibles</span>
                  </div>
                  <span className="quick-action-arrow">›</span>
                </button>

                <button className="quick-action" onClick={() => history.push('/certificates')}>
                  <div className="quick-action-icon amber">🏆</div>
                  <div className="quick-action-text">
                    <span className="quick-action-label">Mis Certificados</span>
                    <span className="quick-action-sub">Ver y descargar logros</span>
                  </div>
                  <span className="quick-action-arrow">›</span>
                </button>

                {user.role === 'admin' && (
                  <button className="quick-action" onClick={() => history.push('/admin/users')}>
                    <div className="quick-action-icon blue">⚙️</div>
                    <div className="quick-action-text">
                      <span className="quick-action-label">Administración</span>
                      <span className="quick-action-sub">Gestionar usuarios</span>
                    </div>
                    <span className="quick-action-arrow">›</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Account Info */}
          <div className="profile-card">
            <div className="profile-card-header">
              <h2 className="profile-card-title">📋 Datos de la Cuenta</h2>
            </div>
            <div className="profile-card-body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {[
                  { label: 'Nombre completo', value: `${user.firstName} ${user.lastName}` },
                  { label: 'Email',           value: user.email },
                  { label: 'Rol',             value: roleMeta.label },
                  { label: 'ID',              value: `#${user.id || '—'}`, mono: true },
                ].map((item, i) => (
                  <div key={i}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.05em' }}>
                      {item.label}
                    </span>
                    <p style={{
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      color: 'var(--text-primary)',
                      marginTop: '0.2rem',
                      fontFamily: item.mono ? 'monospace' : 'inherit',
                      wordBreak: 'break-all',
                    }}>
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
