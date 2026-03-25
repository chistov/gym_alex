import client from './client';
import type { Training, Exercise, UserTraining } from '../types';

export const trainingsApi = {
  getAll: () =>
    client.get<Training[]>('/trainings').then(r => r.data),

  getAllAdmin: () =>
    client.get<Training[]>('/trainings/all').then(r => r.data),

  getById: (id: number) =>
    client.get<Training>(`/trainings/${id}`).then(r => r.data),

  create: (data: Partial<Training>) =>
    client.post<Training>('/trainings', data).then(r => r.data),

  update: (id: number, data: Partial<Training>) =>
    client.put<Training>(`/trainings/${id}`, data).then(r => r.data),

  delete: (id: number) =>
    client.delete(`/trainings/${id}`).then(r => r.data),

  addExercise: (trainingId: number, data: Partial<Exercise>) =>
    client.post<Exercise>(`/trainings/${trainingId}/exercises`, data).then(r => r.data),

  updateExercise: (exerciseId: number, data: Partial<Exercise>) =>
    client.put<Exercise>(`/trainings/exercises/${exerciseId}`, data).then(r => r.data),

  deleteExercise: (exerciseId: number) =>
    client.delete(`/trainings/exercises/${exerciseId}`).then(r => r.data),
};

export const userTrainingsApi = {
  getMyTrainings: () =>
    client.get<UserTraining[]>('/user-trainings').then(r => r.data),

  assign: (data: { user_id: number; training_id: number; notes?: string }) =>
    client.post<UserTraining>('/user-trainings', data).then(r => r.data),

  updateStatus: (id: number, data: { status?: string; notes?: string }) =>
    client.put<UserTraining>(`/user-trainings/${id}`, data).then(r => r.data),

  delete: (id: number) =>
    client.delete(`/user-trainings/${id}`).then(r => r.data),
};
