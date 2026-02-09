import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { GpsLogService } from './gps-log.service';
import { CreateGpsLogDto } from './dto/create-gps-log.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RoleName } from '../auth/enums/role-name.enum';

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
  findByShipmentId(@Param('shipmentId') shipmentId: string, @Req() req) {
    return this.gpsLogService.findByShipmentId(shipmentId, req.user);
  }

  @Get('shipment/:shipmentId/latest')
  @Roles(RoleName.CLIENT, RoleName.LOGISTICIAN, RoleName.ADMIN)
  findLatestByShipmentId(@Param('shipmentId') shipmentId: string, @Req() req) {
    return this.gpsLogService.findLatestByShipmentId(shipmentId, req.user);
  }
}
