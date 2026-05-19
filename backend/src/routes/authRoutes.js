const express = require('express');
const Joi = require('joi');
const authService = require('../services/authService');
const { authMiddleware } = require('../middleware/authMiddleware');
const securityLogger = require('../services/securityLogger');

const router = express.Router();

// ─── Schemas de validación Joi ─────────────────────────────────────────────────
const registerSchema = Joi.object({
  email: Joi.string().email({ tlds: { allow: false } }).max(254).required()
    .messages({
      'string.email': 'El email no tiene un formato válido',
      'string.max': 'El email es demasiado largo',
      'any.required': 'El email es requerido',
    }),
  password: Joi.string()
    .min(8).max(128)
    .pattern(/[A-Z]/, 'uppercase')
    .pattern(/[a-z]/, 'lowercase')
    .pattern(/\d/, 'number')
    .pattern(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/, 'special')
    .required()
    .messages({
      'string.min': 'La contraseña debe tener al menos 8 caracteres',
      'string.max': 'La contraseña es demasiado larga',
      'string.pattern.name': 'La contraseña debe contener {#name}',
      'any.required': 'La contraseña es requerida',
    }),
  firstName: Joi.string().trim().min(1).max(50).required()
    .messages({
      'string.min': 'El nombre es requerido',
      'string.max': 'El nombre es demasiado largo',
      'any.required': 'El nombre es requerido',
    }),
  lastName: Joi.string().trim().min(1).max(50).required()
    .messages({
      'string.min': 'El apellido es requerido',
      'string.max': 'El apellido es demasiado largo',
      'any.required': 'El apellido es requerido',
    }),
});

const loginSchema = Joi.object({
  email: Joi.string().email({ tlds: { allow: false } }).max(254).required()
    .messages({
      'string.email': 'El email no tiene un formato válido',
      'any.required': 'El email es requerido',
    }),
  password: Joi.string().min(1).max(128).required()
    .messages({
      'any.required': 'La contraseña es requerida',
    }),
});

// ─── Middleware de validación genérico ─────────────────────────────────────────
function validate(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,   // devolver todos los errores, no solo el primero
      stripUnknown: true,  // eliminar campos no definidos en el schema
    });

    if (error) {
      const messages = error.details.map(d => d.message);
      return res.status(400).json({
        error: 'Datos inválidos',
        details: messages,
      });
    }

    // Reemplazar req.body con los datos sanitizados por Joi
    req.body = value;
    next();
  };
}

// ─── Registro ──────────────────────────────────────────────────────────────────
router.post('/register', validate(registerSchema), async (req, res) => {
  const { email, password, firstName, lastName } = req.body;
  const ip = req.ip;

  try {
    const user = await authService.register(email, password, firstName, lastName, 'student');

    securityLogger.info('user_registered', { email, ip });

    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      user,
    });
  } catch (err) {
    securityLogger.warn('registration_failed', { email, ip, reason: err.message });
    res.status(400).json({ error: err.message });
  }
});

// ─── Login ─────────────────────────────────────────────────────────────────────
router.post('/login', validate(loginSchema), async (req, res) => {
  const { email, password } = req.body;
  const ip = req.ip;

  try {
    const result = await authService.login(email, password);

    securityLogger.info('login_success', { email, ip });

    res.json({
      message: 'Login exitoso',
      token: result.token,
      user: result.user,
    });
  } catch (err) {
    securityLogger.warn('login_failed', { email, ip, reason: err.message });
    res.status(401).json({ error: err.message });
  }
});

// ─── Verificar token ───────────────────────────────────────────────────────────
router.get('/verify', authMiddleware, (req, res) => {
  res.json({
    valid: true,
    user: req.user,
  });
});

module.exports = router;
