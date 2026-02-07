import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { CreateShipmentDto } from './dto/create-shipment.dto';
import { UpdateShipmentDto } from './dto/update-shipment.dto';
import { UpdateShipmentStatusDto } from './dto/update-shipment-status.dto';
import { Shipment } from './entities/shipment.entity';
import { Request } from '../request/entities/request.entity';
import { Driver } from '../driver/entities/driver.entity';
import { Vehicle } from '../vehicle/entities/vehicle.entity';
import { ShipmentStatus } from './entities/shipment-status.entity';
import { RequestStatus } from '../request/entities/request-status.entity';

@Injectable()
export class ShipmentService {
  constructor(
    @InjectRepository(Shipment)
    private shipmentRepository: Repository<Shipment>,
    @InjectRepository(Request)
    private requestRepository: Repository<Request>,
    @InjectRepository(Driver)
    private driverRepository: Repository<Driver>,
    @InjectRepository(Vehicle)
    private vehicleRepository: Repository<Vehicle>,
    @InjectRepository(ShipmentStatus)
    private shipmentStatusRepository: Repository<ShipmentStatus>,
    @InjectRepository(RequestStatus)
    private requestStatusRepository: Repository<RequestStatus>,
    private entityManager: EntityManager,
  ) {}

  async createFromRequest(
    createShipmentDto: CreateShipmentDto,
  ): Promise<Shipment> {
    const { requestId, driverId, vehicleId, ...rest } = createShipmentDto;

    // Use a transaction to ensure all or nothing
    return this.entityManager.transaction(async (transactionalEntityManager) => {
      const request = await transactionalEntityManager.findOne(Request, {
        where: { id: requestId },
        relations: ['shipment'],
      });
      if (!request) {
        throw new NotFoundException(`Request with ID "${requestId}" not found`);
      }
      if (request.shipment) {
        throw new BadRequestException(
          `Request with ID "${requestId}" is already linked to a shipment.`,
        );
      }

      const driver = await transactionalEntityManager.findOne(Driver, { where: { id: driverId } });
      if (!driver) {
        throw new NotFoundException(`Driver with ID "${driverId}" not found`);
      }
      if (!driver.isAvailable) {
        throw new BadRequestException(`Driver with ID "${driverId}" is not available.`);
      }

      const vehicle = await transactionalEntityManager.findOne(Vehicle, { where: { id: vehicleId } });
      if (!vehicle) {
        throw new NotFoundException(`Vehicle with ID "${vehicleId}" not found`);
      }
      if (!vehicle.isAvailable) {
        throw new BadRequestException(`Vehicle with ID "${vehicleId}" is not available.`);
      }

      const plannedStatus = await this.shipmentStatusRepository.findOne({ where: { name: 'Запланирована' } });
      if (!plannedStatus) {
        throw new NotFoundException('Shipment status "Запланирована" not found.');
      }

      const requestCompletedStatus = await this.requestStatusRepository.findOne({ where: { name: 'Завершена' } });
      if (!requestCompletedStatus) {
        throw new NotFoundException('Request status "Завершена" not found.');
      }

      // Update driver and vehicle availability
      driver.isAvailable = false;
      vehicle.isAvailable = false;
      await transactionalEntityManager.save(driver);
      await transactionalEntityManager.save(vehicle);

      // Update request status
      request.status = requestCompletedStatus;
      await transactionalEntityManager.save(request);

      // Create and save the new shipment
      const newShipment = transactionalEntityManager.create(Shipment, {
        ...rest,
        request,
        driver,
        vehicle,
        status: plannedStatus,
      });

      return transactionalEntityManager.save(newShipment);
    });
  }

  async updateStatus(id: string, updateShipmentStatusDto: UpdateShipmentStatusDto): Promise<Shipment> {
    const shipment = await this.findOne(id);
    if (!shipment) {
      throw new NotFoundException(`Shipment with ID "${id}" not found`);
    }

    const newStatus = await this.shipmentStatusRepository.findOne({ where: { id: updateShipmentStatusDto.statusId } });
    if (!newStatus) {
      throw new NotFoundException(`ShipmentStatus with ID "${updateShipmentStatusDto.statusId}" not found`);
    }

    shipment.status = newStatus;

    if (newStatus.name === 'Доставлена') {
      shipment.actualDeliveryDate = new Date();
    }

    return this.shipmentRepository.save(shipment);
  }

  // Placeholder for findAll
  findAll() {
    return this.shipmentRepository.find({
      relations: ['request', 'driver', 'vehicle', 'status'],
    });
  }

  // Placeholder for findOne
  async findOne(id: string) {
    const shipment = await this.shipmentRepository.findOne({
      where: { id },
      relations: ['request', 'driver', 'vehicle', 'status'],
    });
    if (!shipment) {
      throw new NotFoundException(`Shipment with ID "${id}" not found`);
    }
    return shipment;
  }

  // Placeholder for update
  update(id: string, updateShipmentDto: UpdateShipmentDto) {
    return `This action updates a #${id} shipment`;
  }

  // Placeholder for remove
  remove(id: string) {
    return `This action removes a #${id} shipment`;
  }
}
