import api from '../api/api';
import type { LtlShipment } from '../types';

export const ltlShipmentService = {
  async getAll(): Promise<LtlShipment[]> {
    const response = await api.get('/ltl-shipment');
    return response.data;
  },

  async getById(id: string): Promise<LtlShipment> {
    const response = await api.get(`/ltl-shipment/${id}`);
    return response.data;
  },

  async create(data: Partial<LtlShipment> & { shipmentIds: string[] }): Promise<LtlShipment> {
    const response = await api.post('/ltl-shipment', data);
    return response.data;
  },

  async update(id: string, data: Partial<LtlShipment> & { shipmentIdsToAdd?: string[], shipmentIdsToRemove?: string[] }): Promise<LtlShipment> {
    const response = await api.patch(`/ltl-shipment/${id}`, data);
    return response.data;
  },

  async updateStatus(id: string, status: string): Promise<LtlShipment> {
    const response = await api.patch(`/ltl-shipment/${id}/status`, { status });
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/ltl-shipment/${id}`);
  }
};
