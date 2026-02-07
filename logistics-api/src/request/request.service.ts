import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateRequestDto } from './dto/create-request.dto';
import { UpdateRequestDto } from './dto/update-request.dto';
import { Request } from './entities/request.entity';
import { User } from '../user/entities/user.entity';
import { RequestStatus } from './entities/request-status.entity';
import { RoleName } from '../auth/enums/role-name.enum';
import { UserService } from '../user/user.service'; // Import UserService

@Injectable()
export class RequestService {
  constructor(
    @InjectRepository(Request)
    private requestRepository: Repository<Request>,
    @InjectRepository(RequestStatus)
    private requestStatusRepository: Repository<RequestStatus>,
    private userService: UserService, // Inject UserService
  ) {}

  async create(createRequestDto: CreateRequestDto, reqUser: any): Promise<Request> {
    const user = await this.userService.findOne(reqUser.userId);
    const { pickupAddress, deliveryAddress, cargos, ...rest } = createRequestDto;

    // Clients can only create requests for their own company
    if (user.role.name !== RoleName.CLIENT || !user.company) {
      throw new ForbiddenException(
        'Only clients associated with a company can create requests.',
      );
    }

    const initialStatus = await this.requestStatusRepository.findOne({
      where: { name: 'Новая' },
    });
    if (!initialStatus) {
      // This should be seeded, but as a fallback:
      throw new NotFoundException(
        'Initial request status "Новая" not found. Please seed the database.',
      );
    }

    const newRequest = this.requestRepository.create({
      ...rest,
      pickupAddress,
      deliveryAddress,
      cargos,
      createdByUser: user,
      company: user.company,
      status: initialStatus,
    });

    return this.requestRepository.save(newRequest);
  }

  async findAll(reqUser: any): Promise<Request[]> {
    const user = await this.userService.findOne(reqUser.userId);
    if (user.role.name === RoleName.CLIENT) {
      if (!user.company) {
        return []; // A client without a company has no requests
      }
      return this.requestRepository.find({
        where: { company: { id: user.company.id } },
        relations: ['status', 'company', 'cargos', 'pickupAddress', 'deliveryAddress'],
      });
    }

    // Admins and Logisticians can see all requests
    return this.requestRepository.find({
      relations: ['status', 'company', 'cargos', 'pickupAddress', 'deliveryAddress'],
    });
  }

  async findOne(id: string, reqUser: any): Promise<Request> {
    const user = await this.userService.findOne(reqUser.userId);
    const request = await this.requestRepository.findOne({
      where: { id },
      relations: [
        'status',
        'company',
        'cargos',
        'pickupAddress',
        'deliveryAddress',
        'createdByUser',
      ],
    });

    if (!request) {
      throw new NotFoundException(`Request with ID "${id}" not found`);
    }

    // Clients can only see requests from their own company
    if (user.role.name === RoleName.CLIENT) {
      if (!user.company || request.company.id !== user.company.id) {
        throw new ForbiddenException('You are not authorized to see this request.');
      }
    }

    return request;
  }

  // Placeholder for update
  async update(id: string, updateRequestDto: UpdateRequestDto, reqUser: any): Promise<Request> {
    // TODO: Implement update logic with authorization
    const request = await this.findOne(id, reqUser);
    Object.assign(request, updateRequestDto);
    return this.requestRepository.save(request);
  }

  // Placeholder for remove
  async remove(id: string, reqUser: any): Promise<void> {
    // TODO: Implement remove logic with authorization
    await this.findOne(id, reqUser); // Check for authorization
    const result = await this.requestRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Request with ID "${id}" not found`);
    }
  }
}
