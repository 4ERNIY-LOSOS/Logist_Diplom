import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateDriverDto } from './dto/create-driver.dto';
import { UpdateDriverDto } from './dto/update-driver.dto';
import { Driver } from './entities/driver.entity';

@Injectable()
export class DriverService {
  constructor(
    @InjectRepository(Driver)
    private driverRepository: Repository<Driver>,
  ) {}

  create(createDriverDto: CreateDriverDto): Promise<Driver> {
    const driver = this.driverRepository.create(createDriverDto);
    return this.driverRepository.save(driver);
  }

  findAll(isAvailable?: boolean): Promise<Driver[]> {
    if (isAvailable !== undefined) {
      return this.driverRepository.find({ where: { isAvailable } });
    }
    return this.driverRepository.find();
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
    Object.assign(driver, updateDriverDto);
    return this.driverRepository.save(driver);
  }

  async remove(id: string): Promise<void> {
    const result = await this.driverRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Driver with ID "${id}" not found`);
    }
  }
}
