import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateRequestDto } from './dto/create-request.dto';
import { UpdateRequestDto } from './dto/update-request.dto';
import { Request } from './entities/request.entity';
import { User } from '../user/entities/user.entity';
import { RequestStatus } from './entities/request-status.entity';
import { RoleName } from '../auth/enums/role-name.enum';
import { UserService } from '../user/user.service';
import { TariffService } from '../tariff/tariff.service'; // Import TariffService

@Injectable()
export class RequestService {
  constructor(
    @InjectRepository(Request)
    private requestRepository: Repository<Request>,
    @InjectRepository(RequestStatus)
    private requestStatusRepository: Repository<RequestStatus>,
    private userService: UserService,
    private tariffService: TariffService, // Inject TariffService
  ) {}

  async create(
    createRequestDto: CreateRequestDto,
    reqUser: any,
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

    if (parsedDeliveryDate < parsedPickupDate) {
      throw new BadRequestException(
        'Delivery date cannot be before pickup date.',
      );
    }

    // Clients can only create requests for their own company
    if (user.role.name === RoleName.CLIENT && !user.company) {
      // Corrected condition
      throw new ForbiddenException(
        'Only clients associated with a company can create requests.',
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

    let preliminaryCost = 0;
    try {
      const activeTariff = await this.tariffService.findActiveTariff();
      let totalWeight = 0;
      let totalVolume = 0;

      cargos.forEach((cargo) => {
        totalWeight += cargo.weight;
        totalVolume += cargo.volume; // Use volume directly from DTO
      });

      const distance = distanceKm || 1; // Default to 1km if not provided for calculation

      preliminaryCost = parseFloat(
        (
          activeTariff.baseFee +
          distance * activeTariff.costPerKm +
          totalWeight * activeTariff.costPerKg +
          totalVolume * activeTariff.costPerM3
        ).toFixed(2),
      ); // Round to 2 decimal places
    } catch (tariffError) {
      console.warn(
        'Could not calculate preliminary cost, no active tariff found or calculation error:',
        tariffError.message,
      );
      // Proceed without preliminary cost if tariff not found
      preliminaryCost = 0;
    }

    const newRequest = this.requestRepository.create({
      ...rest,
      pickupAddress,
      deliveryAddress,
      cargos,
      createdByUser: user,
      company: user.company,
      status: initialStatus,
      preliminaryCost: preliminaryCost, // Set calculated preliminary cost
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
      ],
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
    reqUser: any,
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

  async remove(id: string, reqUser: any): Promise<void> {
    // findOne will throw a NotFoundException or ForbiddenException if the user doesn't have access
    const request = await this.findOne(id, reqUser);

    // Because of `onDelete: 'CASCADE'` on the Shipment entity,
    // deleting the request will also delete the associated shipment.
    // Cargos will also be deleted due to `cascade: true`.
    await this.requestRepository.remove(request);
  }
}
