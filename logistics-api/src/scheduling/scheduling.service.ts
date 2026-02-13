import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { Shipment } from '../shipment/entities/shipment.entity';
import { VehicleMaintenance } from '../vehicle/entities/vehicle-maintenance.entity';

@Injectable()
export class SchedulingService {
  constructor(
    @InjectRepository(Shipment)
    private shipmentRepository: Repository<Shipment>,
    @InjectRepository(VehicleMaintenance)
    private maintenanceRepository: Repository<VehicleMaintenance>,
  ) {}

  async checkVehicleAvailability(vehicleId: string, start: Date, end: Date): Promise<boolean> {
    // 1. Check for overlapping shipments
    const overlappingShipment = await this.shipmentRepository.findOne({
      where: [
        {
          vehicle: { id: vehicleId },
          plannedPickupDate: Between(start, end),
        },
        {
          vehicle: { id: vehicleId },
          plannedDeliveryDate: Between(start, end),
        },
        {
          vehicle: { id: vehicleId },
          plannedPickupDate: LessThanOrEqual(start),
          plannedDeliveryDate: MoreThanOrEqual(end),
        }
      ]
    });

    if (overlappingShipment) {
      throw new BadRequestException(`Vehicle has an overlapping shipment (${overlappingShipment.id})`);
    }

    // 2. Check for overlapping maintenance
    const overlappingMaintenance = await this.maintenanceRepository.findOne({
      where: [
        {
          vehicle: { id: vehicleId },
          startDate: Between(start, end),
        },
        {
          vehicle: { id: vehicleId },
          startDate: LessThanOrEqual(start),
          endDate: MoreThanOrEqual(start),
        }
      ]
    });

    if (overlappingMaintenance) {
      throw new BadRequestException(`Vehicle is scheduled for maintenance during this period`);
    }

    return true;
  }

  async checkDriverAvailability(driverId: string, start: Date, end: Date): Promise<boolean> {
    const overlappingShipment = await this.shipmentRepository.findOne({
      where: [
        {
          driver: { id: driverId },
          plannedPickupDate: Between(start, end),
        },
        {
          driver: { id: driverId },
          plannedDeliveryDate: Between(start, end),
        }
      ]
    });

    if (overlappingShipment) {
      throw new BadRequestException(`Driver has an overlapping shipment (${overlappingShipment.id})`);
    }

    return true;
  }
}
