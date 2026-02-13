import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import { CreateDriverDto } from './dto/create-driver.dto';
import { UpdateDriverDto } from './dto/update-driver.dto';
import { Driver, DriverStatus } from './entities/driver.entity';

@Injectable()
export class DriverService {
  constructor(
    @InjectRepository(Driver)
    private driverRepository: Repository<Driver>,
  ) {}

  async create(createDriverDto: CreateDriverDto): Promise<Driver> {
    const { licenseNumber } = createDriverDto;
    const existingDriver = await this.driverRepository.findOne({
      where: { licenseNumber },
    });
    if (existingDriver) {
      throw new ConflictException(
        `Driver with license number "${licenseNumber}" already exists.`,
      );
    }
    const driver = this.driverRepository.create(createDriverDto);
    return this.driverRepository.save(driver);
  }

  async findAll(options: {
    isAvailable?: boolean;
    status?: DriverStatus;
    page?: number;
    limit?: number;
  }): Promise<{ data: Driver[]; total: number }> {
    const { isAvailable, status, page = 1, limit = 10 } = options;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (isAvailable !== undefined) {
      where.isAvailable = isAvailable;
    }
    if (status) {
      where.status = status;
    }

    const [data, total] = await this.driverRepository.findAndCount({
      where,
      take: limit,
      skip,
    });

    return { data, total };
  }

  async findOne(id: string): Promise<Driver> {
    const driver = await this.driverRepository.findOne({ where: { id } });
    if (!driver) {
      throw new NotFoundException(`Driver with ID "${id}" not found`);
    }
    return driver;
  }

  async update(id: string, updateDriverDto: UpdateDriverDto): Promise<Driver> {
    const driver = await this.findOne(id);

    if (
      updateDriverDto.licenseNumber &&
      updateDriverDto.licenseNumber !== driver.licenseNumber
    ) {
      const existingDriver = await this.driverRepository.findOne({
        where: {
          licenseNumber: updateDriverDto.licenseNumber,
          id: Not(id),
        },
      });
      if (existingDriver) {
        throw new ConflictException(
          `Driver with license number "${updateDriverDto.licenseNumber}" already exists.`,
        );
      }
    }

    Object.assign(driver, updateDriverDto);
    return this.driverRepository.save(driver);
  }

  async remove(id: string): Promise<void> {
    const result = await this.driverRepository.softDelete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Driver with ID "${id}" not found`);
    }
  }
}
