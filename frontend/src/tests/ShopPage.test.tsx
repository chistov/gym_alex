import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import ShopPage from '../pages/ShopPage';

vi.mock('../api/products', () => ({
  productsApi: {
    getAll: vi.fn().mockResolvedValue({
      items: [
        { id: 1, name: 'Консультация тренера', description: 'Персональная консультация', price: 2500, category: 'services', stock: 999, published: 1, created_at: '2024-01-01T00:00:00Z' },
        { id: 2, name: 'Абонемент на месяц', description: 'Пакет занятий', price: 18000, category: 'subscription', stock: 50, published: 1, created_at: '2024-01-01T00:00:00Z' },
      ],
      total: 2,
      page: 1,
      limit: 20,
    }),
  },
}));

vi.mock('../store/authStore', () => ({
  useAuthStore: () => ({
    user: { id: 1, name: 'Тест', email: 'test@example.com', role: 'user', created_at: '2024-01-01' },
    token: 'mock-token',
  }),
}));

const renderShop = () =>
  render(
    <ConfigProvider>
      <MemoryRouter>
        <ShopPage />
      </MemoryRouter>
    </ConfigProvider>
  );

describe('ShopPage', () => {
  it('renders shop title', () => {
    renderShop();
    expect(screen.getByText(/магазин/i)).toBeDefined();
  });

  it('loads and displays products', async () => {
    renderShop();
    await waitFor(() => {
      expect(screen.getByText('Консультация тренера')).toBeDefined();
      expect(screen.getByText('Абонемент на месяц')).toBeDefined();
    });
  });

  it('displays product prices in rubles', async () => {
    renderShop();
    await waitFor(() => {
      expect(screen.getByText(/2\s*500\s*₽/)).toBeDefined();
    });
  });

  it('shows category filter select', () => {
    renderShop();
    expect(screen.getByText(/все категории/i)).toBeDefined();
  });
});
