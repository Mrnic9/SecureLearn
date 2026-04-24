const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { get, all, run } = require('../config/database');
const { authMiddleware, requireRole } = require('../middleware/authMiddleware');

const router = express.Router();

// Obtener quizzes de un curso
router.get('/course/:courseId', async (req, res) => {
  try {
    const quizzes = await all(
      'SELECT * FROM quizzes WHERE course_id = ?',
      [req.params.courseId]
    );

    res.json({ quizzes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Obtener preguntas de un quiz
router.get('/:quizId/questions', async (req, res) => {
  try {
    const questions = await all(
      `SELECT qq.*, COUNT(qa.id) as answer_count
       FROM quiz_questions qq
       LEFT JOIN quiz_answers qa ON qq.id = qa.question_id
       WHERE qq.quiz_id = ?
       GROUP BY qq.id
       ORDER BY qq.order_num ASC`,
      [req.params.quizId]
    );

    res.json({ questions });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Obtener respuestas de una pregunta
router.get('/question/:questionId/answers', async (req, res) => {
  try {
    const answers = await all(
      'SELECT id, uuid, answer_text, order_num FROM quiz_answers WHERE question_id = ? ORDER BY order_num ASC',
      [req.params.questionId]
    );

    res.json({ answers });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Enviar respuestas de quiz
router.post('/:quizId/submit', authMiddleware, async (req, res) => {
  try {
    const { answers } = req.body; // Array de {questionId, selectedAnswerId}

    if (!answers || answers.length === 0) {
      return res.status(400).json({ error: 'Se requieren respuestas' });
    }

    // Calcular puntuación
    let correctCount = 0;
    let totalCount = 0;

    for (const answer of answers) {
      const correct = await get(
        'SELECT is_correct FROM quiz_answers WHERE id = ?',
        [answer.selectedAnswerId]
      );

      if (correct && correct.is_correct === 1) {
        correctCount++;
      }
      totalCount++;
    }

    const score = (correctCount / totalCount) * 100;
    const quiz = await get('SELECT passing_score FROM quizzes WHERE id = ?', [req.params.quizId]);
    const passed = score >= (quiz?.passing_score || 70);

    // Guardar resultado
    await run(
      `INSERT INTO quiz_results (user_id, quiz_id, score, passed)
       VALUES (?, ?, ?, ?)`,
      [req.user.id, req.params.quizId, score, passed ? 1 : 0]
    );

    res.json({
      score: Math.round(score),
      passed,
      correctCount,
      totalCount,
      message: passed ? '✅ ¡Quiz aprobado!' : '❌ No alcanzaste la puntuación mínima'
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Obtener resultado de quiz del usuario
router.get('/:quizId/result', authMiddleware, async (req, res) => {
  try {
    const result = await get(
      'SELECT score, passed, completed_at FROM quiz_results WHERE user_id = ? AND quiz_id = ?',
      [req.user.id, req.params.quizId]
    );

    if (!result) {
      return res.status(404).json({ error: 'No hay resultado' });
    }

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
