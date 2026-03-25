import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import LoginPage from '../pages/LoginPage';

const mockNavigate = vi.fn();
const mockLogin = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock('../store/authStore', () => ({
  useAuthStore: () => ({
    login: mockLogin,
    user: null,
    token: null,
    logout: vi.fn(),
  }),
}));

const renderLogin = () =>
  render(
    <ConfigProvider>
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    </ConfigProvider>
  );

describe('LoginPage', () => {
  beforeEach(() => {
    mockNavigate.mockReset();
    mockLogin.mockReset();
  });

  it('renders login form', () => {
    renderLogin();
    expect(screen.getByPlaceholderText('Email')).toBeDefined();
    expect(screen.getByPlaceholderText('Пароль')).toBeDefined();
    expect(screen.getByRole('button', { name: /войти/i })).toBeDefined();
  });

  it('shows error on invalid credentials', async () => {
    mockLogin.mockRejectedValue({
      response: { data: { message: 'Неверный email или пароль' } },
    });
    renderLogin();
    const user = userEvent.setup();

    await user.type(screen.getByPlaceholderText('Email'), 'wrong@example.com');
    await user.type(screen.getByPlaceholderText('Пароль'), 'wrongpass');
    await user.click(screen.getByRole('button', { name: /войти/i }));

    await waitFor(() => {
      expect(screen.getByText(/неверный email или пароль/i)).toBeDefined();
    });
  });

  it('navigates to /news on successful login', async () => {
    mockLogin.mockResolvedValue(undefined);
    renderLogin();
    const user = userEvent.setup();

    await user.type(screen.getByPlaceholderText('Email'), 'test@example.com');
    await user.type(screen.getByPlaceholderText('Пароль'), 'password123');
    await user.click(screen.getByRole('button', { name: /войти/i }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/news');
    });
  });

  it('has link to registration page', () => {
    renderLogin();
    expect(screen.getByText(/зарегистрироваться/i)).toBeDefined();
  });
});
