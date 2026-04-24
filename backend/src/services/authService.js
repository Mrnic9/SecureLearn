const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { db, run, get } = require('../config/database');

const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_jwt_key_change_in_production_at_least_32_chars_long!';
const JWT_EXPIRY = process.env.JWT_EXPIRY || '7d';

class AuthService {
  async register(email, password, firstName, lastName, role = 'student') {
    if (!email || !email.includes('@')) {
      throw new Error('Email inválido');
    }

    if (!password || password.length < 8) {
      throw new Error('La contraseña debe tener al menos 8 caracteres');
    }

    // Verificar si el email ya existe
    const existing = await get('SELECT id FROM users WHERE email = ?', [email.toLowerCase()]);
    if (existing) {
      throw new Error('El email ya está registrado');
    }

    // Hash de la contraseña
    const passwordHash = await bcrypt.hash(password, 10);

    // Crear usuario
    const userId = uuidv4();
    const result = await new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO users (uuid, email, password_hash, first_name, last_name, role)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [userId, email.toLowerCase(), passwordHash, firstName, lastName, role],
        function(err) {
          if (err) reject(err);
          else resolve({ id: this.lastID, uuid: userId });
        }
      );
    });

    return {
      id: result.id,
      uuid: result.uuid,
      email: email.toLowerCase(),
      firstName,
      lastName,
      role,
      createdAt: new Date()
    };
  }

  async login(email, password) {
    // Buscar usuario
    const user = await get(
      'SELECT id, uuid, email, password_hash, first_name, last_name, role FROM users WHERE email = ? AND is_active = 1',
      [email.toLowerCase()]
    );

    if (!user) {
      throw new Error('Email o contraseña incorrectos');
    }

    // Verificar contraseña
    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
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

  verifyToken(token) {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (err) {
      throw new Error('Token inválido o expirado');
    }
  }
}

module.exports = new AuthService();
