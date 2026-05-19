import React, { useState, useEffect, useCallback } from 'react';
import { useHistory } from 'react-router-dom';
import { useAuth } from '../context/authStore';
import { useToast } from '../context/toastStore';
import { courseAPI } from '../services/api';
import '../styles/course-management.css';

// ─── Constantes ───────────────────────────────────────────────────────────────
const CATEGORIES = [
  'Fundamentos', 'Seguridad de Usuario', 'Desarrollo Seguro',
  'Criptografía', 'Redes', 'OWASP', 'Hacking Ético', 'Compliance', 'Otro',
];

const LEVELS = [
  { value: 'beginner',     label: '🟢 Principiante' },
  { value: 'intermediate', label: '🟡 Intermedio'   },
  { value: 'advanced',     label: '🔴 Avanzado'     },
];

const EMPTY_FORM = {
  title: '', description: '', category: '', level: 'beginner', durationMinutes: 60,
};

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function CourseSkeleton() {
  return (
    <div className="cm-course-card skeleton-card">
      <div className="skeleton-card-top" />
      <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <div className="skeleton skeleton-title" style={{ width: '65%' }} />
        <div className="skeleton skeleton-text" />
        <div className="skeleton skeleton-text" style={{ width: '80%' }} />
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
          <div className="skeleton skeleton-badge" />
          <div className="skeleton skeleton-badge" />
        </div>
      </div>
    </div>
  );
}

// ─── Tarjeta de curso ─────────────────────────────────────────────────────────
function CourseCard({ course, onEdit, onDelete, onTogglePublish, currentUserId, userRole, deletingId }) {
  const levelColors = { beginner: '#22c55e', intermediate: '#f59e0b', advanced: '#ef4444' };
  const levelLabel  = { beginner: '🟢 Principiante', intermediate: '🟡 Intermedio', advanced: '🔴 Avanzado' };

  return (
    <div className={`cm-course-card ${course.isPublished ? 'published' : 'draft'}`}>
      <div className="cm-card-top" style={{ background: levelColors[course.level] || '#4f46e5' }} />

      <div className="cm-card-body">
        <div className="cm-card-status">
          <span className={`cm-status-badge ${course.isPublished ? 'published' : 'draft'}`}>
            {course.isPublished ? '✅ Publicado' : '📝 Borrador'}
          </span>
          <span className="cm-level-badge">{levelLabel[course.level] || course.level}</span>
        </div>

        <h3 className="cm-card-title">{course.title}</h3>
        <p className="cm-card-desc">{course.description || 'Sin descripción'}</p>

        <div className="cm-card-meta">
          <span className="cm-meta-item">🏷️ {course.category}</span>
          <span className="cm-meta-item">⏱ {course.durationMinutes} min</span>
          {course.instructorName && (
            <span className="cm-meta-item">👤 {course.instructorName}</span>
          )}
        </div>

        <div className="cm-card-actions">
          <button className="cm-btn-edit" onClick={() => onEdit(course)}>
            ✏️ Editar
          </button>
          <button
            className={`cm-btn-publish ${course.isPublished ? 'unpublish' : 'publish'}`}
            onClick={() => onTogglePublish(course)}
          >
            {course.isPublished ? '⬇️ Despublicar' : '🚀 Publicar'}
          </button>
          <button
            className={`cm-btn-delete${deletingId === course.id ? ' confirming' : ''}`}
            onClick={() => onDelete(course)}
          >
            {deletingId === course.id ? '⚠️ ¿Confirmar?' : '🗑️'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Panel lateral de formulario ──────────────────────────────────────────────
function CourseFormPanel({ isOpen, onClose, onSave, editingCourse, saving }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (editingCourse) {
      setForm({
        title:           editingCourse.title           || '',
        description:     editingCourse.description     || '',
        category:        editingCourse.category        || '',
        level:           editingCourse.level           || 'beginner',
        durationMinutes: editingCourse.durationMinutes || 60,
      });
    } else {
      setForm(EMPTY_FORM);
    }
    setErrors({});
  }, [editingCourse, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!form.title.trim())    errs.title    = 'El título es requerido';
    if (!form.category)        errs.category = 'Selecciona una categoría';
    if (form.durationMinutes < 1) errs.durationMinutes = 'La duración debe ser mayor a 0';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSave({ ...form, durationMinutes: parseInt(form.durationMinutes) });
  };

  return (
    <>
      {/* Overlay */}
      <div className={`cm-overlay ${isOpen ? 'open' : ''}`} onClick={onClose} />

      {/* Panel */}
      <div className={`cm-panel ${isOpen ? 'open' : ''}`}>
        <div className="cm-panel-header">
          <h2>{editingCourse ? '✏️ Editar Curso' : '➕ Nuevo Curso'}</h2>
          <button className="cm-panel-close" onClick={onClose}>×</button>
        </div>

        <form className="cm-form" onSubmit={handleSubmit}>

          {/* Título */}
          <div className="cm-form-group">
            <label className="cm-label">Título del curso *</label>
            <input
              className={`cm-input ${errors.title ? 'error' : ''}`}
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Ej: Introducción a OWASP Top 10"
              maxLength={120}
            />
            {errors.title && <span className="cm-field-error">{errors.title}</span>}
            <span className="cm-char-count">{form.title.length}/120</span>
          </div>

          {/* Descripción */}
          <div className="cm-form-group">
            <label className="cm-label">Descripción</label>
            <textarea
              className="cm-input cm-textarea"
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="¿Qué aprenderán los estudiantes en este curso?"
              rows={4}
              maxLength={600}
            />
            <span className="cm-char-count">{form.description.length}/600</span>
          </div>

          {/* Categoría */}
          <div className="cm-form-group">
            <label className="cm-label">Categoría *</label>
            <select
              className={`cm-input ${errors.category ? 'error' : ''}`}
              name="category"
              value={form.category}
              onChange={handleChange}
            >
              <option value="">— Seleccionar categoría —</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            {errors.category && <span className="cm-field-error">{errors.category}</span>}
          </div>

          {/* Nivel + Duración */}
          <div className="cm-form-row">
            <div className="cm-form-group">
              <label className="cm-label">Nivel</label>
              <select className="cm-input" name="level" value={form.level} onChange={handleChange}>
                {LEVELS.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
              </select>
            </div>

            <div className="cm-form-group">
              <label className="cm-label">Duración (minutos)</label>
              <input
                className={`cm-input ${errors.durationMinutes ? 'error' : ''}`}
                type="number"
                name="durationMinutes"
                value={form.durationMinutes}
                onChange={handleChange}
                min={1}
                max={9999}
              />
              {errors.durationMinutes && <span className="cm-field-error">{errors.durationMinutes}</span>}
            </div>
          </div>

          {/* Preview */}
          <div className="cm-preview-box">
            <p className="cm-preview-label">Vista previa</p>
            <strong>{form.title || 'Título del curso'}</strong>
            <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0.25rem 0 0' }}>
              {form.category || 'Categoría'} · {form.level} · {form.durationMinutes} min
            </p>
          </div>

          <div className="cm-form-actions">
            <button type="button" className="cm-btn-cancel" onClick={onClose} disabled={saving}>
              Cancelar
            </button>
            <button type="submit" className="cm-btn-save" disabled={saving}>
              {saving
                ? <><span className="spinner spinner-sm" /> Guardando…</>
                : editingCourse ? '💾 Guardar cambios' : '🚀 Crear curso'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

// ─── Página principal ─────────────────────────────────────────────────────────
export default function CourseManagementPage() {
  const history = useHistory();
  const { user } = useAuth();
  const toast = useToast();

  const [courses,      setCourses]      = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [panelOpen,    setPanelOpen]    = useState(false);
  const [editingCourse,setEditingCourse]= useState(null);
  const [saving,       setSaving]       = useState(false);
  const [deletingId,   setDeletingId]   = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [search,       setSearch]       = useState('');

  // ─── Cargar cursos ───────────────────────────────────────────────────────
  const loadCourses = useCallback(async () => {
    setLoading(true);
    try {
      const data = await courseAPI.listAll();
      setCourses(data.courses || []);
    } catch (err) {
      toast.error(err.message || 'Error cargando cursos');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!user || !['admin', 'instructor'].includes(user.role)) {
      history.push('/dashboard');
      return;
    }
    loadCourses();
  }, [user, history, loadCourses]);

  // ─── Crear / Editar ──────────────────────────────────────────────────────
  const openCreate = () => { setEditingCourse(null); setPanelOpen(true); };
  const openEdit   = (c)  => { setEditingCourse(c);  setPanelOpen(true); };
  const closePanel = ()   => { setPanelOpen(false);  setEditingCourse(null); };

  const handleSave = async (formData) => {
    setSaving(true);
    try {
      if (editingCourse) {
        const res = await courseAPI.update(editingCourse.uuid, formData);
        setCourses(prev => prev.map(c => c.id === editingCourse.id ? res.course : c));
        toast.success('Curso actualizado correctamente');
      } else {
        const res = await courseAPI.create(formData);
        setCourses(prev => [res.course, ...prev]);
        toast.success('Curso creado. Recuerda publicarlo cuando esté listo.');
      }
      closePanel();
    } catch (err) {
      toast.error(err.message || 'Error al guardar el curso');
    } finally {
      setSaving(false);
    }
  };

  // ─── Publicar / Despublicar ──────────────────────────────────────────────
  const handleTogglePublish = async (course) => {
    try {
      await courseAPI.togglePublish(course.uuid, !course.isPublished);
      setCourses(prev => prev.map(c =>
        c.id === course.id ? { ...c, isPublished: !c.isPublished } : c
      ));
      toast.success(course.isPublished ? 'Curso despublicado' : '¡Curso publicado! Ya visible para estudiantes.');
    } catch (err) {
      toast.error(err.message || 'Error al cambiar estado del curso');
    }
  };

  // ─── Eliminar (doble confirmación) ───────────────────────────────────────
  const handleDelete = async (course) => {
    if (deletingId !== course.id) {
      setDeletingId(course.id);
      toast.warning('Pulsa "Eliminar" de nuevo para confirmar. Se borrarán también las inscripciones.');
      setTimeout(() => setDeletingId(null), 5000);
      return;
    }
    try {
      await courseAPI.delete(course.uuid);
      setCourses(prev => prev.filter(c => c.id !== course.id));
      setDeletingId(null);
      toast.success('Curso eliminado correctamente');
    } catch (err) {
      toast.error(err.message || 'Error al eliminar el curso');
    }
  };

  // ─── Filtros ─────────────────────────────────────────────────────────────
  const filtered = courses.filter(c => {
    const q = search.toLowerCase();
    const matchSearch = c.title.toLowerCase().includes(q) || c.category?.toLowerCase().includes(q);
    const matchStatus =
      filterStatus === 'all'      ? true :
      filterStatus === 'published'? c.isPublished :
      !c.isPublished;
    return matchSearch && matchStatus;
  });

  const stats = {
    total:     courses.length,
    published: courses.filter(c => c.isPublished).length,
    drafts:    courses.filter(c => !c.isPublished).length,
  };

  return (
    <div className="cm-page">
      <div className="cm-inner">

        {/* ── Header ── */}
        <div className="cm-header">
          <div>
            <h1>📚 Gestión de Cursos</h1>
            <p>Crea, edita y publica cursos de ciberseguridad</p>
          </div>
          <div className="cm-header-actions">
            <button className="cm-btn-reload" onClick={loadCourses} title="Actualizar">🔄</button>
            <button className="cm-btn-back" onClick={() => history.push('/dashboard')}>← Volver</button>
            <button className="cm-btn-create" onClick={openCreate}>➕ Nuevo Curso</button>
          </div>
        </div>

        {/* ── Stats ── */}
        <div className="cm-stats">
          {[
            { icon: '📚', label: 'Total',     value: stats.total,     color: 'blue'  },
            { icon: '✅', label: 'Publicados', value: stats.published, color: 'green' },
            { icon: '📝', label: 'Borradores', value: stats.drafts,    color: 'amber' },
          ].map((s, i) => (
            <div className="cm-stat-card" key={i}>
              <div className={`cm-stat-icon ${s.color}`}>{s.icon}</div>
              <div>
                <span className="cm-stat-value">{loading ? '—' : s.value}</span>
                <span className="cm-stat-label">{s.label}</span>
              </div>
            </div>
          ))}
        </div>

        {/* ── Filtros ── */}
        <div className="cm-filters">
          <div className="cm-search-wrap">
            <span>🔍</span>
            <input
              type="text"
              placeholder="Buscar por título o categoría…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="cm-search"
            />
          </div>
          <div className="cm-filter-tabs">
            {[
              { key: 'all',       label: 'Todos'      },
              { key: 'published', label: '✅ Publicados'},
              { key: 'draft',     label: '📝 Borradores'},
            ].map(tab => (
              <button
                key={tab.key}
                className={`cm-tab ${filterStatus === tab.key ? 'active' : ''}`}
                onClick={() => setFilterStatus(tab.key)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Grid de cursos ── */}
        {loading ? (
          <div className="cm-grid">
            {[1,2,3,4,5,6].map(i => <CourseSkeleton key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="cm-empty">
            <div className="cm-empty-icon">📭</div>
            <h3>{search || filterStatus !== 'all' ? 'No hay cursos con ese filtro' : 'No tienes cursos aún'}</h3>
            <p>{search || filterStatus !== 'all'
              ? 'Prueba con otro término o cambia el filtro'
              : 'Crea tu primer curso de ciberseguridad'}
            </p>
            {!search && filterStatus === 'all' && (
              <button className="cm-btn-create" onClick={openCreate}>➕ Crear primer curso</button>
            )}
          </div>
        ) : (
          <div className="cm-grid">
            {filtered.map(course => (
              <CourseCard
                key={course.id}
                course={course}
                onEdit={openEdit}
                onDelete={handleDelete}
                onTogglePublish={handleTogglePublish}
                currentUserId={user?.id}
                userRole={user?.role}
                deletingId={deletingId}
              />
            ))}
          </div>
        )}

        <p className="cm-count-label">
          {!loading && `${filtered.length} de ${courses.length} cursos`}
        </p>
      </div>

      {/* ── Panel lateral ── */}
      <CourseFormPanel
        isOpen={panelOpen}
        onClose={closePanel}
        onSave={handleSave}
        editingCourse={editingCourse}
        saving={saving}
      />
    </div>
  );
}
