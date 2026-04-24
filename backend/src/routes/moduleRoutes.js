const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { get, all, run } = require('../config/database');
const { authMiddleware, requireRole } = require('../middleware/authMiddleware');

const router = express.Router();

// Obtener módulos de un curso
router.get('/course/:courseId', async (req, res) => {
  try {
    const modules = await all(
      'SELECT * FROM course_modules WHERE course_id = ? ORDER BY order_num ASC',
      [req.params.courseId]
    );

    res.json({ modules });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Crear módulo (instructor)
router.post('/', authMiddleware, requireRole('instructor', 'admin'), async (req, res) => {
  try {
    const { courseId, title, content, orderNum } = req.body;

    if (!courseId || !title) {
      return res.status(400).json({ error: 'courseId y title son requeridos' });
    }

    const moduleId = uuidv4();
    await run(
      `INSERT INTO course_modules (uuid, course_id, title, content, order_num)
       VALUES (?, ?, ?, ?, ?)`,
      [moduleId, courseId, title, content || '', orderNum || 1]
    );

    res.status(201).json({ message: 'Módulo creado', uuid: moduleId });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
