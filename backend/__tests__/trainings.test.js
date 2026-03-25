process.env.DB_PATH = ':memory:';
process.env.JWT_SECRET = 'test_secret';

const request = require('supertest');
const app = require('../src/index');
const { setupDatabase, closeDb } = require('../src/db/setup');

beforeAll(() => setupDatabase());
afterAll(() => closeDb());

let adminToken;
let userToken;
let userId;

beforeAll(async () => {
  const regRes = await request(app).post('/api/auth/register').send({
    name: 'Тест',
    email: 'trainuser@example.com',
    password: 'password123',
  });
  userToken = regRes.body.token;
  userId = regRes.body.user.id;

  const adminRes = await request(app).post('/api/auth/login').send({
    email: 'admin@gym-alex.ru',
    password: 'admin123',
  });
  adminToken = adminRes.body.token;
});

describe('GET /api/trainings', () => {
  it('returns published trainings publicly', async () => {
    const res = await request(app).get('/api/trainings');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });
});

describe('GET /api/trainings/:id', () => {
  it('returns training with exercises', async () => {
    const listRes = await request(app).get('/api/trainings');
    const id = listRes.body[0].id;

    const res = await request(app).get(`/api/trainings/${id}`);
    expect(res.status).toBe(200);
    expect(res.body.exercises).toBeDefined();
    expect(Array.isArray(res.body.exercises)).toBe(true);
  });
});

describe('POST /api/trainings', () => {
  it('admin can create training', async () => {
    const res = await request(app)
      .post('/api/trainings')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ title: 'Тест программа', description: 'Описание', difficulty: 'beginner', duration_weeks: 4 });
    expect(res.status).toBe(201);
    expect(res.body.title).toBe('Тест программа');
    expect(res.body.exercises).toEqual([]);
  });

  it('non-admin cannot create training', async () => {
    const res = await request(app)
      .post('/api/trainings')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ title: 'Попытка' });
    expect(res.status).toBe(403);
  });
});

describe('POST /api/trainings/:id/exercises', () => {
  let trainingId;

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/trainings')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ title: 'Программа с упражнениями', difficulty: 'intermediate' });
    trainingId = res.body.id;
  });

  it('admin can add exercise to training', async () => {
    const res = await request(app)
      .post(`/api/trainings/${trainingId}/exercises`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Жим лёжа', sets: 4, reps: '8', rest_seconds: 90 });
    expect(res.status).toBe(201);
    expect(res.body.name).toBe('Жим лёжа');
  });
});

describe('User training assignments', () => {
  let trainingId;

  beforeAll(async () => {
    const res = await request(app).get('/api/trainings');
    trainingId = res.body[0].id;
  });

  it('admin can assign training to user', async () => {
    const res = await request(app)
      .post('/api/user-trainings')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ user_id: userId, training_id: trainingId, notes: 'Начинаем с базы' });
    expect(res.status).toBe(201);
    expect(res.body.user_id).toBe(userId);
  });

  it('user can see own trainings', async () => {
    const res = await request(app)
      .get('/api/user-trainings')
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });
});
