import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { useAuth } from '../context/authStore';
import { useToast } from '../context/toastStore';
import '../styles/admin.css';

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

const DEMO_USERS = [
  { id: 1, email: 'admin@securelearn.local',      firstName: 'Admin',  lastName: 'User',       role: 'admin',      isActive: true,  createdAt: new Date().toLocaleDateString() },
  { id: 2, email: 'instructor@securelearn.local', firstName: 'John',   lastName: 'Instructor',  role: 'instructor', isActive: true,  createdAt: new Date().toLocaleDateString() },
  { id: 3, email: 'student@securelearn.local',    firstName: 'Jane',   lastName: 'Student',     role: 'student',    isActive: true,  createdAt: new Date().toLocaleDateString() },
];

const ROLE_META = {
  admin:      { label: '👑 Admin',      cls: 'role-admin'      },
  instructor: { label: '🎓 Instructor', cls: 'role-instructor' },
  student:    { label: '👤 Estudiante', cls: 'role-student'    },
};

export default function AdminUsersPage() {
  const history  = useHistory();
  const { user } = useAuth();
  const toast    = useToast();

  const [users,      setUsers]      = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [editingId,  setEditingId]  = useState(null);
  const [editData,   setEditData]   = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [deletingId, setDeletingId] = useState(null); // para confirmación inline

  useEffect(() => {
    if (!user || user.role !== 'admin') { history.push('/dashboard'); return; }
    // Simular carga de datos (en un proyecto real sería fetch al backend)
    const t = setTimeout(() => {
      setUsers(DEMO_USERS);
      setLoadingData(false);
    }, 600);
    return () => clearTimeout(t);
  }, [user, history]);

  const handleEdit   = (u) => { setEditingId(u.id); setEditData({ ...u }); };
  const handleCancel = ()  => { setEditingId(null); setEditData({}); };

  const handleSave = (id) => {
    setUsers(prev => prev.map(u => u.id === id ? editData : u));
    setEditingId(null);
    toast.success('Usuario actualizado correctamente');
  };

  const handleDelete = (id) => {
    if (deletingId === id) {
      // Segunda pulsación = confirmado
      setUsers(prev => prev.filter(u => u.id !== id));
      setDeletingId(null);
      toast.success('Usuario eliminado correctamente');
    } else {
      // Primera pulsación = pedir confirmación
      setDeletingId(id);
      toast.warning('Pulsa "Eliminar" de nuevo para confirmar la eliminación');
      setTimeout(() => setDeletingId(null), 5000);
    }
  };

  const handleField = (field, value) => setEditData(prev => ({ ...prev, [field]: value }));

  const filtered = users.filter(u => {
    const q = searchTerm.toLowerCase();
    const matchSearch = u.email.toLowerCase().includes(q) || u.firstName.toLowerCase().includes(q) || u.lastName.toLowerCase().includes(q);
    const matchRole   = filterRole === 'all' || u.role === filterRole;
    return matchSearch && matchRole;
  });

  const counts = { total: users.length, admin: users.filter(u => u.role==='admin').length, instructor: users.filter(u => u.role==='instructor').length, student: users.filter(u => u.role==='student').length };

  return (
    <div className="admin-container">
      <div className="admin-inner">

        {/* Header */}
        <div className="admin-header">
          <div className="admin-title-group">
            <h1>⚙️ Gestión de Usuarios</h1>
            <p>Administra los usuarios, roles y permisos de la plataforma</p>
          </div>
          <button className="btn-back" onClick={() => history.push('/dashboard')}>
            ← Volver
          </button>
        </div>

        {/* Stats */}
        <div className="admin-stats">
          {[
            { icon: '👥', label: 'Total Usuarios', value: counts.total,      color: 'purple' },
            { icon: '👑', label: 'Administradores', value: counts.admin,     color: 'red'    },
            { icon: '🎓', label: 'Instructores',    value: counts.instructor, color: 'amber'  },
            { icon: '👤', label: 'Estudiantes',     value: counts.student,   color: 'green'  },
          ].map((s, i) => (
            <div className="admin-stat-card" key={i}>
              <div className={`stat-icon-wrap ${s.color}`}>{s.icon}</div>
              <div className="stat-info">
                <span className="stat-value">{s.value}</span>
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
                          <input type="email" value={editData.email} onChange={e => handleField('email', e.target.value)} className="edit-input" />
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
                        <td style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>{editData.createdAt}</td>
                        <td>
                          <div className="action-buttons">
                            <button className="btn-save"   onClick={() => handleSave(u.id)}>💾 Guardar</button>
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
                        <td style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>{u.createdAt}</td>
                        <td>
                          <div className="action-buttons">
                            <button className="btn-edit"   onClick={() => handleEdit(u)}>✏️ Editar</button>
                            <button
                              className={`btn-delete${deletingId === u.id ? ' confirming' : ''}`}
                              onClick={() => handleDelete(u.id)}
                            >
                              {deletingId === u.id ? '⚠️ ¿Confirmar?' : '🗑️ Eliminar'}
                            </button>
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

      </div>
    </div>
  );
}
