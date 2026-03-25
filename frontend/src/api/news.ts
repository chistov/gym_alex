import client from './client';
import type { NewsItem, PaginatedResponse } from '../types';

export const newsApi = {
  getAll: (page = 1, limit = 10) =>
    client.get<PaginatedResponse<NewsItem>>(`/news?page=${page}&limit=${limit}`).then(r => r.data),

  getAllAdmin: () =>
    client.get<NewsItem[]>('/news/all').then(r => r.data),

  getById: (id: number) =>
    client.get<NewsItem>(`/news/${id}`).then(r => r.data),

  create: (data: Partial<NewsItem>) =>
    client.post<NewsItem>('/news', data).then(r => r.data),

  update: (id: number, data: Partial<NewsItem>) =>
    client.put<NewsItem>(`/news/${id}`, data).then(r => r.data),

  delete: (id: number) =>
    client.delete(`/news/${id}`).then(r => r.data),
};
