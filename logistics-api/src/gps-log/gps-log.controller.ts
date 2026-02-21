import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  UseGuards,
} from '@nestjs/common';
import { GpsLogService } from './gps-log.service';
import { CreateGpsLogDto } from './dto/create-gps-log.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RoleName } from '../auth/enums/role-name.enum';
import { GetUser } from '../auth/decorators/get-user.decorator';
import type { RequestUser } from '../auth/interfaces/request-user.interface';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('gps-log')
export class GpsLogController {
  constructor(private readonly gpsLogService: GpsLogService) {}

  @Post()
  @Roles(RoleName.LOGISTICIAN, RoleName.ADMIN) // Or a specific 'TRACKER' role if simulated from a device
  create(@Body() createGpsLogDto: CreateGpsLogDto) {
    return this.gpsLogService.create(createGpsLogDto);
  }

  @Get('shipment/:shipmentId')
  @Roles(RoleName.CLIENT, RoleName.LOGISTICIAN, RoleName.ADMIN)
  findByShipmentId(@Param('shipmentId') shipmentId: string, @GetUser() user: RequestUser) {
    return this.gpsLogService.findByShipmentId(shipmentId, user);
  }

  @Get('shipment/:shipmentId/latest')
  @Roles(RoleName.CLIENT, RoleName.LOGISTICIAN, RoleName.ADMIN)
  findLatestByShipmentId(@Param('shipmentId') shipmentId: string, @GetUser() user: RequestUser) {
    return this.gpsLogService.findLatestByShipmentId(shipmentId, user);
  }
}
