import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GpsLog } from './entities/gps-log.entity';
import { CreateGpsLogDto } from './dto/create-gps-log.dto';
import { Shipment } from '../shipment/entities/shipment.entity';
import { UserService } from '../user/user.service';
import { RoleName } from '../auth/enums/role-name.enum';
import { RequestUser } from '../auth/interfaces/request-user.interface';

@Injectable()
export class GpsLogService {
  constructor(
    @InjectRepository(GpsLog)
    private gpsLogRepository: Repository<GpsLog>,
    @InjectRepository(Shipment)
    private shipmentRepository: Repository<Shipment>,
    private userService: UserService,
  ) {}

  private async _checkClientAccess(
    shipmentId: string,
    reqUser: RequestUser,
  ): Promise<void> {
    const user = await this.userService.findOne(reqUser.userId);

    if (user.role.name === RoleName.CLIENT) {
      const shipment = await this.shipmentRepository.findOne({
        where: { id: shipmentId },
        relations: ['request', 'request.company'],
      });

      if (!shipment) {
        throw new NotFoundException(
          `Shipment with ID "${shipmentId}" not found`,
        );
      }

      if (
        !user.company ||
        !shipment.request ||
        !shipment.request.company ||
        shipment.request.company.id !== user.company.id
      ) {
        throw new ForbiddenException(
          'You are not authorized to access logs for this shipment.',
        );
      }
    }
  }

  async create(createGpsLogDto: CreateGpsLogDto): Promise<GpsLog> {
    const { shipmentId, ...rest } = createGpsLogDto;

    const shipment = await this.shipmentRepository.findOne({
      where: { id: shipmentId },
    });
    if (!shipment) {
      throw new NotFoundException(`Shipment with ID "${shipmentId}" not found`);
    }

    const gpsLog = this.gpsLogRepository.create({
      ...rest,
      shipment: shipment,
    });

    return this.gpsLogRepository.save(gpsLog);
  }

  async findByShipmentId(shipmentId: string, reqUser: RequestUser): Promise<GpsLog[]> {
    await this._checkClientAccess(shipmentId, reqUser);

    return this.gpsLogRepository.find({
      where: { shipment: { id: shipmentId } },
      order: { timestamp: 'ASC' },
    });
  }

  async findLatestByShipmentId(
    shipmentId: string,
    reqUser: RequestUser,
  ): Promise<GpsLog | null> {
    await this._checkClientAccess(shipmentId, reqUser);

    return this.gpsLogRepository.findOne({
      where: { shipment: { id: shipmentId } },
      order: { timestamp: 'DESC' },
    });
  }
}
