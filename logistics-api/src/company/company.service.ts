import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { Company } from './entities/company.entity';

@Injectable()
export class CompanyService {
  constructor(
    @InjectRepository(Company)
    private companyRepository: Repository<Company>,
  ) {}

  create(createCompanyDto: CreateCompanyDto): Promise<Company> {
    const company = this.companyRepository.create(createCompanyDto);
    return this.companyRepository.save(company);
  }

  findAll(): Promise<Company[]> {
    return this.companyRepository.find();
  }

  async findOne(id: string): Promise<Company> {
    const company = await this.companyRepository.findOne({ where: { id } });
    if (!company) {
      throw new NotFoundException(`Company with ID "${id}" not found`);
    }
    return company;
  }

  async update(id: string, updateCompanyDto: UpdateCompanyDto): Promise<Company> {
    const company = await this.findOne(id); // reuse findOne to handle not found error
    Object.assign(company, updateCompanyDto);
    return this.companyRepository.save(company);
  }

  async remove(id: string): Promise<void> {
    const result = await this.companyRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Company with ID "${id}" not found`);
    }
  }
}
