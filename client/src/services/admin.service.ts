import api from '../api/api';
import type { User, Company, Role } from '../types';

export const userService = {
  async getAll(): Promise<User[]> {
    const response = await api.get('/user');
    return response.data;
  },

  async getById(id: string): Promise<User> {
    const response = await api.get(`/user/${id}`);
    return response.data;
  },

  async update(id: string, data: any): Promise<User> {
    const response = await api.patch(`/user/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/user/${id}`);
  },

  async getMe(): Promise<User> {
    const response = await api.get('/user/me');
    return response.data;
  },

  async updateMe(data: any): Promise<User> {
    const response = await api.patch('/user/me', data);
    return response.data;
  }
};

export const roleService = {
  async getAll(): Promise<Role[]> {
    const response = await api.get('/role');
    return response.data;
  }
};

export const companyService = {
  async getAll(): Promise<Company[]> {
    const response = await api.get('/company');
    return response.data;
  },

  async create(data: any): Promise<Company> {
    const response = await api.post('/company', data);
    return response.data;
  },

  async update(id: string, data: any): Promise<Company> {
    const response = await api.patch(`/company/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/company/${id}`);
  },

  async getMyCompany(): Promise<Company> {
    const response = await api.get('/company/me');
    return response.data;
  },

  async updateMyCompany(data: any): Promise<Company> {
    const response = await api.patch('/company/me', data);
    return response.data;
  }
};
