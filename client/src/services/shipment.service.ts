import api from '../api/api';
import type { Shipment } from '../types';

export const shipmentService = {
  async getAll(): Promise<Shipment[]> {
    const response = await api.get('/shipment');
    return response.data;
  },

  async create(data: any): Promise<Shipment> {
    const response = await api.post('/shipment', data);
    return response.data;
  },

  async update(id: string, data: any): Promise<Shipment> {
    const response = await api.patch(`/shipment/${id}`, data);
    return response.data;
  },

  async getDrivers(): Promise<any[]> {
    const response = await api.get('/driver');
    return response.data;
  },

  async getVehicles(): Promise<any[]> {
    const response = await api.get('/vehicle');
    return response.data;
  }
};
