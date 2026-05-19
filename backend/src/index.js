const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const { initializeTables } = require('./config/database');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const courseRoutes = require('./routes/courseRoutes');
const moduleRoutes = require('./routes/moduleRoutes');
const quizRoutes = require('./routes/quizRoutes');
const certificateRoutes = require('./routes/certificateRoutes');
const securityLogger = require('./services/securityLogger');

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Middleware de seguridad: Helmet con directivas específicas ────────────────
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'"],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  hsts: {
    maxAge: 31536000, // 1 año
    includeSubDomains: true,
    preload: true,
  },
  noSniff: true,
  xssFilter: true,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  frameguard: { action: 'deny' },
}));

app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
}));

// Body parser
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ limit: '1mb', extended: true }));

// ─── Rate limiting ─────────────────────────────────────────────────────────────
// Login: más permisivo para evitar bloqueos en dev, saltea requests exitosos
const authLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,           // ventana de 5 minutos
  max: parseInt(process.env.RATE_LIMIT_MAX) || 20, // 20 intentos (dev); en prod poner 10
  skipSuccessfulRequests: true,       // no cuenta logins exitosos
  standardHeaders: true,             // devuelve RateLimit-* headers
  legacyHeaders: false,              // desactiva X-RateLimit-*
  message: {
    error: 'Demasiados intentos de acceso. Espera unos minutos e intenta de nuevo.',
    retryAfter: '5 minutos'
  }
});

// Registro: más estricto — 3 registros por hora por IP
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Has alcanzado el límite de registros. Intenta en una hora.',
    retryAfter: '1 hora'
  }
});

// ─── Logging middleware ────────────────────────────────────────────────────────
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth/register', registerLimiter);
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/modules', moduleRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/certificates', certificateRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// API documentation endpoint
app.get('/api/docs', (req, res) => {
  res.json({
    name: 'SecureLearn API',
    version: '1.0.0',
    endpoints: {
      auth: {
        'POST /api/auth/register': 'Registrar nuevo usuario',
        'POST /api/auth/login': 'Login de usuario',
        'POST /api/auth/logout': 'Logout (invalidar token)',
        'POST /api/auth/refresh': 'Renovar JWT token'
      },
      users: {
        'GET /api/users/me': 'Obtener datos del usuario actual',
        'GET /api/users': 'Listar usuarios (solo admin)',
        'PUT /api/users/:id': 'Actualizar usuario'
      },
      courses: {
        'GET /api/courses': 'Listar cursos disponibles',
        'GET /api/courses/:id': 'Obtener detalles del curso',
        'POST /api/courses/:id/enroll': 'Inscribirse a curso',
        'GET /api/courses/:id/progress': 'Obtener progreso en curso'
      }
    }
  });
});

// ─── Error handling global ────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  const status = err.status || 500;
  console.error('Error:', err.message);
  securityLogger.error('unhandled_server_error', {
    message: err.message,
    path: req.path,
    method: req.method,
    ip: req.ip,
  });
  res.status(status).json({
    error: status === 500 ? 'Error interno del servidor' : err.message,
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// Inicializar servidor
async function start() {
  console.log('🚀 Iniciando backend...');

  try {
    // Inicializar tablas
    console.log('📍 Creando tablas...');
    await initializeTables();
    console.log('✅ Tablas listas');

    // Iniciar servidor Express
    app.listen(PORT, () => {
      console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
      console.log(`📊 API Docs: http://localhost:${PORT}/api/docs`);
      console.log(`❤️  Health: http://localhost:${PORT}/health`);
    });
  } catch (err) {
    console.error('❌ ERROR:', err.message);
    process.exit(1);
  }
}

start();

module.exports = app;
