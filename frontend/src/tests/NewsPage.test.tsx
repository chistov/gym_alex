import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import NewsPage from '../pages/NewsPage';

vi.mock('../api/news', () => ({
  newsApi: {
    getAll: vi.fn().mockResolvedValue({
      items: [
        { id: 1, title: 'Первая новость', content: 'Содержание первой новости', published: 1, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
        { id: 2, title: 'Вторая новость', content: 'Содержание второй новости', published: 1, created_at: '2024-01-02T00:00:00Z', updated_at: '2024-01-02T00:00:00Z' },
      ],
      total: 2,
      page: 1,
      limit: 10,
    }),
  },
}));

vi.mock('../store/authStore', () => ({
  useAuthStore: () => ({
    user: { id: 1, name: 'Тест', email: 'test@example.com', role: 'user', created_at: '2024-01-01' },
    token: 'mock-token',
  }),
}));

const renderNews = () =>
  render(
    <ConfigProvider>
      <MemoryRouter>
        <NewsPage />
      </MemoryRouter>
    </ConfigProvider>
  );

describe('NewsPage', () => {
  it('renders page title', async () => {
    renderNews();
    await waitFor(() => {
      expect(screen.getByText(/новости и статьи/i)).toBeDefined();
    });
  });

  it('loads and displays news items', async () => {
    renderNews();
    await waitFor(() => {
      expect(screen.getByText('Первая новость')).toBeDefined();
      expect(screen.getByText('Вторая новость')).toBeDefined();
    });
  });

  it('shows news content', async () => {
    renderNews();
    await waitFor(() => {
      expect(screen.getByText(/содержание первой новости/i)).toBeDefined();
    });
  });
});
