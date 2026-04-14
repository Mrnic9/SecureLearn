const express = require('express');
const authService = require('../services/authService');
const { authMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

// Registro
router.post('/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }

    const user = await authService.register(email, password, firstName, lastName, 'student');

    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      user
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña son requeridos' });
    }

    const result = await authService.login(email, password);

    res.json({
      message: 'Login exitoso',
      token: result.token,
      user: result.user
    });
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
});

// Verificar token
router.get('/verify', authMiddleware, (req, res) => {
  res.json({
    valid: true,
    user: req.user
  });
});

module.exports = router;
