import { api } from './api';
import type { User, Test, Question } from '../types';

export const adminService = {
  // Users
  getAllUsers: () => api.get<User[]>('/admin/users'),
  getPendingUsers: () => api.get<User[]>('/admin/users/pending'),
  approveUser: (userId: string) => api.patch(`/admin/users/${userId}/approve`),
  rejectUser: (userId: string) => api.patch(`/admin/users/${userId}/reject`),

  // Tests
  getTests: () => api.get<Test[]>('/admin/tests'),
  createTest: (data: Omit<Test, 'id'>) => api.post<Test>('/admin/tests', data),
  deleteTest: (testId: string) => api.delete(`/admin/tests/${testId}`),

  // Questions
  addQuestion: (testId: string, data: Omit<Question, 'id' | 'testId'>) =>
    api.post<Question>(`/admin/tests/${testId}/questions`, data),
};
