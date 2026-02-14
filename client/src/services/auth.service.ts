import api from '../api/api';
import type { AuthUser } from '../types';

export const authService = {
  async login(username: string, password: string): Promise<{ message: string; user: AuthUser }> {
    const response = await api.post('/auth/login', { username, password });
    return response.data;
  },

  async register(data: any): Promise<any> {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  async getMe(): Promise<AuthUser> {
    const response = await api.get('/auth/me');
    return response.data;
  },

  async logout(): Promise<void> {
    await api.post('/auth/logout');
  },

  async verifyEmail(token: string): Promise<void> {
    await api.post('/auth/verify-email', { token });
  }
};
