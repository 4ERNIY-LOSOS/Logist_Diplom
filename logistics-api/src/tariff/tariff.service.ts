import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tariff } from './entities/tariff.entity';
import { CreateTariffDto } from './dto/create-tariff.dto';
import { UpdateTariffDto } from './dto/update-tariff.dto';

@Injectable()
export class TariffService {
  constructor(
    @InjectRepository(Tariff)
    private tariffRepository: Repository<Tariff>,
  ) {}

  async create(createTariffDto: CreateTariffDto): Promise<Tariff> {
    const tariff = this.tariffRepository.create(createTariffDto);
    return this.tariffRepository.save(tariff);
  }

  findAll(): Promise<Tariff[]> {
    return this.tariffRepository.find();
  }

  async findOne(id: string): Promise<Tariff> {
    const tariff = await this.tariffRepository.findOne({ where: { id } });
    if (!tariff) {
      throw new NotFoundException(`Tariff with ID "${id}" not found`);
    }
    return tariff;
  }

  async findActiveTariff(): Promise<Tariff> {
    const activeTariffs = await this.tariffRepository.find({
      where: { isActive: true },
      order: { createdAt: 'DESC' },
    });

    if (activeTariffs.length === 0) {
      throw new NotFoundException(
        'No active tariff found. Please ensure one tariff is marked as active.',
      );
    }

    // If multiple active tariffs, just use the most recently created one
    return activeTariffs[0];
  }

  async update(id: string, updateTariffDto: UpdateTariffDto): Promise<Tariff> {
    const tariff = await this.findOne(id);
    Object.assign(tariff, updateTariffDto);
    return this.tariffRepository.save(tariff);
  }

  async remove(id: string): Promise<void> {
    const result = await this.tariffRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Tariff with ID "${id}" not found`);
    }
  }
}
