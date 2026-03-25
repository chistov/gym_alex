const express = require('express');
const { getDb } = require('../db/setup');
const { authenticate, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// GET /api/users/profile — own profile
router.get('/profile', authenticate, (req, res) => {
  const db = getDb();
  const user = db.prepare('SELECT id, name, email, role, phone, height, weight, age, gender, fitness_goal, experience, health_notes, avatar_url, created_at FROM users WHERE id = ?').get(req.user.id);
  if (!user) return res.status(404).json({ message: 'Пользователь не найден' });
  res.json(user);
});

// PUT /api/users/profile — update own profile
router.put('/profile', authenticate, (req, res) => {
  const { name, phone, height, weight, age, gender, fitness_goal, experience, health_notes } = req.body;
  const db = getDb();

  db.prepare(`
    UPDATE users SET
      name = COALESCE(?, name),
      phone = COALESCE(?, phone),
      height = COALESCE(?, height),
      weight = COALESCE(?, weight),
      age = COALESCE(?, age),
      gender = COALESCE(?, gender),
      fitness_goal = COALESCE(?, fitness_goal),
      experience = COALESCE(?, experience),
      health_notes = COALESCE(?, health_notes)
    WHERE id = ?
  `).run(name || null, phone || null, height || null, weight || null, age || null, gender || null, fitness_goal || null, experience || null, health_notes || null, req.user.id);

  const updated = db.prepare('SELECT id, name, email, role, phone, height, weight, age, gender, fitness_goal, experience, health_notes, avatar_url, created_at FROM users WHERE id = ?').get(req.user.id);
  res.json(updated);
});

// GET /api/users — admin only
router.get('/', authenticate, requireAdmin, (req, res) => {
  const db = getDb();
  const users = db.prepare('SELECT id, name, email, role, phone, height, weight, age, gender, fitness_goal, experience, created_at FROM users ORDER BY created_at DESC').all();
  res.json(users);
});

// GET /api/users/:id — admin only
router.get('/:id', authenticate, requireAdmin, (req, res) => {
  const db = getDb();
  const user = db.prepare('SELECT id, name, email, role, phone, height, weight, age, gender, fitness_goal, experience, health_notes, created_at FROM users WHERE id = ?').get(req.params.id);
  if (!user) return res.status(404).json({ message: 'Пользователь не найден' });
  res.json(user);
});

// PUT /api/users/:id — admin only
router.put('/:id', authenticate, requireAdmin, (req, res) => {
  const { name, email, role, phone } = req.body;
  const db = getDb();

  db.prepare(`
    UPDATE users SET
      name = COALESCE(?, name),
      email = COALESCE(?, email),
      role = COALESCE(?, role),
      phone = COALESCE(?, phone)
    WHERE id = ?
  `).run(name || null, email || null, role || null, phone || null, req.params.id);

  const updated = db.prepare('SELECT id, name, email, role, phone, created_at FROM users WHERE id = ?').get(req.params.id);
  res.json(updated);
});

// DELETE /api/users/:id — admin only
router.delete('/:id', authenticate, requireAdmin, (req, res) => {
  const db = getDb();
  const user = db.prepare('SELECT id FROM users WHERE id = ?').get(req.params.id);
  if (!user) return res.status(404).json({ message: 'Пользователь не найден' });
  db.prepare('DELETE FROM users WHERE id = ?').run(req.params.id);
  res.json({ message: 'Пользователь удалён' });
});

module.exports = router;
