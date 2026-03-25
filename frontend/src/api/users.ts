import client from './client';
import type { User } from '../types';

export const usersApi = {
  getProfile: () =>
    client.get<User>('/users/profile').then(r => r.data),

  updateProfile: (data: Partial<User>) =>
    client.put<User>('/users/profile', data).then(r => r.data),

  getAll: () =>
    client.get<User[]>('/users').then(r => r.data),

  getById: (id: number) =>
    client.get<User>(`/users/${id}`).then(r => r.data),

  update: (id: number, data: Partial<User>) =>
    client.put<User>(`/users/${id}`, data).then(r => r.data),

  delete: (id: number) =>
    client.delete(`/users/${id}`).then(r => r.data),
};
