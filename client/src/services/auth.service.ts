import api from '../api/api';
import type { AuthUser } from '../types';

export const authService = {
  async login(username: string, password: string): Promise<{ message: string; user: AuthUser }> {
    const response = await api.post('/auth/login', { username, password });
    const { user, message } = response.data;
    return {
      message,
      user: {
        userId: user.id,
        username: user.username,
        role: user.role,
        companyId: user.companyId,
      }
    };
  },

  async register(data: any): Promise<any> {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  async getMe(): Promise<AuthUser> {
    const response = await api.get('/auth/me');
    const user = response.data;
    return {
      userId: user.userId || user.id,
      username: user.username,
      role: user.role,
      companyId: user.companyId,
    };
  },

  async logout(): Promise<void> {
    await api.post('/auth/logout');
  },

  async verifyEmail(token: string): Promise<void> {
    await api.post('/auth/verify-email', { token });
  }
};
