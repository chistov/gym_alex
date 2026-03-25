const express = require('express');
const { getDb } = require('../db/setup');
const { authenticate, requireAdmin } = require('../middleware/auth');

const router = express.Router();

function getTrainingWithExercises(db, id) {
  const training = db.prepare('SELECT * FROM trainings WHERE id = ?').get(id);
  if (!training) return null;
  training.exercises = db.prepare('SELECT * FROM exercises WHERE training_id = ? ORDER BY order_index').all(id);
  return training;
}

// GET /api/trainings — public
router.get('/', (req, res) => {
  const db = getDb();
  const items = db.prepare('SELECT * FROM trainings WHERE published = 1 ORDER BY created_at DESC').all();
  res.json(items);
});

// GET /api/trainings/all — admin
router.get('/all', authenticate, requireAdmin, (req, res) => {
  const db = getDb();
  const items = db.prepare('SELECT * FROM trainings ORDER BY created_at DESC').all();
  res.json(items);
});

// GET /api/trainings/:id — public (with exercises)
router.get('/:id', (req, res) => {
  const db = getDb();
  const training = getTrainingWithExercises(db, req.params.id);
  if (!training || !training.published) return res.status(404).json({ message: 'Программа не найдена' });
  res.json(training);
});

// POST /api/trainings — admin
router.post('/', authenticate, requireAdmin, (req, res) => {
  const { title, description, difficulty = 'beginner', duration_weeks = 4, image_url, published = 1 } = req.body;
  if (!title) return res.status(400).json({ message: 'Название обязательно' });

  const db = getDb();
  const result = db.prepare(
    'INSERT INTO trainings (title, description, difficulty, duration_weeks, image_url, published) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(title, description || null, difficulty, duration_weeks, image_url || null, published ? 1 : 0);

  const item = getTrainingWithExercises(db, result.lastInsertRowid);
  res.status(201).json(item);
});

// PUT /api/trainings/:id — admin
router.put('/:id', authenticate, requireAdmin, (req, res) => {
  const { title, description, difficulty, duration_weeks, image_url, published } = req.body;
  const db = getDb();

  const existing = db.prepare('SELECT id FROM trainings WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ message: 'Программа не найдена' });

  db.prepare(`
    UPDATE trainings SET
      title = COALESCE(?, title),
      description = COALESCE(?, description),
      difficulty = COALESCE(?, difficulty),
      duration_weeks = COALESCE(?, duration_weeks),
      image_url = COALESCE(?, image_url),
      published = COALESCE(?, published)
    WHERE id = ?
  `).run(title || null, description || null, difficulty || null, duration_weeks || null, image_url || null, published !== undefined ? (published ? 1 : 0) : null, req.params.id);

  const updated = getTrainingWithExercises(db, req.params.id);
  res.json(updated);
});

// DELETE /api/trainings/:id — admin
router.delete('/:id', authenticate, requireAdmin, (req, res) => {
  const db = getDb();
  const existing = db.prepare('SELECT id FROM trainings WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ message: 'Программа не найдена' });
  db.prepare('DELETE FROM trainings WHERE id = ?').run(req.params.id);
  res.json({ message: 'Программа удалена' });
});

// POST /api/trainings/:id/exercises — admin
router.post('/:id/exercises', authenticate, requireAdmin, (req, res) => {
  const { name, sets = 3, reps = '10', rest_seconds = 60, description, order_index = 0 } = req.body;
  if (!name) return res.status(400).json({ message: 'Название упражнения обязательно' });

  const db = getDb();
  const training = db.prepare('SELECT id FROM trainings WHERE id = ?').get(req.params.id);
  if (!training) return res.status(404).json({ message: 'Программа не найдена' });

  const result = db.prepare(
    'INSERT INTO exercises (training_id, name, sets, reps, rest_seconds, description, order_index) VALUES (?, ?, ?, ?, ?, ?, ?)'
  ).run(req.params.id, name, sets, reps, rest_seconds, description || null, order_index);

  const exercise = db.prepare('SELECT * FROM exercises WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(exercise);
});

// PUT /api/trainings/exercises/:exerciseId — admin
router.put('/exercises/:exerciseId', authenticate, requireAdmin, (req, res) => {
  const { name, sets, reps, rest_seconds, description, order_index } = req.body;
  const db = getDb();

  const existing = db.prepare('SELECT id FROM exercises WHERE id = ?').get(req.params.exerciseId);
  if (!existing) return res.status(404).json({ message: 'Упражнение не найдено' });

  db.prepare(`
    UPDATE exercises SET
      name = COALESCE(?, name),
      sets = COALESCE(?, sets),
      reps = COALESCE(?, reps),
      rest_seconds = COALESCE(?, rest_seconds),
      description = COALESCE(?, description),
      order_index = COALESCE(?, order_index)
    WHERE id = ?
  `).run(name || null, sets || null, reps || null, rest_seconds || null, description || null, order_index !== undefined ? order_index : null, req.params.exerciseId);

  const updated = db.prepare('SELECT * FROM exercises WHERE id = ?').get(req.params.exerciseId);
  res.json(updated);
});

// DELETE /api/trainings/exercises/:exerciseId — admin
router.delete('/exercises/:exerciseId', authenticate, requireAdmin, (req, res) => {
  const db = getDb();
  const existing = db.prepare('SELECT id FROM exercises WHERE id = ?').get(req.params.exerciseId);
  if (!existing) return res.status(404).json({ message: 'Упражнение не найдено' });
  db.prepare('DELETE FROM exercises WHERE id = ?').run(req.params.exerciseId);
  res.json({ message: 'Упражнение удалено' });
});

module.exports = router;
