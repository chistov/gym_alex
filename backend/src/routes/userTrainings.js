const express = require('express');
const { query } = require('../db/setup');
const { authenticate, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// GET /api/user-trainings — own (or all for admin)
router.get('/', authenticate, async (req, res) => {
  try {
    if (req.user.role === 'admin') {
      const { rows } = await query(`
        SELECT ut.*, u.name as user_name, u.email as user_email, t.title as training_title, t.difficulty
        FROM user_trainings ut
        JOIN users u ON u.id = ut.user_id
        JOIN trainings t ON t.id = ut.training_id
        ORDER BY ut.assigned_at DESC
      `);
      return res.json(rows);
    }

    const { rows } = await query(`
      SELECT ut.*, t.title as training_title, t.description as training_description,
             t.difficulty, t.duration_weeks
      FROM user_trainings ut
      JOIN trainings t ON t.id = ut.training_id
      WHERE ut.user_id = $1
      ORDER BY ut.assigned_at DESC
    `, [req.user.id]);

    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// POST /api/user-trainings — admin assigns training to user
router.post('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const { user_id, training_id, notes } = req.body;
    if (!user_id || !training_id) {
      return res.status(400).json({ message: 'user_id и training_id обязательны' });
    }

    const { rows: userRows } = await query('SELECT id FROM users WHERE id = $1', [user_id]);
    if (userRows.length === 0) return res.status(404).json({ message: 'Пользователь не найден' });

    const { rows: trainingRows } = await query('SELECT id FROM trainings WHERE id = $1', [training_id]);
    if (trainingRows.length === 0) return res.status(404).json({ message: 'Программа не найдена' });

    const { rows: inserted } = await query(
      'INSERT INTO user_trainings (user_id, training_id, notes) VALUES ($1, $2, $3) RETURNING id',
      [user_id, training_id, notes || null]
    );

    const { rows } = await query(`
      SELECT ut.*, u.name as user_name, t.title as training_title
      FROM user_trainings ut
      JOIN users u ON u.id = ut.user_id
      JOIN trainings t ON t.id = ut.training_id
      WHERE ut.id = $1
    `, [inserted[0].id]);

    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// PUT /api/user-trainings/:id — update status (user or admin)
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { status, notes } = req.body;

    const { rows: existing } = await query('SELECT * FROM user_trainings WHERE id = $1', [req.params.id]);
    if (existing.length === 0) return res.status(404).json({ message: 'Назначение не найдено' });

    const item = existing[0];
    if (req.user.role !== 'admin' && item.user_id !== req.user.id) {
      return res.status(403).json({ message: 'Доступ запрещён' });
    }

    await query(
      'UPDATE user_trainings SET status = COALESCE($1, status), notes = COALESCE($2, notes) WHERE id = $3',
      [status || null, notes || null, req.params.id]
    );

    const { rows } = await query('SELECT * FROM user_trainings WHERE id = $1', [req.params.id]);
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// DELETE /api/user-trainings/:id — admin only
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { rows } = await query('SELECT id FROM user_trainings WHERE id = $1', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Назначение не найдено' });
    await query('DELETE FROM user_trainings WHERE id = $1', [req.params.id]);
    res.json({ message: 'Назначение удалено' });
  } catch (err) {
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

module.exports = router;
