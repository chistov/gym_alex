import { create } from 'zustand';
import type { User } from '../types';
import { authApi } from '../api/auth';

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { name: string; email: string; password: string; phone?: string }) => Promise<void>;
  logout: () => void;
  loadUser: () => Promise<void>;
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('token'),
  loading: false,

  login: async (email, password) => {
    const { token, user } = await authApi.login({ email, password });
    localStorage.setItem('token', token);
    set({ token, user });
  },

  register: async (data) => {
    const { token, user } = await authApi.register(data);
    localStorage.setItem('token', token);
    set({ token, user });
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ token: null, user: null });
  },

  loadUser: async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    set({ loading: true });
    try {
      const user = await authApi.me();
      set({ user, loading: false });
    } catch {
      localStorage.removeItem('token');
      set({ token: null, user: null, loading: false });
    }
  },

  setUser: (user) => set({ user }),
}));
