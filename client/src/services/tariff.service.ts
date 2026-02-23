import api from '../api/api';

export interface Tariff {
  id: string;
  name: string;
  baseFee: number;
  costPerKm: number;
  costPerKg: number;
  costPerM3: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export const tariffService = {
  async getAll(): Promise<Tariff[]> {
    const response = await api.get('/tariff');
    return response.data;
  },

  async create(data: Partial<Tariff>): Promise<Tariff> {
    const response = await api.post('/tariff', data);
    return response.data;
  },

  async update(id: string, data: Partial<Tariff>): Promise<Tariff> {
    const response = await api.patch(`/tariff/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/tariff/${id}`);
  }
};
