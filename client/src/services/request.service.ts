import api from '../api/api';
import type { LogisticRequest } from '../types';

export const requestService = {
  async getAll(): Promise<LogisticRequest[]> {
    const response = await api.get('/request');
    return response.data;
  },

  async getById(id: string): Promise<LogisticRequest> {
    const response = await api.get(`/request/${id}`);
    return response.data;
  },

  async create(data: any): Promise<LogisticRequest> {
    const response = await api.post('/request', data);
    return response.data;
  },

  async update(id: string, data: any): Promise<LogisticRequest> {
    const response = await api.patch(`/request/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/request/${id}`);
  },

  async getStatuses(): Promise<any[]> {
    const response = await api.get('/request/statuses'); // Adjust based on actual backend endpoint
    return response.data;
  }
};
