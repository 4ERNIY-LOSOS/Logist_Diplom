import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ShipmentService } from './shipment.service';
import { CreateShipmentDto } from './dto/create-shipment.dto';
import { UpdateShipmentDto } from './dto/update-shipment.dto';
import { UpdateShipmentStatusDto } from './dto/update-shipment-status.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RoleName } from '../auth/enums/role-name.enum';

@Controller('shipment')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class ShipmentController {
  constructor(private readonly shipmentService: ShipmentService) {}

  @Post()
  @Roles(RoleName.ADMIN, RoleName.LOGISTICIAN)
  create(@Body() createShipmentDto: CreateShipmentDto) {
    return this.shipmentService.createFromRequest(createShipmentDto);
  }

  @Patch('status/:id')
  @Roles(RoleName.ADMIN, RoleName.LOGISTICIAN)
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateShipmentStatusDto: UpdateShipmentStatusDto,
  ) {
    return this.shipmentService.updateStatus(id, updateShipmentStatusDto);
  }

  @Get()
  findAll() {
    return this.shipmentService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.shipmentService.findOne(id);
  }

  @Patch(':id')
  @Roles(RoleName.ADMIN, RoleName.LOGISTICIAN)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateShipmentDto: UpdateShipmentDto,
  ) {
    return this.shipmentService.update(id, updateShipmentDto);
  }

  @Delete(':id')
  @Roles(RoleName.ADMIN, RoleName.LOGISTICIAN)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.shipmentService.remove(id);
  }
}
