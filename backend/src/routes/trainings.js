const express = require('express');
const { query } = require('../db/setup');
const { authenticate, requireAdmin } = require('../middleware/auth');

const router = express.Router();

async function getTrainingWithExercises(id) {
  const { rows } = await query('SELECT * FROM trainings WHERE id = $1', [id]);
  if (rows.length === 0) return null;
  const training = rows[0];
  const { rows: exercises } = await query('SELECT * FROM exercises WHERE training_id = $1 ORDER BY order_index', [id]);
  training.exercises = exercises;
  return training;
}

// GET /api/trainings — public
router.get('/', async (req, res) => {
  try {
    const { rows } = await query('SELECT * FROM trainings WHERE published = 1 ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// GET /api/trainings/all — admin
router.get('/all', authenticate, requireAdmin, async (req, res) => {
  try {
    const { rows } = await query('SELECT * FROM trainings ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// GET /api/trainings/:id — public (with exercises)
router.get('/:id', async (req, res) => {
  try {
    const training = await getTrainingWithExercises(req.params.id);
    if (!training || !training.published) return res.status(404).json({ message: 'Программа не найдена' });
    res.json(training);
  } catch (err) {
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// POST /api/trainings — admin
router.post('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const { title, description, difficulty = 'beginner', duration_weeks = 4, image_url, published = 1 } = req.body;
    if (!title) return res.status(400).json({ message: 'Название обязательно' });

    const { rows } = await query(
      'INSERT INTO trainings (title, description, difficulty, duration_weeks, image_url, published) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
      [title, description || null, difficulty, duration_weeks, image_url || null, published ? 1 : 0]
    );

    const item = await getTrainingWithExercises(rows[0].id);
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// PUT /api/trainings/:id — admin
router.put('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { title, description, difficulty, duration_weeks, image_url, published } = req.body;

    const { rows: existing } = await query('SELECT id FROM trainings WHERE id = $1', [req.params.id]);
    if (existing.length === 0) return res.status(404).json({ message: 'Программа не найдена' });

    await query(`
      UPDATE trainings SET
        title = COALESCE($1, title),
        description = COALESCE($2, description),
        difficulty = COALESCE($3, difficulty),
        duration_weeks = COALESCE($4, duration_weeks),
        image_url = COALESCE($5, image_url),
        published = COALESCE($6, published)
      WHERE id = $7
    `, [title || null, description || null, difficulty || null, duration_weeks || null, image_url || null, published !== undefined ? (published ? 1 : 0) : null, req.params.id]);

    const updated = await getTrainingWithExercises(req.params.id);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// DELETE /api/trainings/:id — admin
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { rows } = await query('SELECT id FROM trainings WHERE id = $1', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Программа не найдена' });
    await query('DELETE FROM trainings WHERE id = $1', [req.params.id]);
    res.json({ message: 'Программа удалена' });
  } catch (err) {
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// POST /api/trainings/:id/exercises — admin
router.post('/:id/exercises', authenticate, requireAdmin, async (req, res) => {
  try {
    const { name, sets = 3, reps = '10', rest_seconds = 60, description, order_index = 0 } = req.body;
    if (!name) return res.status(400).json({ message: 'Название упражнения обязательно' });

    const { rows: training } = await query('SELECT id FROM trainings WHERE id = $1', [req.params.id]);
    if (training.length === 0) return res.status(404).json({ message: 'Программа не найдена' });

    const { rows } = await query(
      'INSERT INTO exercises (training_id, name, sets, reps, rest_seconds, description, order_index) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [req.params.id, name, sets, reps, rest_seconds, description || null, order_index]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// PUT /api/trainings/exercises/:exerciseId — admin
router.put('/exercises/:exerciseId', authenticate, requireAdmin, async (req, res) => {
  try {
    const { name, sets, reps, rest_seconds, description, order_index } = req.body;

    const { rows: existing } = await query('SELECT id FROM exercises WHERE id = $1', [req.params.exerciseId]);
    if (existing.length === 0) return res.status(404).json({ message: 'Упражнение не найдено' });

    await query(`
      UPDATE exercises SET
        name = COALESCE($1, name),
        sets = COALESCE($2, sets),
        reps = COALESCE($3, reps),
        rest_seconds = COALESCE($4, rest_seconds),
        description = COALESCE($5, description),
        order_index = COALESCE($6, order_index)
      WHERE id = $7
    `, [name || null, sets || null, reps || null, rest_seconds || null, description || null, order_index !== undefined ? order_index : null, req.params.exerciseId]);

    const { rows } = await query('SELECT * FROM exercises WHERE id = $1', [req.params.exerciseId]);
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// DELETE /api/trainings/exercises/:exerciseId — admin
router.delete('/exercises/:exerciseId', authenticate, requireAdmin, async (req, res) => {
  try {
    const { rows } = await query('SELECT id FROM exercises WHERE id = $1', [req.params.exerciseId]);
    if (rows.length === 0) return res.status(404).json({ message: 'Упражнение не найдено' });
    await query('DELETE FROM exercises WHERE id = $1', [req.params.exerciseId]);
    res.json({ message: 'Упражнение удалено' });
  } catch (err) {
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

module.exports = router;
