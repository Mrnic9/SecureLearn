const express = require('express');
const { get, all, run } = require('../config/database');
const { authMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

// Obtener certificados del usuario
router.get('/my-certificates', authMiddleware, async (req, res) => {
  try {
    const certificates = await all(
      `SELECT
        c.id, c.uuid, c.title,
        e.completed_at,
        CASE WHEN e.completed_at IS NOT NULL THEN 1 ELSE 0 END as is_completed
       FROM courses c
       JOIN enrollments e ON c.id = e.course_id
       WHERE e.user_id = ? AND e.completed_at IS NOT NULL
       ORDER BY e.completed_at DESC`,
      [req.user.id]
    );

    res.json({ certificates });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Obtener certificado específico
router.get('/:courseId', authMiddleware, async (req, res) => {
  try {
    const enrollment = await get(
      `SELECT
        c.title, c.uuid as courseUuid,
        u.first_name, u.last_name,
        e.completed_at
       FROM enrollments e
       JOIN courses c ON e.course_id = c.id
       JOIN users u ON e.user_id = u.id
       WHERE e.user_id = ? AND e.course_id = ? AND e.completed_at IS NOT NULL`,
      [req.user.id, req.params.courseId]
    );

    if (!enrollment) {
      return res.status(404).json({ error: 'Certificado no encontrado' });
    }

    res.json({
      courseTitle: enrollment.title,
      userName: `${enrollment.first_name} ${enrollment.last_name}`,
      completedDate: enrollment.completed_at,
      certificateNumber: `SL-${enrollment.courseUuid.slice(0, 8).toUpperCase()}`
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Marcar curso como completado
router.post('/complete/:courseId', authMiddleware, async (req, res) => {
  try {
    await run(
      `UPDATE enrollments
       SET completed_at = CURRENT_TIMESTAMP, progress_percentage = 100
       WHERE user_id = ? AND course_id = ?`,
      [req.user.id, req.params.courseId]
    );

    res.json({ message: 'Curso marcado como completado', certificate: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
