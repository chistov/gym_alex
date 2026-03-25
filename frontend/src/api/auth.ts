import client from './client';
import type { User } from '../types';

export const authApi = {
  register: (data: { name: string; email: string; password: string; phone?: string }) =>
    client.post<{ token: string; user: User }>('/auth/register', data).then(r => r.data),

  login: (data: { email: string; password: string }) =>
    client.post<{ token: string; user: User }>('/auth/login', data).then(r => r.data),

  me: () =>
    client.get<User>('/auth/me').then(r => r.data),
};
