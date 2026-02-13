import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { Vehicle, VehicleStatus } from './entities/vehicle.entity';
import { VehicleType } from './entities/vehicle-type.entity';

@Injectable()
export class VehicleService {
  constructor(
    @InjectRepository(Vehicle)
    private vehicleRepository: Repository<Vehicle>,
    @InjectRepository(VehicleType)
    private vehicleTypeRepository: Repository<VehicleType>,
  ) {}

  async create(createVehicleDto: CreateVehicleDto): Promise<Vehicle> {
    const { typeId, licensePlate, ...rest } = createVehicleDto;

    const existingVehicle = await this.vehicleRepository.findOne({
      where: { licensePlate },
    });
    if (existingVehicle) {
      throw new ConflictException(
        `Vehicle with license plate "${licensePlate}" already exists.`,
      );
    }

    const vehicleType = await this.vehicleTypeRepository.findOne({
      where: { id: typeId },
    });
    if (!vehicleType) {
      throw new NotFoundException(`VehicleType with ID "${typeId}" not found`);
    }

    const vehicle = this.vehicleRepository.create({
      ...rest,
      licensePlate,
      type: vehicleType,
    });
    return this.vehicleRepository.save(vehicle);
  }

  async findAll(options: {
    isAvailable?: boolean;
    status?: VehicleStatus;
    page?: number;
    limit?: number;
  }): Promise<{ data: Vehicle[]; total: number }> {
    const { isAvailable, status, page = 1, limit = 10 } = options;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (isAvailable !== undefined) {
      where.isAvailable = isAvailable;
    }
    if (status) {
      where.status = status;
    }

    const [data, total] = await this.vehicleRepository.findAndCount({
      where,
      relations: ['type'],
      take: limit,
      skip,
    });

    return { data, total };
  }

  async findOne(id: string): Promise<Vehicle> {
    const vehicle = await this.vehicleRepository.findOne({
      where: { id },
      relations: ['type'],
    });
    if (!vehicle) {
      throw new NotFoundException(`Vehicle with ID "${id}" not found`);
    }
    return vehicle;
  }

  async update(
    id: string,
    updateVehicleDto: UpdateVehicleDto,
  ): Promise<Vehicle> {
    const vehicle = await this.findOne(id);
    const { typeId, ...rest } = updateVehicleDto;

    if (
      updateVehicleDto.licensePlate &&
      updateVehicleDto.licensePlate !== vehicle.licensePlate
    ) {
      const existingVehicle = await this.vehicleRepository.findOne({
        where: {
          licensePlate: updateVehicleDto.licensePlate,
          id: Not(id),
        },
      });
      if (existingVehicle) {
        throw new ConflictException(
          `Vehicle with license plate "${updateVehicleDto.licensePlate}" already exists.`,
        );
      }
    }

    if (typeId) {
      const vehicleType = await this.vehicleTypeRepository.findOne({
        where: { id: typeId },
      });
      if (!vehicleType) {
        throw new NotFoundException(
          `VehicleType with ID "${typeId}" not found`,
        );
      }
      vehicle.type = vehicleType;
    }

    Object.assign(vehicle, rest);
    return this.vehicleRepository.save(vehicle);
  }

  async remove(id: string): Promise<void> {
    const result = await this.vehicleRepository.softDelete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Vehicle with ID "${id}" not found`);
    }
  }
}
