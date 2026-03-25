process.env.DB_PATH = ':memory:';
process.env.JWT_SECRET = 'test_secret';

const request = require('supertest');
const app = require('../src/index');
const { setupDatabase, closeDb } = require('../src/db/setup');

beforeAll(() => setupDatabase());
afterAll(() => closeDb());

let adminToken;

beforeAll(async () => {
  const res = await request(app).post('/api/auth/login').send({
    email: 'admin@gym-alex.ru',
    password: 'admin123',
  });
  adminToken = res.body.token;
});

describe('GET /api/products', () => {
  it('returns products publicly', async () => {
    const res = await request(app).get('/api/products');
    expect(res.status).toBe(200);
    expect(res.body.items).toBeDefined();
    expect(res.body.total).toBeGreaterThan(0);
  });

  it('filters by category', async () => {
    const res = await request(app).get('/api/products?category=services');
    expect(res.status).toBe(200);
    res.body.items.forEach(item => expect(item.category).toBe('services'));
  });
});

describe('POST /api/products', () => {
  it('admin can create product', async () => {
    const res = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Новый товар', price: 999, category: 'equipment', stock: 10 });
    expect(res.status).toBe(201);
    expect(res.body.name).toBe('Новый товар');
    expect(res.body.price).toBe(999);
  });

  it('requires name and price', async () => {
    const res = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Без цены' });
    expect(res.status).toBe(400);
  });
});

describe('PUT /api/products/:id', () => {
  let productId;

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Для обновления', price: 500 });
    productId = res.body.id;
  });

  it('admin can update product', async () => {
    const res = await request(app)
      .put(`/api/products/${productId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ price: 750 });
    expect(res.status).toBe(200);
    expect(res.body.price).toBe(750);
  });
});

describe('DELETE /api/products/:id', () => {
  let productId;

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Для удаления', price: 100 });
    productId = res.body.id;
  });

  it('admin can delete product', async () => {
    const res = await request(app)
      .delete(`/api/products/${productId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
  });
});
