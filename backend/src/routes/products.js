const express = require('express');
const { query } = require('../db/setup');
const { authenticate, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// GET /api/products — public
router.get('/', async (req, res) => {
  try {
    const { category, page = 1, limit = 20 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let countSql = 'SELECT COUNT(*) as cnt FROM products WHERE published = 1';
    let itemsSql = 'SELECT * FROM products WHERE published = 1';
    const params = [];
    let paramIdx = 1;

    if (category) {
      countSql += ` AND category = $${paramIdx}`;
      itemsSql += ` AND category = $${paramIdx}`;
      params.push(category);
      paramIdx++;
    }

    const { rows: countRows } = await query(countSql, params);
    const total = parseInt(countRows[0].cnt);

    itemsSql += ` ORDER BY created_at DESC LIMIT $${paramIdx} OFFSET $${paramIdx + 1}`;
    const { rows: items } = await query(itemsSql, [...params, Number(limit), offset]);

    res.json({ items, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// GET /api/products/all — admin
router.get('/all', authenticate, requireAdmin, async (req, res) => {
  try {
    const { rows } = await query('SELECT * FROM products ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// GET /api/products/categories — public
router.get('/categories', async (req, res) => {
  try {
    const { rows } = await query('SELECT DISTINCT category FROM products WHERE published = 1');
    res.json(rows.map(c => c.category));
  } catch (err) {
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// GET /api/products/:id — public
router.get('/:id', async (req, res) => {
  try {
    const { rows } = await query('SELECT * FROM products WHERE id = $1 AND published = 1', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Товар не найден' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// POST /api/products — admin
router.post('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const { name, description, price, image_url, category = 'general', stock = 0, published = 1 } = req.body;
    if (!name || price === undefined) {
      return res.status(400).json({ message: 'Название и цена обязательны' });
    }

    const { rows } = await query(
      'INSERT INTO products (name, description, price, image_url, category, stock, published) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [name, description || null, price, image_url || null, category, stock, published ? 1 : 0]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// PUT /api/products/:id — admin
router.put('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { name, description, price, image_url, category, stock, published } = req.body;

    const { rows: existing } = await query('SELECT id FROM products WHERE id = $1', [req.params.id]);
    if (existing.length === 0) return res.status(404).json({ message: 'Товар не найден' });

    await query(`
      UPDATE products SET
        name = COALESCE($1, name),
        description = COALESCE($2, description),
        price = COALESCE($3, price),
        image_url = COALESCE($4, image_url),
        category = COALESCE($5, category),
        stock = COALESCE($6, stock),
        published = COALESCE($7, published)
      WHERE id = $8
    `, [name || null, description || null, price || null, image_url || null, category || null, stock !== undefined ? stock : null, published !== undefined ? (published ? 1 : 0) : null, req.params.id]);

    const { rows } = await query('SELECT * FROM products WHERE id = $1', [req.params.id]);
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// DELETE /api/products/:id — admin
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { rows } = await query('SELECT id FROM products WHERE id = $1', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Товар не найден' });
    await query('DELETE FROM products WHERE id = $1', [req.params.id]);
    res.json({ message: 'Товар удалён' });
  } catch (err) {
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

module.exports = router;
