const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const { pool, initializeTables } = require('./config/database');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const courseRoutes = require('./routes/courseRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware de seguridad
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
}));

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Rate limiting en endpoints sensibles
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // 5 intentos
  message: 'Demasiados intentos de acceso, intenta más tarde'
});

// Logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/courses', courseRoutes);

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

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(err.status || 500).json({
    error: err.message || 'Error interno del servidor',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// Inicializar servidor
const startServer = async () => {
  try {
    // Verificar conexión a BD
    const result = await pool.query('SELECT NOW()');
    console.log('✅ Conectado a PostgreSQL:', result.rows[0]);

    // Inicializar tablas
    await initializeTables();

    // Iniciar servidor
    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
      console.log(`📊 Documentación API: http://localhost:${PORT}/api/docs`);
      console.log(`❤️  Health check: http://localhost:${PORT}/health`);
    });
  } catch (err) {
    console.error('❌ Error iniciando servidor:', err.message);
    process.exit(1);
  }
};

startServer();

module.exports = app;
