const { setupDatabase, closeDb } = require('./setup');
const request = require('supertest');
const app = require('../src/index');

beforeAll(async () => {
  await setupDatabase();
});
afterAll(() => closeDb());

let adminToken;
let userToken;

beforeAll(async () => {
  await request(app).post('/api/auth/register').send({
    name: 'Пользователь',
    email: 'newsuser@example.com',
    password: 'password123',
  });
  const userRes = await request(app).post('/api/auth/login').send({
    email: 'newsuser@example.com',
    password: 'password123',
  });
  userToken = userRes.body.token;

  const adminRes = await request(app).post('/api/auth/login').send({
    email: 'admin@gym-alex.ru',
    password: 'admin123',
  });
  adminToken = adminRes.body.token;
});

describe('GET /api/news', () => {
  it('returns published news publicly', async () => {
    const res = await request(app).get('/api/news');
    expect(res.status).toBe(200);
    expect(res.body.items).toBeDefined();
    expect(Array.isArray(res.body.items)).toBe(true);
    expect(res.body.total).toBeDefined();
  });
});

describe('POST /api/news', () => {
  it('admin can create news', async () => {
    const res = await request(app)
      .post('/api/news')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ title: 'Тест новость', content: 'Содержание тестовой новости' });
    expect(res.status).toBe(201);
    expect(res.body.title).toBe('Тест новость');
  });

  it('non-admin cannot create news', async () => {
    const res = await request(app)
      .post('/api/news')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ title: 'Попытка', content: 'Не должно пройти' });
    expect(res.status).toBe(403);
  });

  it('requires title and content', async () => {
    const res = await request(app)
      .post('/api/news')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ title: 'Без контента' });
    expect(res.status).toBe(400);
  });
});

describe('PUT /api/news/:id', () => {
  let newsId;

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/news')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ title: 'Для обновления', content: 'Содержание' });
    newsId = res.body.id;
  });

  it('admin can update news', async () => {
    const res = await request(app)
      .put(`/api/news/${newsId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ title: 'Обновлённый заголовок' });
    expect(res.status).toBe(200);
    expect(res.body.title).toBe('Обновлённый заголовок');
  });
});

describe('DELETE /api/news/:id', () => {
  let newsId;

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/news')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ title: 'Для удаления', content: 'Содержание' });
    newsId = res.body.id;
  });

  it('admin can delete news', async () => {
    const res = await request(app)
      .delete(`/api/news/${newsId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
  });

  it('returns 404 for deleted news', async () => {
    const res = await request(app).get(`/api/news/${newsId}`);
    expect(res.status).toBe(404);
  });
});
