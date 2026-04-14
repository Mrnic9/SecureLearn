const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { pool } = require('../config/database');
const { authMiddleware, requireRole } = require('../middleware/authMiddleware');

const router = express.Router();

// Listar cursos
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, uuid, title, description, category, level, duration_minutes, is_published
       FROM courses WHERE is_published = true ORDER BY created_at DESC`
    );

    const courses = result.rows.map(c => ({
      id: c.id,
      uuid: c.uuid,
      title: c.title,
      description: c.description,
      category: c.category,
      level: c.level,
      durationMinutes: c.duration_minutes,
      isPublished: c.is_published
    }));

    res.json({ courses, total: courses.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Obtener detalles de un curso
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, uuid, title, description, category, level, duration_minutes, is_published
       FROM courses WHERE uuid = $1 OR id = $2`,
      [req.params.id, parseInt(req.params.id) || null]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Curso no encontrado' });
    }

    const course = result.rows[0];
    res.json({
      id: course.id,
      uuid: course.uuid,
      title: course.title,
      description: course.description,
      category: course.category,
      level: course.level,
      durationMinutes: course.duration_minutes,
      isPublished: course.is_published
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
    const result = await pool.query(
      `INSERT INTO courses (uuid, title, description, category, level, duration_minutes, instructor_id, is_published)
       VALUES ($1, $2, $3, $4, $5, $6, $7, false)
       RETURNING id, uuid, title, category, level`,
      [courseId, title, description, category, level || 'beginner', durationMinutes || 60, req.user.id]
    );

    const course = result.rows[0];
    res.status(201).json({
      message: 'Curso creado exitosamente',
      course: {
        id: course.id,
        uuid: course.uuid,
        title: course.title,
        category: course.category,
        level: course.level
      }
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Inscribirse a un curso
router.post('/:id/enroll', authMiddleware, async (req, res) => {
  try {
    const courseResult = await pool.query(
      'SELECT id FROM courses WHERE uuid = $1 OR id = $2',
      [req.params.id, parseInt(req.params.id) || null]
    );

    if (courseResult.rows.length === 0) {
      return res.status(404).json({ error: 'Curso no encontrado' });
    }

    const courseId = courseResult.rows[0].id;

    // Verificar si ya está inscrito
    const enrollResult = await pool.query(
      'SELECT id FROM enrollments WHERE user_id = $1 AND course_id = $2',
      [req.user.id, courseId]
    );

    if (enrollResult.rows.length > 0) {
      return res.status(400).json({ error: 'Ya estás inscrito en este curso' });
    }

    // Crear inscripción
    await pool.query(
      'INSERT INTO enrollments (user_id, course_id) VALUES ($1, $2)',
      [req.user.id, courseId]
    );

    res.status(201).json({ message: 'Inscripción exitosa' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Obtener progreso del usuario en un curso
router.get('/:id/progress', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT progress_percentage, completed_at FROM enrollments
       WHERE user_id = $1 AND (course_id = $2 OR course_id IN (SELECT id FROM courses WHERE uuid = $2))`,
      [req.user.id, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No estás inscrito en este curso' });
    }

    const enrollment = result.rows[0];
    res.json({
      progressPercentage: enrollment.progress_percentage,
      completedAt: enrollment.completed_at
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
