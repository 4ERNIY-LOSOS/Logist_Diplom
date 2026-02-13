import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { Role } from '../role/entities/role.entity';
import { Company } from '../company/entities/company.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    @InjectRepository(Company)
    private companyRepository: Repository<Company>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const {
      username,
      email,
      password,
      role: roleName,
      companyId,
    } = createUserDto;

    const existingUser = await this.userRepository.findOne({
      where: [{ username }, { email }],
    });
    if (existingUser) {
      throw new BadRequestException('Username or email already exists');
    }

    const role = await this.roleRepository.findOne({
      where: { name: roleName },
    });
    if (!role) {
      throw new NotFoundException(`Role with name "${roleName}" not found`);
    }

    let company: Company | null = null;
    if (companyId) {
      company = await this.companyRepository.findOne({
        where: { id: companyId },
      });
      if (!company) {
        throw new NotFoundException(`Company with ID "${companyId}" not found`);
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
      role,
      ...(company && { company }), // Conditionally add company
    });

    return this.userRepository.save(newUser);
  }

  findAll(): Promise<User[]> {
    return this.userRepository.find({ relations: ['role', 'company'] });
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['role', 'company'],
    });
    if (!user) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }
    return user;
  }

  async findOneByUsername(username: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { username },
      relations: ['role', 'company'],
    });
  }

  async findMe(userId: string): Promise<User> {
    return this.findOne(userId);
  }

  async updateMe(userId: string, updateUserDto: UpdateUserDto): Promise<User> {
    if (updateUserDto.role || updateUserDto.companyId) {
      throw new ForbiddenException(
        'You are not allowed to change your role or company.',
      );
    }
    return this.update(userId, updateUserDto);
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);
    const { role: roleName, companyId, password, ...rest } = updateUserDto;

    if (roleName) {
      const role = await this.roleRepository.findOne({
        where: { name: roleName },
      });
      if (!role) {
        throw new NotFoundException(`Role with name "${roleName}" not found`);
      }
      user.role = role;
    }

    if (companyId) {
      const company = await this.companyRepository.findOne({
        where: { id: companyId },
      });
      if (!company) {
        throw new NotFoundException(`Company with ID "${companyId}" not found`);
      }
      user.company = company;
    }

    if (password) {
      user.password = await bcrypt.hash(password, 10);
    }

    Object.assign(user, rest);
    return this.userRepository.save(user);
  }

  async remove(id: string): Promise<void> {
    const result = await this.userRepository.softDelete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }
  }
}
