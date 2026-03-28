import { api } from './api';
import type { Test, UserTest } from '../types';

export const testsService = {
  getAvailable: () => api.get<Test[]>('/tests'),
  getTest: (testId: string) => api.get<Test>(`/tests/${testId}`),
  submitTest: (testId: string, answers: Record<string, string>) =>
    api.post<UserTest>(`/tests/${testId}/submit`, { answers }),
  getMyResults: () => api.get<UserTest[]>('/tests/my-results'),
};
