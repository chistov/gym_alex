import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import ProfilePage from '../pages/ProfilePage';
import { useAuthStore } from '../store/authStore';

const mockUser = {
  id: 1,
  name: 'Тест Пользователь',
  email: 'test@example.com',
  role: 'user' as const,
  height: 175,
  weight: 70,
  age: 30,
  gender: 'male',
  fitness_goal: 'Похудение',
  created_at: '2024-01-01T00:00:00Z',
};

const renderProfile = () =>
  render(
    <ConfigProvider>
      <MemoryRouter>
        <ProfilePage />
      </MemoryRouter>
    </ConfigProvider>
  );

describe('ProfilePage', () => {
  beforeEach(() => {
    useAuthStore.setState({ user: mockUser, token: 'mock-token' });
  });

  it('renders user name', () => {
    renderProfile();
    expect(screen.getByText('Тест Пользователь')).toBeDefined();
  });

  it('renders user email', () => {
    renderProfile();
    expect(screen.getByText('test@example.com')).toBeDefined();
  });

  it('shows fitness parameters', () => {
    renderProfile();
    expect(screen.getByText(/175 см/i)).toBeDefined();
    expect(screen.getByText(/70 кг/i)).toBeDefined();
    expect(screen.getByText(/30 лет/i)).toBeDefined();
  });

  it('shows edit button', () => {
    renderProfile();
    expect(screen.getByRole('button', { name: /редактировать/i })).toBeDefined();
  });

  it('opens edit form on button click', async () => {
    renderProfile();
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /редактировать/i }));
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /сохранить/i })).toBeDefined();
    });
  });
});
