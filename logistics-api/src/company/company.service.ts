import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { Company } from './entities/company.entity';
import { User } from '../user/entities/user.entity';
import { UserService } from '../user/user.service'; // Import UserService

@Injectable()
export class CompanyService {
  constructor(
    @InjectRepository(Company)
    private companyRepository: Repository<Company>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private userService: UserService, // Inject UserService
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

  async findMyCompany(userId: string): Promise<Company> {
    const user = await this.userService.findOne(userId); // Get the full user object with company relation
    if (!user.company) {
      throw new NotFoundException(
        `User with ID "${userId}" is not associated with any company.`,
      );
    }
    // Return the company associated with the user. The user object's company relation is already loaded by userService.findOne
    return user.company;
  }

  async update(
    id: string,
    updateCompanyDto: UpdateCompanyDto,
  ): Promise<Company> {
    const company = await this.findOne(id);
    Object.assign(company, updateCompanyDto);
    return this.companyRepository.save(company);
  }

  async remove(id: string): Promise<void> {
    const company = await this.findOne(id);

    const associatedUsersCount = await this.userRepository.count({
      where: { company: { id: company.id } },
    });

    if (associatedUsersCount > 0) {
      throw new BadRequestException(
        `Cannot delete company with ID "${id}" because it is associated with ${associatedUsersCount} user(s).`,
      );
    }

    await this.companyRepository.remove(company);
  }
}
