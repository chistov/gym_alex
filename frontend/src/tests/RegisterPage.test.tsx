import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import RegisterPage from '../pages/RegisterPage';

const mockNavigate = vi.fn();
const mockRegister = vi.fn();
const mockSetUser = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock('../store/authStore', () => ({
  useAuthStore: () => ({
    register: mockRegister,
    setUser: mockSetUser,
    user: null,
    token: null,
  }),
}));

vi.mock('../api/users', () => ({
  usersApi: {
    updateProfile: vi.fn().mockResolvedValue({ id: 1, name: 'Test', email: 'test@example.com', role: 'user', created_at: '' }),
  },
}));

const renderRegister = () =>
  render(
    <ConfigProvider>
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>
    </ConfigProvider>
  );

describe('RegisterPage', () => {
  beforeEach(() => {
    mockNavigate.mockReset();
    mockRegister.mockReset();
    mockSetUser.mockReset();
  });

  it('renders step 1 initially', () => {
    renderRegister();
    expect(screen.getByPlaceholderText(/иван иванов/i)).toBeDefined();
    expect(screen.getByPlaceholderText(/ivan@example.com/i)).toBeDefined();
  });

  it('shows steps indicator', () => {
    renderRegister();
    // Use the steps item title specifically
    const stepTitles = screen.getAllByText(/аккаунт/i);
    expect(stepTitles.length).toBeGreaterThan(0);
    expect(screen.getByText(/параметры/i)).toBeDefined();
    expect(screen.getByText(/цели/i)).toBeDefined();
  });

  it('validates required fields on step 1', async () => {
    renderRegister();
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /далее/i }));
    await waitFor(() => {
      expect(screen.getByText(/введите имя/i)).toBeDefined();
    });
  });

  it('advances to step 2 with valid data', async () => {
    renderRegister();
    const user = userEvent.setup();

    await user.type(screen.getByPlaceholderText(/иван иванов/i), 'Тест Пользователь');
    await user.type(screen.getByPlaceholderText(/ivan@example.com/i), 'new@example.com');

    const passwordInputs = screen.getAllByPlaceholderText(/минимум 6 символов/i);
    await user.type(passwordInputs[0], 'password123');

    await user.click(screen.getByRole('button', { name: /далее/i }));

    await waitFor(() => {
      expect(screen.getAllByText(/рост/i).length).toBeGreaterThan(0);
    });
  });
});
