import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
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
import { UserService } from '../user/user.service'; // Import UserService
import { RoleName } from '../auth/enums/role-name.enum'; // Import RoleName

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
    private userService: UserService, // Inject UserService
  ) {}

  async createFromRequest(
    createShipmentDto: CreateShipmentDto,
  ): Promise<Shipment> {
    const { requestId, driverId, vehicleId, ...rest } = createShipmentDto;

    return this.entityManager.transaction(
      async (transactionalEntityManager) => {
        const request = await transactionalEntityManager.findOne(Request, {
          where: { id: requestId },
          relations: ['shipment'],
        });
        if (!request) {
          throw new NotFoundException(
            `Request with ID "${requestId}" not found`,
          );
        }
        if (request.shipment) {
          throw new BadRequestException(
            `Request with ID "${requestId}" is already linked to a shipment.`,
          );
        }

        const driver = await transactionalEntityManager.findOne(Driver, {
          where: { id: driverId },
          lock: { mode: 'pessimistic_write' },
        });
        if (!driver) {
          throw new NotFoundException(`Driver with ID "${driverId}" not found`);
        }
        if (!driver.isAvailable) {
          throw new BadRequestException(
            `Driver with ID "${driverId}" is not available.`,
          );
        }

        const vehicle = await transactionalEntityManager.findOne(Vehicle, {
          where: { id: vehicleId },
          lock: { mode: 'pessimistic_write' },
        });
        if (!vehicle) {
          throw new NotFoundException(
            `Vehicle with ID "${vehicleId}" not found`,
          );
        }
        if (!vehicle.isAvailable) {
          throw new BadRequestException(
            `Vehicle with ID "${vehicleId}" is not available.`,
          );
        }

        const plannedStatus = await this.shipmentStatusRepository.findOne({
          where: { name: 'Запланирована' },
        });
        if (!plannedStatus) {
          throw new NotFoundException(
            'Shipment status "Запланирована" not found.',
          );
        }

        const requestCompletedStatus =
          await this.requestStatusRepository.findOne({
            where: { name: 'Завершена' },
          });
        if (!requestCompletedStatus) {
          throw new NotFoundException('Request status "Завершена" not found.');
        }

        driver.isAvailable = false;
        vehicle.isAvailable = false;
        await transactionalEntityManager.save(driver);
        await transactionalEntityManager.save(vehicle);

        request.status = requestCompletedStatus;
        await transactionalEntityManager.save(request);

        const newShipment = transactionalEntityManager.create(Shipment, {
          ...rest,
          request,
          driver,
          vehicle,
          status: plannedStatus,
        });

        return transactionalEntityManager.save(newShipment);
      },
    );
  }

  async updateStatus(
    id: string,
    updateShipmentStatusDto: UpdateShipmentStatusDto,
  ): Promise<Shipment> {
    return this.entityManager.transaction(
      async (transactionalEntityManager) => {
        const shipment = await transactionalEntityManager.findOne(Shipment, {
          where: { id },
          relations: ['driver', 'vehicle', 'status', 'request', 'request.preliminaryCost', 'request.finalCost'], // Load request relations
        });

        if (!shipment) {
          throw new NotFoundException(`Shipment with ID "${id}" not found`);
        }

        const newStatus = await transactionalEntityManager.findOne(
          ShipmentStatus,
          {
            where: { id: updateShipmentStatusDto.statusId },
          },
        );

        if (!newStatus) {
          throw new NotFoundException(
            `ShipmentStatus with ID "${updateShipmentStatusDto.statusId}" not found`,
          );
        }

        const currentStatusName = shipment.status.name;
        const newStatusName = newStatus.name;

        const validTransitions: Record<string, string[]> = {
          Запланирована: ['В пути', 'Отменена'],
          'В пути': ['Доставлена'],
          Доставлена: [],
          Отменена: [],
        };

        if (
          !validTransitions[currentStatusName] ||
          !validTransitions[currentStatusName].includes(newStatusName)
        ) {
          throw new BadRequestException(
            `Invalid status transition from "${currentStatusName}" to "${newStatusName}".`,
          );
        }

        shipment.status = newStatus;

        if (newStatus.name === 'Доставлена') {
          shipment.actualDeliveryDate = new Date();

          if (shipment.driver) {
            shipment.driver.isAvailable = true;
            await transactionalEntityManager.save(shipment.driver);
          }

          if (shipment.vehicle) {
            shipment.vehicle.isAvailable = true;
            await transactionalEntityManager.save(shipment.vehicle);
          }

          // Auto-calculate finalCost for the associated request
          if (shipment.request && shipment.request.finalCost === null) {
            shipment.request.finalCost = shipment.request.preliminaryCost;
            await transactionalEntityManager.save(shipment.request);
          }
        }

        return transactionalEntityManager.save(shipment);
      },
    );
  }

  async findAll(reqUser: any) {
    const user = await this.userService.findOne(reqUser.userId);
    const findOptions = {
      relations: ['request', 'request.company', 'driver', 'vehicle', 'status'],
      where: {},
    };

    if (user.role.name === RoleName.CLIENT) {
      if (!user.company) {
        return []; // Client not in a company sees no shipments
      }
      findOptions.where = { request: { company: { id: user.company.id } } };
    }

    return this.shipmentRepository.find(findOptions);
  }

  async findOne(id: string, reqUser: any) {
    const user = await this.userService.findOne(reqUser.userId);
    const shipment = await this.shipmentRepository.findOne({
      where: { id },
      relations: ['request', 'request.company', 'driver', 'vehicle', 'status'],
    });

    if (!shipment) {
      throw new NotFoundException(`Shipment with ID "${id}" not found`);
    }

    if (user.role.name === RoleName.CLIENT) {
      if (
        !user.company ||
        !shipment.request ||
        !shipment.request.company ||
        shipment.request.company.id !== user.company.id
      ) {
        throw new ForbiddenException(
          'You are not authorized to view this shipment.',
        );
      }
    }

    return shipment;
  }

  // Placeholder for update
  update(id: string, updateShipmentDto: UpdateShipmentDto) {
    return `This action updates a #${id} shipment`;
  }

  async remove(id: string): Promise<void> {
    return this.entityManager.transaction(
      async (transactionalEntityManager) => {
        const shipment = await transactionalEntityManager.findOne(Shipment, {
          where: { id },
          relations: ['driver', 'vehicle', 'request'],
        });

        if (!shipment) {
          throw new NotFoundException(`Shipment with ID "${id}" not found`);
        }

        // 1. Make driver and vehicle available again
        if (shipment.driver) {
          shipment.driver.isAvailable = true;
          await transactionalEntityManager.save(shipment.driver);
        }
        if (shipment.vehicle) {
          shipment.vehicle.isAvailable = true;
          await transactionalEntityManager.save(shipment.vehicle);
        }

        // 2. Reset the status of the associated request
        if (shipment.request) {
          const newRequestStatus = await transactionalEntityManager.findOne(
            RequestStatus,
            {
              where: { name: 'Новая' },
            },
          );
          if (!newRequestStatus) {
            throw new BadRequestException(
              'Request status "Новая" not found. Please ensure it exists.',
            );
          }
          shipment.request.status = newRequestStatus;
          await transactionalEntityManager.save(shipment.request);
        }

        // 3. Remove the shipment
        await transactionalEntityManager.remove(shipment);
      },
    );
  }
}
