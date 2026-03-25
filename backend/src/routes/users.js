const express = require('express');
const { query } = require('../db/setup');
const { authenticate, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// GET /api/users/profile — own profile
router.get('/profile', authenticate, async (req, res) => {
  try {
    const { rows } = await query(
      'SELECT id, name, email, role, phone, height, weight, age, gender, fitness_goal, experience, health_notes, avatar_url, created_at FROM users WHERE id = $1',
      [req.user.id]
    );
    if (rows.length === 0) return res.status(404).json({ message: 'Пользователь не найден' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// PUT /api/users/profile — update own profile
router.put('/profile', authenticate, async (req, res) => {
  try {
    const { name, phone, height, weight, age, gender, fitness_goal, experience, health_notes } = req.body;

    await query(`
      UPDATE users SET
        name = COALESCE($1, name),
        phone = COALESCE($2, phone),
        height = COALESCE($3, height),
        weight = COALESCE($4, weight),
        age = COALESCE($5, age),
        gender = COALESCE($6, gender),
        fitness_goal = COALESCE($7, fitness_goal),
        experience = COALESCE($8, experience),
        health_notes = COALESCE($9, health_notes)
      WHERE id = $10
    `, [name || null, phone || null, height || null, weight || null, age || null, gender || null, fitness_goal || null, experience || null, health_notes || null, req.user.id]);

    const { rows } = await query(
      'SELECT id, name, email, role, phone, height, weight, age, gender, fitness_goal, experience, health_notes, avatar_url, created_at FROM users WHERE id = $1',
      [req.user.id]
    );
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// GET /api/users — admin only
router.get('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const { rows } = await query('SELECT id, name, email, role, phone, height, weight, age, gender, fitness_goal, experience, created_at FROM users ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// GET /api/users/:id — admin only
router.get('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { rows } = await query(
      'SELECT id, name, email, role, phone, height, weight, age, gender, fitness_goal, experience, health_notes, created_at FROM users WHERE id = $1',
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ message: 'Пользователь не найден' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// PUT /api/users/:id — admin only
router.put('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { name, email, role, phone } = req.body;

    await query(`
      UPDATE users SET
        name = COALESCE($1, name),
        email = COALESCE($2, email),
        role = COALESCE($3, role),
        phone = COALESCE($4, phone)
      WHERE id = $5
    `, [name || null, email || null, role || null, phone || null, req.params.id]);

    const { rows } = await query('SELECT id, name, email, role, phone, created_at FROM users WHERE id = $1', [req.params.id]);
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// DELETE /api/users/:id — admin only
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { rows } = await query('SELECT id FROM users WHERE id = $1', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Пользователь не найден' });
    await query('DELETE FROM users WHERE id = $1', [req.params.id]);
    res.json({ message: 'Пользователь удалён' });
  } catch (err) {
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

module.exports = router;
