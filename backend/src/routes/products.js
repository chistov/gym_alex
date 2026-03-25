const express = require('express');
const { getDb } = require('../db/setup');
const { authenticate, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// GET /api/products — public
router.get('/', (req, res) => {
  const db = getDb();
  const { category, page = 1, limit = 20 } = req.query;
  const offset = (Number(page) - 1) * Number(limit);

  let query = 'SELECT * FROM products WHERE published = 1';
  let countQuery = 'SELECT COUNT(*) as cnt FROM products WHERE published = 1';
  const params = [];

  if (category) {
    query += ' AND category = ?';
    countQuery += ' AND category = ?';
    params.push(category);
  }

  const total = db.prepare(countQuery).get(...params).cnt;
  query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
  const items = db.prepare(query).all(...params, Number(limit), offset);

  res.json({ items, total, page: Number(page), limit: Number(limit) });
});

// GET /api/products/all — admin
router.get('/all', authenticate, requireAdmin, (req, res) => {
  const db = getDb();
  const items = db.prepare('SELECT * FROM products ORDER BY created_at DESC').all();
  res.json(items);
});

// GET /api/products/categories — public
router.get('/categories', (req, res) => {
  const db = getDb();
  const cats = db.prepare('SELECT DISTINCT category FROM products WHERE published = 1').all();
  res.json(cats.map(c => c.category));
});

// GET /api/products/:id — public
router.get('/:id', (req, res) => {
  const db = getDb();
  const item = db.prepare('SELECT * FROM products WHERE id = ? AND published = 1').get(req.params.id);
  if (!item) return res.status(404).json({ message: 'Товар не найден' });
  res.json(item);
});

// POST /api/products — admin
router.post('/', authenticate, requireAdmin, (req, res) => {
  const { name, description, price, image_url, category = 'general', stock = 0, published = 1 } = req.body;
  if (!name || price === undefined) {
    return res.status(400).json({ message: 'Название и цена обязательны' });
  }

  const db = getDb();
  const result = db.prepare(
    'INSERT INTO products (name, description, price, image_url, category, stock, published) VALUES (?, ?, ?, ?, ?, ?, ?)'
  ).run(name, description || null, price, image_url || null, category, stock, published ? 1 : 0);

  const item = db.prepare('SELECT * FROM products WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(item);
});

// PUT /api/products/:id — admin
router.put('/:id', authenticate, requireAdmin, (req, res) => {
  const { name, description, price, image_url, category, stock, published } = req.body;
  const db = getDb();

  const existing = db.prepare('SELECT id FROM products WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ message: 'Товар не найден' });

  db.prepare(`
    UPDATE products SET
      name = COALESCE(?, name),
      description = COALESCE(?, description),
      price = COALESCE(?, price),
      image_url = COALESCE(?, image_url),
      category = COALESCE(?, category),
      stock = COALESCE(?, stock),
      published = COALESCE(?, published)
    WHERE id = ?
  `).run(name || null, description || null, price || null, image_url || null, category || null, stock !== undefined ? stock : null, published !== undefined ? (published ? 1 : 0) : null, req.params.id);

  const updated = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
  res.json(updated);
});

// DELETE /api/products/:id — admin
router.delete('/:id', authenticate, requireAdmin, (req, res) => {
  const db = getDb();
  const existing = db.prepare('SELECT id FROM products WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ message: 'Товар не найден' });
  db.prepare('DELETE FROM products WHERE id = ?').run(req.params.id);
  res.json({ message: 'Товар удалён' });
});

module.exports = router;
