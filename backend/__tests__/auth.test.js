const { setupDatabase, closeDb, cleanDatabase } = require('./setup');
const request = require('supertest');
const app = require('../src/index');

beforeAll(async () => {
  await setupDatabase();
  await cleanDatabase();
  await setupDatabase(); // re-seed
});
afterAll(() => closeDb());

describe('POST /api/auth/register', () => {
  it('registers a new user', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Тест Пользователь',
      email: 'test@example.com',
      password: 'password123',
    });
    expect(res.status).toBe(201);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe('test@example.com');
    expect(res.body.user.role).toBe('user');
  });

  it('rejects duplicate email', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Дубль',
      email: 'test@example.com',
      password: 'password123',
    });
    expect(res.status).toBe(409);
  });

  it('rejects short password', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Тест',
      email: 'new@example.com',
      password: '123',
    });
    expect(res.status).toBe(400);
  });

  it('rejects missing fields', async () => {
    const res = await request(app).post('/api/auth/register').send({ email: 'x@x.com' });
    expect(res.status).toBe(400);
  });
});

describe('POST /api/auth/login', () => {
  it('logs in with correct credentials', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'test@example.com',
      password: 'password123',
    });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe('test@example.com');
  });

  it('rejects wrong password', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'test@example.com',
      password: 'wrongpassword',
    });
    expect(res.status).toBe(401);
  });

  it('rejects unknown email', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'nobody@example.com',
      password: 'password123',
    });
    expect(res.status).toBe(401);
  });
});

describe('GET /api/auth/me', () => {
  let token;

  beforeAll(async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'test@example.com',
      password: 'password123',
    });
    token = res.body.token;
  });

  it('returns own user data with valid token', async () => {
    const res = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.email).toBe('test@example.com');
  });

  it('returns 401 without token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });
});
