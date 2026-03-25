const express = require('express');
const { getDb } = require('../db/setup');
const { authenticate, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// GET /api/user-trainings — own (or all for admin)
router.get('/', authenticate, (req, res) => {
  const db = getDb();

  if (req.user.role === 'admin') {
    const items = db.prepare(`
      SELECT ut.*, u.name as user_name, u.email as user_email, t.title as training_title, t.difficulty
      FROM user_trainings ut
      JOIN users u ON u.id = ut.user_id
      JOIN trainings t ON t.id = ut.training_id
      ORDER BY ut.assigned_at DESC
    `).all();
    return res.json(items);
  }

  const items = db.prepare(`
    SELECT ut.*, t.title as training_title, t.description as training_description,
           t.difficulty, t.duration_weeks
    FROM user_trainings ut
    JOIN trainings t ON t.id = ut.training_id
    WHERE ut.user_id = ?
    ORDER BY ut.assigned_at DESC
  `).all(req.user.id);

  res.json(items);
});

// POST /api/user-trainings — admin assigns training to user
router.post('/', authenticate, requireAdmin, (req, res) => {
  const { user_id, training_id, notes } = req.body;
  if (!user_id || !training_id) {
    return res.status(400).json({ message: 'user_id и training_id обязательны' });
  }

  const db = getDb();
  const user = db.prepare('SELECT id FROM users WHERE id = ?').get(user_id);
  if (!user) return res.status(404).json({ message: 'Пользователь не найден' });

  const training = db.prepare('SELECT id FROM trainings WHERE id = ?').get(training_id);
  if (!training) return res.status(404).json({ message: 'Программа не найдена' });

  const result = db.prepare(
    'INSERT INTO user_trainings (user_id, training_id, notes) VALUES (?, ?, ?)'
  ).run(user_id, training_id, notes || null);

  const item = db.prepare(`
    SELECT ut.*, u.name as user_name, t.title as training_title
    FROM user_trainings ut
    JOIN users u ON u.id = ut.user_id
    JOIN trainings t ON t.id = ut.training_id
    WHERE ut.id = ?
  `).get(result.lastInsertRowid);

  res.status(201).json(item);
});

// PUT /api/user-trainings/:id — update status (user or admin)
router.put('/:id', authenticate, (req, res) => {
  const { status, notes } = req.body;
  const db = getDb();

  const item = db.prepare('SELECT * FROM user_trainings WHERE id = ?').get(req.params.id);
  if (!item) return res.status(404).json({ message: 'Назначение не найдено' });

  if (req.user.role !== 'admin' && item.user_id !== req.user.id) {
    return res.status(403).json({ message: 'Доступ запрещён' });
  }

  db.prepare('UPDATE user_trainings SET status = COALESCE(?, status), notes = COALESCE(?, notes) WHERE id = ?')
    .run(status || null, notes || null, req.params.id);

  const updated = db.prepare('SELECT * FROM user_trainings WHERE id = ?').get(req.params.id);
  res.json(updated);
});

// DELETE /api/user-trainings/:id — admin only
router.delete('/:id', authenticate, requireAdmin, (req, res) => {
  const db = getDb();
  const item = db.prepare('SELECT id FROM user_trainings WHERE id = ?').get(req.params.id);
  if (!item) return res.status(404).json({ message: 'Назначение не найдено' });
  db.prepare('DELETE FROM user_trainings WHERE id = ?').run(req.params.id);
  res.json({ message: 'Назначение удалено' });
});

module.exports = router;
