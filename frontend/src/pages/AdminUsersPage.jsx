import React, { useState, useEffect, useCallback } from 'react';
import { useHistory } from 'react-router-dom';
import { useAuth } from '../context/authStore';
import { useToast } from '../context/toastStore';
import { userAPI } from '../services/api';
import '../styles/admin.css';

const ROLE_META = {
  admin:      { label: '👑 Admin',      cls: 'role-admin'      },
  instructor: { label: '🎓 Instructor', cls: 'role-instructor' },
  student:    { label: '👤 Estudiante', cls: 'role-student'    },
};

// ─── Skeleton fila de tabla ────────────────────────────────────────────────────
function TableRowSkeleton() {
  return (
    <tr>
      <td><div className="skeleton skeleton-text" style={{ width: '80%' }} /></td>
      <td><div className="skeleton skeleton-text" style={{ width: '60%' }} /></td>
      <td><div className="skeleton skeleton-badge" /></td>
      <td><div className="skeleton skeleton-badge" style={{ width: '4rem' }} /></td>
      <td><div className="skeleton skeleton-text" style={{ width: '5rem' }} /></td>
      <td>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <div className="skeleton skeleton-btn" style={{ width: '5rem' }} />
          <div className="skeleton skeleton-btn" style={{ width: '5.5rem' }} />
        </div>
      </td>
    </tr>
  );
}

export default function AdminUsersPage() {
  const history  = useHistory();
  const { user } = useAuth();
  const toast    = useToast();

  const [users,       setUsers]       = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [editingId,   setEditingId]   = useState(null);
  const [editData,    setEditData]    = useState({});
  const [searchTerm,  setSearchTerm]  = useState('');
  const [filterRole,  setFilterRole]  = useState('all');
  const [deletingId,  setDeletingId]  = useState(null);
  const [savingId,    setSavingId]    = useState(null);

  // ─── Cargar usuarios desde la API ─────────────────────────────────────────
  const loadUsers = useCallback(async () => {
    setLoadingData(true);
    try {
      const data = await userAPI.listUsers();
      setUsers(data.users || []);
    } catch (err) {
      toast.error(err.message || 'Error cargando usuarios');
    } finally {
      setLoadingData(false);
    }
  }, []);

  useEffect(() => {
    if (!user || user.role !== 'admin') { history.push('/dashboard'); return; }
    loadUsers();
  }, [user, history, loadUsers]);

  // ─── Edición ───────────────────────────────────────────────────────────────
  const handleEdit   = (u) => { setEditingId(u.id); setEditData({ ...u }); };
  const handleCancel = ()  => { setEditingId(null); setEditData({}); };
  const handleField  = (field, value) => setEditData(prev => ({ ...prev, [field]: value }));

  const handleSave = async (id) => {
    setSavingId(id);
    try {
      const result = await userAPI.updateUser(id, {
        firstName: editData.firstName,
        lastName:  editData.lastName,
        role:      editData.role,
        isActive:  editData.isActive,
      });
      setUsers(prev => prev.map(u => u.id === id ? result.user : u));
      setEditingId(null);
      toast.success('Usuario actualizado correctamente');
    } catch (err) {
      toast.error(err.message || 'Error al actualizar usuario');
    } finally {
      setSavingId(null);
    }
  };

  // ─── Eliminar con doble confirmación ──────────────────────────────────────
  const handleDelete = async (id) => {
    if (deletingId !== id) {
      setDeletingId(id);
      toast.warning('Pulsa "Eliminar" de nuevo para confirmar');
      setTimeout(() => setDeletingId(null), 5000);
      return;
    }
    // Segunda pulsación: confirmar
    try {
      await userAPI.deleteUser(id);
      setUsers(prev => prev.filter(u => u.id !== id));
      setDeletingId(null);
      toast.success('Usuario eliminado correctamente');
    } catch (err) {
      toast.error(err.message || 'Error al eliminar usuario');
    }
  };

  // ─── Filtros ───────────────────────────────────────────────────────────────
  const filtered = users.filter(u => {
    const q = searchTerm.toLowerCase();
    const matchSearch = u.email.toLowerCase().includes(q)
      || u.firstName.toLowerCase().includes(q)
      || u.lastName.toLowerCase().includes(q);
    const matchRole = filterRole === 'all' || u.role === filterRole;
    return matchSearch && matchRole;
  });

  const counts = {
    total:      users.length,
    admin:      users.filter(u => u.role === 'admin').length,
    instructor: users.filter(u => u.role === 'instructor').length,
    student:    users.filter(u => u.role === 'student').length,
  };

  // ─── Formato de fecha ──────────────────────────────────────────────────────
  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    try { return new Date(dateStr).toLocaleDateString('es', { day: '2-digit', month: 'short', year: 'numeric' }); }
    catch { return dateStr; }
  };

  return (
    <div className="admin-container">
      <div className="admin-inner">

        {/* Header */}
        <div className="admin-header">
          <div className="admin-title-group">
            <h1>⚙️ Gestión de Usuarios</h1>
            <p>Administra los usuarios, roles y permisos de la plataforma</p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              className="btn-back"
              onClick={loadUsers}
              title="Recargar lista"
              style={{ background: 'var(--primary-bg)', color: 'var(--primary)', border: '1px solid rgba(79,70,229,0.2)' }}
            >
              🔄 Actualizar
            </button>
            <button className="btn-back" onClick={() => history.push('/dashboard')}>
              ← Volver
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="admin-stats">
          {[
            { icon: '👥', label: 'Total Usuarios',  value: counts.total,      color: 'purple' },
            { icon: '👑', label: 'Administradores', value: counts.admin,      color: 'red'    },
            { icon: '🎓', label: 'Instructores',    value: counts.instructor, color: 'amber'  },
            { icon: '👤', label: 'Estudiantes',     value: counts.student,    color: 'green'  },
          ].map((s, i) => (
            <div className="admin-stat-card" key={i}>
              <div className={`stat-icon-wrap ${s.color}`}>{s.icon}</div>
              <div className="stat-info">
                <span className="stat-value">{loadingData ? '—' : s.value}</span>
                <span className="stat-label">{s.label}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="admin-filters">
          <div className="admin-search-wrap">
            <span className="admin-search-icon">🔍</span>
            <input
              type="text"
              placeholder="Buscar por nombre o email…"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="admin-search"
            />
          </div>
          <select
            value={filterRole}
            onChange={e => setFilterRole(e.target.value)}
            className="admin-filter-role"
          >
            <option value="all">Todos los roles</option>
            <option value="admin">Admin</option>
            <option value="instructor">Instructor</option>
            <option value="student">Estudiante</option>
          </select>
        </div>

        {/* Table */}
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Email</th>
                <th>Nombre</th>
                <th>Rol</th>
                <th>Estado</th>
                <th>Registro</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loadingData ? (
                [1, 2, 3].map(i => <TableRowSkeleton key={i} />)
              ) : filtered.length === 0 ? (
                <tr><td colSpan="6" className="table-empty">No se encontraron usuarios</td></tr>
              ) : (
                filtered.map(u => (
                  <tr key={u.id} className={editingId === u.id ? 'editing' : ''}>
                    {editingId === u.id ? (
                      <>
                        <td>
                          <input
                            type="email"
                            value={editData.email}
                            disabled
                            className="edit-input"
                            style={{ opacity: 0.5, cursor: 'not-allowed' }}
                          />
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <input type="text" value={editData.firstName} onChange={e => handleField('firstName', e.target.value)} placeholder="Nombre"   className="edit-input" />
                            <input type="text" value={editData.lastName}  onChange={e => handleField('lastName',  e.target.value)} placeholder="Apellido" className="edit-input" />
                          </div>
                        </td>
                        <td>
                          <select value={editData.role} onChange={e => handleField('role', e.target.value)} className="edit-select">
                            <option value="student">👤 Estudiante</option>
                            <option value="instructor">🎓 Instructor</option>
                            <option value="admin">👑 Admin</option>
                          </select>
                        </td>
                        <td>
                          <label className="switch">
                            <input type="checkbox" checked={editData.isActive} onChange={e => handleField('isActive', e.target.checked)} />
                            <span className="slider"></span>
                          </label>
                        </td>
                        <td style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>{formatDate(u.createdAt)}</td>
                        <td>
                          <div className="action-buttons">
                            <button
                              className="btn-save"
                              onClick={() => handleSave(u.id)}
                              disabled={savingId === u.id}
                            >
                              {savingId === u.id ? '⏳' : '💾'} Guardar
                            </button>
                            <button className="btn-cancel" onClick={handleCancel}>✕ Cancelar</button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{u.email}</td>
                        <td style={{ fontWeight: 600 }}>{u.firstName} {u.lastName}</td>
                        <td>
                          <span className={`role-badge ${ROLE_META[u.role]?.cls}`}>
                            {ROLE_META[u.role]?.label || u.role}
                          </span>
                        </td>
                        <td>
                          <span className={u.isActive ? 'status-active' : 'status-inactive'}>
                            {u.isActive ? '● Activo' : '● Inactivo'}
                          </span>
                        </td>
                        <td style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>{formatDate(u.createdAt)}</td>
                        <td>
                          <div className="action-buttons">
                            <button className="btn-edit" onClick={() => handleEdit(u)}>✏️ Editar</button>
                            {u.id !== user?.id && (
                              <button
                                className={`btn-delete${deletingId === u.id ? ' confirming' : ''}`}
                                onClick={() => handleDelete(u.id)}
                              >
                                {deletingId === u.id ? '⚠️ ¿Confirmar?' : '🗑️ Eliminar'}
                              </button>
                            )}
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <p style={{ textAlign: 'right', color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.5rem' }}>
          {!loadingData && `${filtered.length} de ${users.length} usuarios`}
        </p>

      </div>
    </div>
  );
}
