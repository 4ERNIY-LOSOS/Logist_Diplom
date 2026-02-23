import api from '../api/api';

export interface Kpis {
  onTimeDeliveryRate: number;
  vehicleUtilizationRate: number;
  averageCostPerKm: number;
  totalShipments: number;
  totalVehicles: number;
}

export const reportsService = {
  async getKpis(): Promise<Kpis> {
    const response = await api.get('/reports/kpi');
    return response.data;
  }
};
