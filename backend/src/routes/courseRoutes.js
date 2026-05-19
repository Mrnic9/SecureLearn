const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { db, get, all, run } = require('../config/database');
const { authMiddleware, requireRole } = require('../middleware/authMiddleware');
const securityLogger = require('../services/securityLogger');

const router = express.Router();

// ─── Helper formato de curso ───────────────────────────────────────────────────
const formatCourse = (c) => ({
  id:              c.id,
  uuid:            c.uuid,
  title:           c.title,
  description:     c.description,
  category:        c.category,
  level:           c.level,
  durationMinutes: c.duration_minutes,
  isPublished:     c.is_published === 1,
  instructorId:    c.instructor_id,
  instructorName:  c.instructor_name || null,
  createdAt:       c.created_at,
  updatedAt:       c.updated_at,
});

// ─── GET /api/courses  — cursos publicados (público) ──────────────────────────
router.get('/', async (req, res) => {
  try {
    const courses = await all(
      `SELECT c.*, u.first_name || ' ' || u.last_name AS instructor_name
       FROM courses c
       LEFT JOIN users u ON c.instructor_id = u.id
       WHERE c.is_published = 1
       ORDER BY c.created_at DESC`
    );
    res.json({ courses: courses.map(formatCourse), total: courses.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── GET /api/courses/all — TODOS los cursos (admin / instructor) ──────────────
router.get('/all', authMiddleware, requireRole('admin', 'instructor'), async (req, res) => {
  try {
    const whereClause = req.user.role === 'instructor'
      ? 'WHERE c.instructor_id = ?'
      : '';
    const params = req.user.role === 'instructor' ? [req.user.id] : [];

    const courses = await all(
      `SELECT c.*, u.first_name || ' ' || u.last_name AS instructor_name
       FROM courses c
       LEFT JOIN users u ON c.instructor_id = u.id
       ${whereClause}
       ORDER BY c.created_at DESC`,
      params
    );
    res.json({ courses: courses.map(formatCourse), total: courses.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── GET /api/courses/:id — detalle de un curso ───────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const course = await get(
      `SELECT c.*, u.first_name || ' ' || u.last_name AS instructor_name
       FROM courses c
       LEFT JOIN users u ON c.instructor_id = u.id
       WHERE c.uuid = ? OR c.id = ?`,
      [req.params.id, parseInt(req.params.id) || null]
    );
    if (!course) return res.status(404).json({ error: 'Curso no encontrado' });
    res.json(formatCourse(course));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── POST /api/courses — crear curso ─────────────────────────────────────────
router.post('/', authMiddleware, requireRole('instructor', 'admin'), async (req, res) => {
  const { title, description, category, level, durationMinutes } = req.body;

  if (!title || !title.trim()) return res.status(400).json({ error: 'El título es requerido' });
  if (!category)               return res.status(400).json({ error: 'La categoría es requerida' });

  try {
    const courseUuid = uuidv4();
    const result = await new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO courses (uuid, title, description, category, level, duration_minutes, instructor_id, is_published)
         VALUES (?, ?, ?, ?, ?, ?, ?, 0)`,
        [courseUuid, title.trim(), description || '', category, level || 'beginner', durationMinutes || 60, req.user.id],
        function(err) { if (err) reject(err); else resolve({ id: this.lastID }); }
      );
    });

    const created = await get('SELECT * FROM courses WHERE id = ?', [result.id]);
    securityLogger.info('course_created', { courseId: result.id, instructorId: req.user.id, title });

    res.status(201).json({ message: 'Curso creado exitosamente', course: formatCourse(created) });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ─── PUT /api/courses/:id — actualizar curso ──────────────────────────────────
router.put('/:id', authMiddleware, requireRole('instructor', 'admin'), async (req, res) => {
  const { title, description, category, level, durationMinutes } = req.body;

  try {
    const course = await get('SELECT * FROM courses WHERE uuid = ? OR id = ?',
      [req.params.id, parseInt(req.params.id) || null]);
    if (!course) return res.status(404).json({ error: 'Curso no encontrado' });

    // Instructores solo editan sus propios cursos
    if (req.user.role === 'instructor' && course.instructor_id !== req.user.id) {
      return res.status(403).json({ error: 'No puedes editar este curso' });
    }

    await run(
      `UPDATE courses SET
        title            = COALESCE(?, title),
        description      = COALESCE(?, description),
        category         = COALESCE(?, category),
        level            = COALESCE(?, level),
        duration_minutes = COALESCE(?, duration_minutes),
        updated_at       = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [title?.trim() || null, description ?? null, category || null, level || null, durationMinutes || null, course.id]
    );

    const updated = await get('SELECT * FROM courses WHERE id = ?', [course.id]);
    securityLogger.info('course_updated', { courseId: course.id, instructorId: req.user.id });
    res.json({ message: 'Curso actualizado', course: formatCourse(updated) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── PATCH /api/courses/:id/publish — publicar / despublicar ─────────────────
router.patch('/:id/publish', authMiddleware, requireRole('instructor', 'admin'), async (req, res) => {
  const { publish } = req.body; // true o false

  try {
    const course = await get('SELECT * FROM courses WHERE uuid = ? OR id = ?',
      [req.params.id, parseInt(req.params.id) || null]);
    if (!course) return res.status(404).json({ error: 'Curso no encontrado' });

    if (req.user.role === 'instructor' && course.instructor_id !== req.user.id) {
      return res.status(403).json({ error: 'No puedes publicar este curso' });
    }

    const newStatus = publish ? 1 : 0;
    await run('UPDATE courses SET is_published = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [newStatus, course.id]);

    securityLogger.info(publish ? 'course_published' : 'course_unpublished',
      { courseId: course.id, instructorId: req.user.id });

    res.json({ message: publish ? 'Curso publicado' : 'Curso despublicado', isPublished: !!publish });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── DELETE /api/courses/:id — eliminar curso ─────────────────────────────────
router.delete('/:id', authMiddleware, requireRole('instructor', 'admin'), async (req, res) => {
  try {
    const course = await get('SELECT * FROM courses WHERE uuid = ? OR id = ?',
      [req.params.id, parseInt(req.params.id) || null]);
    if (!course) return res.status(404).json({ error: 'Curso no encontrado' });

    if (req.user.role === 'instructor' && course.instructor_id !== req.user.id) {
      return res.status(403).json({ error: 'No puedes eliminar este curso' });
    }

    await run('DELETE FROM enrollments WHERE course_id = ?', [course.id]);
    await run('DELETE FROM courses WHERE id = ?', [course.id]);

    securityLogger.warn('course_deleted', { courseId: course.id, title: course.title, deletedBy: req.user.id });
    res.json({ message: 'Curso eliminado correctamente' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── POST /api/courses/:id/enroll ────────────────────────────────────────────
router.post('/:id/enroll', authMiddleware, async (req, res) => {
  try {
    const course = await get('SELECT id FROM courses WHERE uuid = ? OR id = ?',
      [req.params.id, parseInt(req.params.id) || null]);
    if (!course) return res.status(404).json({ error: 'Curso no encontrado' });

    const existing = await get('SELECT id FROM enrollments WHERE user_id = ? AND course_id = ?',
      [req.user.id, course.id]);
    if (existing) return res.status(400).json({ error: 'Ya estás inscrito en este curso' });

    await run('INSERT INTO enrollments (user_id, course_id) VALUES (?, ?)', [req.user.id, course.id]);
    res.status(201).json({ message: 'Inscripción exitosa' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── GET /api/courses/:id/progress ───────────────────────────────────────────
router.get('/:id/progress', authMiddleware, async (req, res) => {
  try {
    const enrollment = await get(
      `SELECT progress_percentage, completed_at FROM enrollments
       WHERE user_id = ? AND course_id IN (SELECT id FROM courses WHERE uuid = ? OR id = ?)`,
      [req.user.id, req.params.id, parseInt(req.params.id) || null]
    );
    if (!enrollment) return res.status(404).json({ error: 'No estás inscrito en este curso' });
    res.json({ progressPercentage: enrollment.progress_percentage, completedAt: enrollment.completed_at });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
