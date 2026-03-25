const express = require('express');
const { getDb } = require('../db/setup');
const { authenticate, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// GET /api/news — public
router.get('/', (req, res) => {
  const db = getDb();
  const { page = 1, limit = 10 } = req.query;
  const offset = (Number(page) - 1) * Number(limit);

  const total = db.prepare('SELECT COUNT(*) as cnt FROM news WHERE published = 1').get().cnt;
  const items = db.prepare('SELECT * FROM news WHERE published = 1 ORDER BY created_at DESC LIMIT ? OFFSET ?').all(Number(limit), offset);

  res.json({ items, total, page: Number(page), limit: Number(limit) });
});

// GET /api/news/all — admin (includes unpublished)
router.get('/all', authenticate, requireAdmin, (req, res) => {
  const db = getDb();
  const items = db.prepare('SELECT * FROM news ORDER BY created_at DESC').all();
  res.json(items);
});

// GET /api/news/:id — public
router.get('/:id', (req, res) => {
  const db = getDb();
  const item = db.prepare('SELECT * FROM news WHERE id = ? AND published = 1').get(req.params.id);
  if (!item) return res.status(404).json({ message: 'Новость не найдена' });
  res.json(item);
});

// POST /api/news — admin
router.post('/', authenticate, requireAdmin, (req, res) => {
  const { title, content, image_url, published = 1 } = req.body;
  if (!title || !content) {
    return res.status(400).json({ message: 'Заголовок и содержание обязательны' });
  }

  const db = getDb();
  const result = db.prepare(
    'INSERT INTO news (title, content, image_url, published) VALUES (?, ?, ?, ?)'
  ).run(title, content, image_url || null, published ? 1 : 0);

  const item = db.prepare('SELECT * FROM news WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(item);
});

// PUT /api/news/:id — admin
router.put('/:id', authenticate, requireAdmin, (req, res) => {
  const { title, content, image_url, published } = req.body;
  const db = getDb();

  const existing = db.prepare('SELECT id FROM news WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ message: 'Новость не найдена' });

  db.prepare(`
    UPDATE news SET
      title = COALESCE(?, title),
      content = COALESCE(?, content),
      image_url = COALESCE(?, image_url),
      published = COALESCE(?, published),
      updated_at = datetime('now')
    WHERE id = ?
  `).run(title || null, content || null, image_url || null, published !== undefined ? (published ? 1 : 0) : null, req.params.id);

  const updated = db.prepare('SELECT * FROM news WHERE id = ?').get(req.params.id);
  res.json(updated);
});

// DELETE /api/news/:id — admin
router.delete('/:id', authenticate, requireAdmin, (req, res) => {
  const db = getDb();
  const existing = db.prepare('SELECT id FROM news WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ message: 'Новость не найдена' });
  db.prepare('DELETE FROM news WHERE id = ?').run(req.params.id);
  res.json({ message: 'Новость удалена' });
});

module.exports = router;
