import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { Vehicle } from './entities/vehicle.entity';
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
    const { typeId, ...rest } = createVehicleDto;

    const vehicleType = await this.vehicleTypeRepository.findOne({ where: { id: typeId } });
    if (!vehicleType) {
      throw new NotFoundException(`VehicleType with ID "${typeId}" not found`);
    }

    const vehicle = this.vehicleRepository.create({ ...rest, type: vehicleType });
    return this.vehicleRepository.save(vehicle);
  }

  findAll(isAvailable?: boolean): Promise<Vehicle[]> {
    if (isAvailable !== undefined) {
      return this.vehicleRepository.find({ where: { isAvailable }, relations: ['type'] });
    }
    return this.vehicleRepository.find({ relations: ['type'] });
  }

  async findOne(id: string): Promise<Vehicle> {
    const vehicle = await this.vehicleRepository.findOne({ where: { id }, relations: ['type'] });
    if (!vehicle) {
      throw new NotFoundException(`Vehicle with ID "${id}" not found`);
    }
    return vehicle;
  }

  async update(id: string, updateVehicleDto: UpdateVehicleDto): Promise<Vehicle> {
    const vehicle = await this.findOne(id);
    const { typeId, ...rest } = updateVehicleDto;

    if (typeId) {
      const vehicleType = await this.vehicleTypeRepository.findOne({ where: { id: typeId } });
      if (!vehicleType) {
        throw new NotFoundException(`VehicleType with ID "${typeId}" not found`);
      }
      vehicle.type = vehicleType;
    }

    Object.assign(vehicle, rest);
    return this.vehicleRepository.save(vehicle);
  }

  async remove(id: string): Promise<void> {
    const result = await this.vehicleRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Vehicle with ID "${id}" not found`);
    }
  }
}
