const express = require('express');
const { query } = require('../db/setup');
const { authenticate, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// GET /api/news — public
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    const { rows: countRows } = await query('SELECT COUNT(*) as cnt FROM news WHERE published = 1');
    const total = parseInt(countRows[0].cnt);
    const { rows: items } = await query(
      'SELECT * FROM news WHERE published = 1 ORDER BY created_at DESC LIMIT $1 OFFSET $2',
      [Number(limit), offset]
    );

    res.json({ items, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// GET /api/news/all — admin (includes unpublished)
router.get('/all', authenticate, requireAdmin, async (req, res) => {
  try {
    const { rows } = await query('SELECT * FROM news ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// GET /api/news/:id — public
router.get('/:id', async (req, res) => {
  try {
    const { rows } = await query('SELECT * FROM news WHERE id = $1 AND published = 1', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Новость не найдена' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// POST /api/news — admin
router.post('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const { title, content, image_url, published = 1 } = req.body;
    if (!title || !content) {
      return res.status(400).json({ message: 'Заголовок и содержание обязательны' });
    }

    const { rows } = await query(
      'INSERT INTO news (title, content, image_url, published) VALUES ($1, $2, $3, $4) RETURNING *',
      [title, content, image_url || null, published ? 1 : 0]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// PUT /api/news/:id — admin
router.put('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { title, content, image_url, published } = req.body;

    const { rows: existing } = await query('SELECT id FROM news WHERE id = $1', [req.params.id]);
    if (existing.length === 0) return res.status(404).json({ message: 'Новость не найдена' });

    await query(`
      UPDATE news SET
        title = COALESCE($1, title),
        content = COALESCE($2, content),
        image_url = COALESCE($3, image_url),
        published = COALESCE($4, published),
        updated_at = NOW()
      WHERE id = $5
    `, [title || null, content || null, image_url || null, published !== undefined ? (published ? 1 : 0) : null, req.params.id]);

    const { rows } = await query('SELECT * FROM news WHERE id = $1', [req.params.id]);
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// DELETE /api/news/:id — admin
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { rows } = await query('SELECT id FROM news WHERE id = $1', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Новость не найдена' });
    await query('DELETE FROM news WHERE id = $1', [req.params.id]);
    res.json({ message: 'Новость удалена' });
  } catch (err) {
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

module.exports = router;
