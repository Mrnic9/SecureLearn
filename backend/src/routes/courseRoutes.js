const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { get, all, run } = require('../config/database');
const { authMiddleware, requireRole } = require('../middleware/authMiddleware');

const router = express.Router();

// Listar cursos
router.get('/', async (req, res) => {
  try {
    const courses = await all(
      `SELECT id, uuid, title, description, category, level, duration_minutes, is_published
       FROM courses WHERE is_published = 1 ORDER BY created_at DESC`
    );

    const formatted = courses.map(c => ({
      id: c.id,
      uuid: c.uuid,
      title: c.title,
      description: c.description,
      category: c.category,
      level: c.level,
      durationMinutes: c.duration_minutes,
      isPublished: c.is_published === 1
    }));

    res.json({ courses: formatted, total: formatted.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Obtener detalles de un curso
router.get('/:id', async (req, res) => {
  try {
    const course = await get(
      `SELECT id, uuid, title, description, category, level, duration_minutes, is_published
       FROM courses WHERE uuid = ? OR id = ?`,
      [req.params.id, parseInt(req.params.id) || null]
    );

    if (!course) {
      return res.status(404).json({ error: 'Curso no encontrado' });
    }

    res.json({
      id: course.id,
      uuid: course.uuid,
      title: course.title,
      description: course.description,
      category: course.category,
      level: course.level,
      durationMinutes: course.duration_minutes,
      isPublished: course.is_published === 1
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Crear curso (solo instructores y admin)
router.post('/', authMiddleware, requireRole('instructor', 'admin'), async (req, res) => {
  try {
    const { title, description, category, level, durationMinutes } = req.body;

    if (!title || !category) {
      return res.status(400).json({ error: 'title y category son requeridos' });
    }

    const courseId = uuidv4();
    const result = await new Promise((resolve, reject) => {
      const db = require('../config/database').db;
      db.run(
        `INSERT INTO courses (uuid, title, description, category, level, duration_minutes, instructor_id, is_published)
         VALUES (?, ?, ?, ?, ?, ?, ?, 0)`,
        [courseId, title, description, category, level || 'beginner', durationMinutes || 60, req.user.id],
        function(err) {
          if (err) reject(err);
          else resolve({ id: this.lastID });
        }
      );
    });

    res.status(201).json({
      message: 'Curso creado exitosamente',
      course: {
        id: result.id,
        uuid: courseId,
        title,
        category,
        level: level || 'beginner'
      }
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Inscribirse a un curso
router.post('/:id/enroll', authMiddleware, async (req, res) => {
  try {
    const course = await get(
      'SELECT id FROM courses WHERE uuid = ? OR id = ?',
      [req.params.id, parseInt(req.params.id) || null]
    );

    if (!course) {
      return res.status(404).json({ error: 'Curso no encontrado' });
    }

    const existing = await get(
      'SELECT id FROM enrollments WHERE user_id = ? AND course_id = ?',
      [req.user.id, course.id]
    );

    if (existing) {
      return res.status(400).json({ error: 'Ya estás inscrito en este curso' });
    }

    await run(
      'INSERT INTO enrollments (user_id, course_id) VALUES (?, ?)',
      [req.user.id, course.id]
    );

    res.status(201).json({ message: 'Inscripción exitosa' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Obtener progreso del usuario en un curso
router.get('/:id/progress', authMiddleware, async (req, res) => {
  try {
    const enrollment = await get(
      `SELECT progress_percentage, completed_at FROM enrollments
       WHERE user_id = ? AND course_id IN (SELECT id FROM courses WHERE uuid = ? OR id = ?)`,
      [req.user.id, req.params.id, parseInt(req.params.id) || null]
    );

    if (!enrollment) {
      return res.status(404).json({ error: 'No estás inscrito en este curso' });
    }

    res.json({
      progressPercentage: enrollment.progress_percentage,
      completedAt: enrollment.completed_at
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
