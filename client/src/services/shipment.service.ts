import api from '../api/api';
import type { Shipment, Driver, Vehicle, VehicleType } from '../types';

export const shipmentService = {
  async getAll(): Promise<Shipment[]> {
    const response = await api.get('/shipment');
    return response.data;
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async create(data: any): Promise<Shipment> {
    const response = await api.post('/shipment', data);
    return response.data;
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async update(id: string, data: any): Promise<Shipment> {
    const response = await api.patch(`/shipment/${id}`, data);
    return response.data;
  },

  async getDrivers(): Promise<Driver[]> {
    const response = await api.get('/driver', { params: { limit: 100 } });
    return response.data.data || response.data;
  },

  async getVehicles(): Promise<Vehicle[]> {
    const response = await api.get('/vehicle', { params: { limit: 100 } });
    return response.data.data || response.data;
  },

  async getVehicleTypes(): Promise<VehicleType[]> {
    const response = await api.get('/vehicle/types');
    return response.data;
  },

  async createVehicle(data: Partial<Vehicle>): Promise<Vehicle> {
    const response = await api.post('/vehicle', data);
    return response.data;
  },

  async updateVehicle(id: string, data: Partial<Vehicle>): Promise<Vehicle> {
    const response = await api.patch(`/vehicle/${id}`, data);
    return response.data;
  },

  async deleteVehicle(id: string): Promise<void> {
    await api.delete(`/vehicle/${id}`);
  },

  async createDriver(data: Partial<Driver>): Promise<Driver> {
    const response = await api.post('/driver', data);
    return response.data;
  },

  async updateDriver(id: string, data: Partial<Driver>): Promise<Driver> {
    const response = await api.patch(`/driver/${id}`, data);
    return response.data;
  },

  async deleteDriver(id: string): Promise<void> {
    await api.delete(`/driver/${id}`);
  }
};
