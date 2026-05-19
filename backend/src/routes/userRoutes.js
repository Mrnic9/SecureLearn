const express = require('express');
const { get, all, run } = require('../config/database');
const { authMiddleware, requireRole } = require('../middleware/authMiddleware');
const securityLogger = require('../services/securityLogger');

const router = express.Router();

// Obtener perfil del usuario actual
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await get(
      'SELECT id, uuid, email, first_name, last_name, role, created_at FROM users WHERE id = ?',
      [req.user.id]
    );

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json({
      id: user.id,
      uuid: user.uuid,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      role: user.role,
      createdAt: user.created_at
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Listar usuarios (solo admin)
router.get('/', authMiddleware, requireRole('admin'), async (req, res) => {
  securityLogger.info('admin_list_users', { adminId: req.user.id, ip: req.ip });
  try {
    const users = await all(
      'SELECT id, uuid, email, first_name, last_name, role, is_active, created_at FROM users LIMIT 100'
    );

    const formatted = users.map(u => ({
      id: u.id,
      uuid: u.uuid,
      email: u.email,
      firstName: u.first_name,
      lastName: u.last_name,
      role: u.role,
      isActive: u.is_active === 1,
      createdAt: u.created_at
    }));

    res.json({ users: formatted, total: formatted.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Actualizar perfil del usuario
router.put('/me', authMiddleware, async (req, res) => {
  try {
    const { firstName, lastName } = req.body;

    if (!firstName || !lastName) {
      return res.status(400).json({ error: 'firstName y lastName son requeridos' });
    }

    await run(
      'UPDATE users SET first_name = ?, last_name = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [firstName, lastName, req.user.id]
    );

    const user = await get('SELECT id, uuid, email, first_name, last_name, role FROM users WHERE id = ?', [req.user.id]);

    securityLogger.info('profile_updated', { userId: req.user.id, ip: req.ip });
    res.json({
      message: 'Perfil actualizado',
      user: {
        id: user.id,
        uuid: user.uuid,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role
      }
    });
  } catch (err) {
    securityLogger.error('profile_update_failed', { userId: req.user.id, ip: req.ip, reason: err.message });
    res.status(500).json({ error: err.message });
  }
});

// Actualizar usuario por id (solo admin)
router.put('/:id', authMiddleware, requireRole('admin'), async (req, res) => {
  const { id } = req.params;
  const { firstName, lastName, role, isActive } = req.body;

  try {
    const existing = await get('SELECT id FROM users WHERE id = ?', [id]);
    if (!existing) return res.status(404).json({ error: 'Usuario no encontrado' });

    await run(
      `UPDATE users SET
        first_name = COALESCE(?, first_name),
        last_name  = COALESCE(?, last_name),
        role       = COALESCE(?, role),
        is_active  = COALESCE(?, is_active),
        updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [firstName || null, lastName || null, role || null, isActive !== undefined ? (isActive ? 1 : 0) : null, id]
    );

    const updated = await get(
      'SELECT id, uuid, email, first_name, last_name, role, is_active, created_at FROM users WHERE id = ?',
      [id]
    );

    securityLogger.info('admin_updated_user', { adminId: req.user.id, targetId: id, ip: req.ip });
    res.json({
      message: 'Usuario actualizado',
      user: {
        id: updated.id,
        uuid: updated.uuid,
        email: updated.email,
        firstName: updated.first_name,
        lastName: updated.last_name,
        role: updated.role,
        isActive: updated.is_active === 1,
        createdAt: updated.created_at,
      }
    });
  } catch (err) {
    securityLogger.error('admin_update_user_failed', { adminId: req.user.id, targetId: id, reason: err.message });
    res.status(500).json({ error: err.message });
  }
});

// Eliminar usuario por id (solo admin, no puede eliminarse a sí mismo)
router.delete('/:id', authMiddleware, requireRole('admin'), async (req, res) => {
  const { id } = req.params;

  if (parseInt(id) === req.user.id) {
    return res.status(400).json({ error: 'No puedes eliminar tu propia cuenta' });
  }

  try {
    const existing = await get('SELECT id, email FROM users WHERE id = ?', [id]);
    if (!existing) return res.status(404).json({ error: 'Usuario no encontrado' });

    await run('DELETE FROM users WHERE id = ?', [id]);

    securityLogger.warn('admin_deleted_user', { adminId: req.user.id, targetId: id, targetEmail: existing.email, ip: req.ip });
    res.json({ message: 'Usuario eliminado correctamente' });
  } catch (err) {
    securityLogger.error('admin_delete_user_failed', { adminId: req.user.id, targetId: id, reason: err.message });
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
