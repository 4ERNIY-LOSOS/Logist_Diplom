import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { CreateRequestDto } from './dto/create-request.dto';
import { UpdateRequestDto } from './dto/update-request.dto';
import { Request } from './entities/request.entity';
import { User } from '../user/entities/user.entity';
import { RequestStatus } from './entities/request-status.entity';
import { CargoType } from '../cargo/entities/cargo-type.entity';
import { RoleName } from '../auth/enums/role-name.enum';
import { UserService } from '../user/user.service';
import { PricingEngineService } from '../pricing/pricing-engine.service';
import { RequestUser } from '../auth/interfaces/request-user.interface';

@Injectable()
export class RequestService {
  private readonly logger = new Logger(RequestService.name);

  constructor(
    @InjectRepository(Request)
    private requestRepository: Repository<Request>,
    @InjectRepository(RequestStatus)
    private requestStatusRepository: Repository<RequestStatus>,
    @InjectRepository(CargoType)
    private cargoTypeRepository: Repository<CargoType>,
    private userService: UserService,
    private pricingEngineService: PricingEngineService,
  ) {}

  async create(
    createRequestDto: CreateRequestDto,
    reqUser: RequestUser,
  ): Promise<Request> {
    const user = await this.userService.findOne(reqUser.userId);
    const {
      pickupAddress,
      deliveryAddress,
      cargos,
      distanceKm,
      pickupDate,
      deliveryDate,
      ...rest
    } = createRequestDto;

    // Date validation
    const parsedPickupDate = new Date(pickupDate);
    const parsedDeliveryDate = new Date(deliveryDate);
    const now = new Date();

    if (parsedPickupDate < now) {
      throw new BadRequestException(
        'Pickup date cannot be in the past.',
      );
    }

    if (parsedDeliveryDate < parsedPickupDate) {
      throw new BadRequestException(
        'Delivery date cannot be before pickup date.',
      );
    }

    // Only users associated with a company can create requests.
    if (!user.company) {
      throw new ForbiddenException(
        'You must be associated with a company to create requests.',
      );
    }

    const initialStatus = await this.requestStatusRepository.findOne({
      where: { name: 'Новая' },
    });
    if (!initialStatus) {
      throw new NotFoundException(
        'Initial request status "Новая" not found. Please seed the database.',
      );
    }

    // Resolve cargo types
    const cargoTypeNames = cargos.map(c => c.type);
    const cargoTypes = await this.cargoTypeRepository.find({
      where: { name: In(cargoTypeNames) }
    });

    const cargosWithTypes = cargos.map(c => {
      const type = cargoTypes.find(ct => ct.name === c.type);
      if (!type) throw new NotFoundException(`Cargo type "${c.type}" not found`);
      return {
        ...c,
        cargoType: type
      };
    });

    let preliminaryCost = 0;
    try {
      const tempRequest = this.requestRepository.create({
          distanceKm: distanceKm || 1,
          cargos: cargosWithTypes,
      });
      const calculation = await this.pricingEngineService.calculateRequestCost(tempRequest);
      preliminaryCost = calculation.preliminaryCost;
    } catch (tariffError) {
      this.logger.warn(
        `Could not calculate preliminary cost: ${tariffError.message}`,
      );
      // Proceed without preliminary cost if tariff not found
      preliminaryCost = 0;
    }

    const newRequest = this.requestRepository.create({
      ...rest,
      pickupAddress: pickupAddress as any,
      deliveryAddress: deliveryAddress as any,
      cargos: cargosWithTypes as any,
      createdByUser: user,
      company: user.company,
      status: initialStatus,
      preliminaryCost: preliminaryCost,
    });

    return this.requestRepository.save(newRequest);
  }

  async findAllStatuses(): Promise<RequestStatus[]> {
    return this.requestStatusRepository.find();
  }

  async findAll(reqUser: RequestUser): Promise<Request[]> {
    const user = await this.userService.findOne(reqUser.userId);
    if (user.role.name === RoleName.CLIENT) {
      if (!user.company) {
        return []; // A client without a company has no requests
      }
      return this.requestRepository.find({
        where: { company: { id: user.company.id } },
        relations: [
          'status',
          'company',
          'cargos',
          'pickupAddress',
          'deliveryAddress',
        ],
      });
    }

    // Admins and Logisticians can see all requests
    return this.requestRepository.find({
      relations: [
        'status',
        'company',
        'cargos',
        'pickupAddress',
        'deliveryAddress',
        'createdByUser',
      ],
    });
  }

  async findOne(id: string, reqUser: RequestUser): Promise<Request> {
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
        throw new ForbiddenException(
          'You are not authorized to see this request.',
        );
      }
    }

    return request;
  }

  async update(
    id: string,
    updateRequestDto: UpdateRequestDto,
    reqUser: RequestUser,
  ): Promise<Request> {
    const user = await this.userService.findOne(reqUser.userId); // Get full user to check role
    // findOne will throw a NotFoundException or ForbiddenException if the user doesn't have access
    const request = await this.findOne(id, reqUser);

    // Prevent CLIENTs from updating financial fields
    if (user.role.name === RoleName.CLIENT) {
      if (
        updateRequestDto.finalCost !== undefined ||
        updateRequestDto.preliminaryCost !== undefined
      ) {
        throw new ForbiddenException(
          'Clients are not allowed to update financial costs.',
        );
      }
      // Add other fields CLIENTs should not update if necessary
    }

    // More granular checks could be added here, e.g., preventing a LOGISTICIAN from changing the cost
    // For now, we trust the roles that have access to this endpoint.
    Object.assign(request, updateRequestDto);

    // Note: If the update includes changes to cargos or distance, recalculating preliminary cost might be needed.
    // This is a feature enhancement for later.

    return this.requestRepository.save(request);
  }

  async remove(id: string, reqUser: RequestUser): Promise<void> {
    // findOne will throw a NotFoundException or ForbiddenException if the user doesn't have access
    const request = await this.findOne(id, reqUser);

    // Because of `onDelete: 'CASCADE'` on the Shipment entity,
    // deleting the request will also delete the associated shipment.
    // Cargos will also be deleted due to `cascade: true`.
    await this.requestRepository.softRemove(request);
  }
}
