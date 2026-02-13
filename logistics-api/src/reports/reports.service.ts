import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Shipment } from '../shipment/entities/shipment.entity';
import { Vehicle } from '../vehicle/entities/vehicle.entity';
import { Request } from '../request/entities/request.entity';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Shipment)
    private shipmentRepository: Repository<Shipment>,
    @InjectRepository(Vehicle)
    private vehicleRepository: Repository<Vehicle>,
    @InjectRepository(Request)
    private requestRepository: Repository<Request>,
  ) {}

  async getKpis() {
    const totalShipments = await this.shipmentRepository.count({
        where: { status: { name: 'Доставлена' } }
    });

    const onTimeShipments = await this.shipmentRepository
      .createQueryBuilder('shipment')
      .leftJoin('shipment.status', 'status')
      .where('status.name = :statusName', { statusName: 'Доставлена' })
      .andWhere('shipment.actualDeliveryDate <= shipment.plannedDeliveryDate')
      .getCount();

    const onTimeDeliveryRate = totalShipments > 0 ? (onTimeShipments / totalShipments) * 100 : 0;

    const totalVehicles = await this.vehicleRepository.count();
    const busyVehicles = await this.vehicleRepository.count({ where: { isAvailable: false } });
    const vehicleUtilizationRate = totalVehicles > 0 ? (busyVehicles / totalVehicles) * 100 : 0;

    const requestsWithCost = await this.requestRepository
      .createQueryBuilder('request')
      .where('request.finalCost IS NOT NULL')
      .andWhere('request.distanceKm > 0')
      .getMany();

    let totalCost = 0;
    let totalDistance = 0;
    requestsWithCost.forEach(r => {
        totalCost += Number(r.finalCost);
        totalDistance += Number(r.distanceKm);
    });

    const averageCostPerKm = totalDistance > 0 ? totalCost / totalDistance : 0;

    return {
      onTimeDeliveryRate: Math.round(onTimeDeliveryRate * 100) / 100,
      vehicleUtilizationRate: Math.round(vehicleUtilizationRate * 100) / 100,
      averageCostPerKm: Math.round(averageCostPerKm * 100) / 100,
      totalShipments,
      totalVehicles,
    };
  }
}
