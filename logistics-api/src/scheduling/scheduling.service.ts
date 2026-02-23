import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThanOrEqual, MoreThanOrEqual, EntityManager, Brackets } from 'typeorm';
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

  async checkVehicleAvailability(vehicleId: string, start: Date, end: Date, manager?: EntityManager): Promise<boolean> {
    const shipmentRepo = manager ? manager.getRepository(Shipment) : this.shipmentRepository;
    const maintenanceRepo = manager ? manager.getRepository(VehicleMaintenance) : this.maintenanceRepository;

    // 1. Check for overlapping shipments
    // We ignore shipments with status 'Отменена'
    const overlappingShipment = await shipmentRepo.createQueryBuilder('shipment')
      .leftJoinAndSelect('shipment.status', 'status')
      .where('shipment.vehicle_id = :vehicleId', { vehicleId })
      .andWhere('status.name != :cancelledStatus', { cancelledStatus: 'Отменена' })
      .andWhere(
        new Brackets((qb) => {
          qb.where('shipment.planned_pickup_date BETWEEN :start AND :end', { start, end })
            .orWhere('shipment.planned_delivery_date BETWEEN :start AND :end', { start, end })
            .orWhere('(shipment.planned_pickup_date <= :start AND shipment.planned_delivery_date >= :end)', { start, end });
        }),
      )
      .getOne();

    if (overlappingShipment) {
      throw new BadRequestException(`Vehicle has an overlapping shipment (${overlappingShipment.id})`);
    }

    // 2. Check for overlapping maintenance
    const overlappingMaintenance = await maintenanceRepo.findOne({
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

  async checkDriverAvailability(driverId: string, start: Date, end: Date, manager?: EntityManager): Promise<boolean> {
    const shipmentRepo = manager ? manager.getRepository(Shipment) : this.shipmentRepository;

    const overlappingShipment = await shipmentRepo.createQueryBuilder('shipment')
      .leftJoinAndSelect('shipment.status', 'status')
      .where('shipment.driver_id = :driverId', { driverId })
      .andWhere('status.name != :cancelledStatus', { cancelledStatus: 'Отменена' })
      .andWhere(
        new Brackets((qb) => {
          qb.where('shipment.planned_pickup_date BETWEEN :start AND :end', { start, end })
            .orWhere('shipment.planned_delivery_date BETWEEN :start AND :end', { start, end })
            .orWhere('(shipment.planned_pickup_date <= :start AND shipment.planned_delivery_date >= :end)', { start, end });
        }),
      )
      .getOne();

    if (overlappingShipment) {
      throw new BadRequestException(`Driver has an overlapping shipment (${overlappingShipment.id})`);
    }

    return true;
  }
}
