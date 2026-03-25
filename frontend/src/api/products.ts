import client from './client';
import type { Product, PaginatedResponse } from '../types';

export const productsApi = {
  getAll: (params?: { category?: string; page?: number; limit?: number }) => {
    const q = new URLSearchParams();
    if (params?.category) q.set('category', params.category);
    if (params?.page) q.set('page', String(params.page));
    if (params?.limit) q.set('limit', String(params.limit));
    return client.get<PaginatedResponse<Product>>(`/products?${q}`).then(r => r.data);
  },

  getAllAdmin: () =>
    client.get<Product[]>('/products/all').then(r => r.data),

  getById: (id: number) =>
    client.get<Product>(`/products/${id}`).then(r => r.data),

  create: (data: Partial<Product>) =>
    client.post<Product>('/products', data).then(r => r.data),

  update: (id: number, data: Partial<Product>) =>
    client.put<Product>(`/products/${id}`, data).then(r => r.data),

  delete: (id: number) =>
    client.delete(`/products/${id}`).then(r => r.data),
};
