import { http, HttpResponse } from 'msw';

const mockUser = {
  id: 1,
  name: 'Тест Пользователь',
  email: 'test@example.com',
  role: 'user' as const,
  created_at: '2024-01-01T00:00:00Z',
};

const mockAdmin = {
  id: 2,
  name: 'Алексей Голубев',
  email: 'admin@gym-alex.ru',
  role: 'admin' as const,
  created_at: '2024-01-01T00:00:00Z',
};

const mockNews = [
  { id: 1, title: 'Первая новость', content: 'Содержание первой новости', published: 1, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
  { id: 2, title: 'Вторая новость', content: 'Содержание второй новости', published: 1, created_at: '2024-01-02T00:00:00Z', updated_at: '2024-01-02T00:00:00Z' },
];

const mockProducts = [
  { id: 1, name: 'Консультация', description: 'Персональная консультация', price: 2500, category: 'services', stock: 999, published: 1, created_at: '2024-01-01T00:00:00Z' },
  { id: 2, name: 'Абонемент', description: 'Пакет занятий', price: 18000, category: 'subscription', stock: 50, published: 1, created_at: '2024-01-01T00:00:00Z' },
];

const mockTrainings = [
  { id: 1, title: 'Для начинающих', description: 'Стартовая программа', difficulty: 'beginner', duration_weeks: 4, published: 1, created_at: '2024-01-01T00:00:00Z' },
];

export const handlers = [
  // Auth
  http.post('/api/auth/login', async ({ request }) => {
    const body = await request.json() as { email: string; password: string };
    if (body.email === 'test@example.com' && body.password === 'password123') {
      return HttpResponse.json({ token: 'mock-token', user: mockUser });
    }
    if (body.email === 'admin@gym-alex.ru' && body.password === 'admin123') {
      return HttpResponse.json({ token: 'mock-admin-token', user: mockAdmin });
    }
    return HttpResponse.json({ message: 'Неверный email или пароль' }, { status: 401 });
  }),

  http.post('/api/auth/register', async ({ request }) => {
    const body = await request.json() as { name: string; email: string; password: string };
    if (body.email === 'existing@example.com') {
      return HttpResponse.json({ message: 'Пользователь уже существует' }, { status: 409 });
    }
    return HttpResponse.json({
      token: 'new-token',
      user: { ...mockUser, name: body.name, email: body.email },
    }, { status: 201 });
  }),

  http.get('/api/auth/me', ({ request }) => {
    const auth = request.headers.get('Authorization');
    if (auth === 'Bearer mock-token') return HttpResponse.json(mockUser);
    if (auth === 'Bearer mock-admin-token') return HttpResponse.json(mockAdmin);
    return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }),

  // Users
  http.get('/api/users/profile', () => HttpResponse.json(mockUser)),
  http.put('/api/users/profile', async ({ request }) => {
    const body = await request.json() as Record<string, unknown>;
    return HttpResponse.json({ ...mockUser, ...body });
  }),
  http.get('/api/users', () => HttpResponse.json([mockUser, mockAdmin])),

  // News
  http.get('/api/news', () => HttpResponse.json({
    items: mockNews,
    total: mockNews.length,
    page: 1,
    limit: 10,
  })),
  http.get('/api/news/all', () => HttpResponse.json(mockNews)),
  http.post('/api/news', async ({ request }) => {
    const body = await request.json() as Record<string, unknown>;
    return HttpResponse.json({ id: 3, ...body, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }, { status: 201 });
  }),

  // Products
  http.get('/api/products', () => HttpResponse.json({
    items: mockProducts,
    total: mockProducts.length,
    page: 1,
    limit: 20,
  })),
  http.get('/api/products/all', () => HttpResponse.json(mockProducts)),

  // Trainings
  http.get('/api/trainings', () => HttpResponse.json(mockTrainings)),
  http.get('/api/trainings/all', () => HttpResponse.json(mockTrainings)),
  http.get('/api/trainings/:id', ({ params }) => {
    const training = mockTrainings.find(t => t.id === Number(params.id));
    if (!training) return HttpResponse.json({ message: 'Not found' }, { status: 404 });
    return HttpResponse.json({ ...training, exercises: [] });
  }),

  // User trainings
  http.get('/api/user-trainings', () => HttpResponse.json([])),
];
