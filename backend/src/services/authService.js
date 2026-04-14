const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { pool } = require('../config/database');

const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_jwt_key_change_in_production_at_least_32_chars_long!';
const JWT_EXPIRY = process.env.JWT_EXPIRY || '7d';

class AuthService {
  async register(email, password, firstName, lastName, role = 'student') {
    // Validar email
    if (!email || !email.includes('@')) {
      throw new Error('Email inválido');
    }

    // Validar contraseña (mínimo 8 caracteres)
    if (!password || password.length < 8) {
      throw new Error('La contraseña debe tener al menos 8 caracteres');
    }

    // Verificar si el email ya existe
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email.toLowerCase()]
    );

    if (existingUser.rows.length > 0) {
      throw new Error('El email ya está registrado');
    }

    // Hash de la contraseña
    const passwordHash = await bcrypt.hash(password, 10);

    // Crear usuario
    const userId = uuidv4();
    const result = await pool.query(
      `INSERT INTO users (uuid, email, password_hash, first_name, last_name, role)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, uuid, email, first_name, last_name, role, created_at`,
      [userId, email.toLowerCase(), passwordHash, firstName, lastName, role]
    );

    const user = result.rows[0];

    // Log de auditoría
    await this.logAudit(null, 'USER_REGISTERED', 'user', user.id);

    return {
      id: user.id,
      uuid: user.uuid,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      role: user.role,
      createdAt: user.created_at
    };
  }

  async login(email, password) {
    // Buscar usuario
    const result = await pool.query(
      'SELECT id, uuid, email, password_hash, first_name, last_name, role FROM users WHERE email = $1 AND is_active = true',
      [email.toLowerCase()]
    );

    if (result.rows.length === 0) {
      throw new Error('Email o contraseña incorrectos');
    }

    const user = result.rows[0];

    // Verificar contraseña
    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      // Log de intento fallido
      await this.logAudit(user.id, 'LOGIN_FAILED', 'auth', null);
      throw new Error('Email o contraseña incorrectos');
    }

    // Generar JWT
    const token = jwt.sign(
      {
        id: user.id,
        uuid: user.uuid,
        email: user.email,
        role: user.role
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRY }
    );

    // Log de auditoría
    await this.logAudit(user.id, 'LOGIN_SUCCESS', 'auth', null);

    return {
      token,
      user: {
        id: user.id,
        uuid: user.uuid,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role
      }
    };
  }

  async logAudit(userId, action, resource, details) {
    try {
      await pool.query(
        `INSERT INTO audit_logs (user_id, action, resource, details)
         VALUES ($1, $2, $3, $4)`,
        [userId, action, resource, JSON.stringify(details)]
      );
    } catch (err) {
      console.error('Error logging audit:', err);
    }
  }

  verifyToken(token) {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (err) {
      throw new Error('Token inválido o expirado');
    }
  }
}

module.exports = new AuthService();
