import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { LtlShipmentService } from './ltl-shipment.service';
import { CreateLtlShipmentDto } from './dto/create-ltl-shipment.dto';
import { UpdateLtlShipmentDto } from './dto/update-ltl-shipment.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RoleName } from '../auth/enums/role-name.enum';
import { LtlShipmentStatus } from './enums/ltl-shipment-status.enum';
import { GetUser } from '../auth/decorators/get-user.decorator';
import type { RequestUser } from '../auth/interfaces/request-user.interface';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('ltl-shipment')
export class LtlShipmentController {
  constructor(private readonly ltlShipmentService: LtlShipmentService) {}

  @Post()
  @Roles(RoleName.ADMIN, RoleName.LOGISTICIAN)
  create(@Body() createLtlShipmentDto: CreateLtlShipmentDto, @GetUser() user: RequestUser) {
    return this.ltlShipmentService.create(createLtlShipmentDto, user);
  }

  @Get()
  @Roles(RoleName.ADMIN, RoleName.LOGISTICIAN)
  findAll() {
    return this.ltlShipmentService.findAll();
  }

  @Get(':id')
  @Roles(RoleName.ADMIN, RoleName.LOGISTICIAN)
  findOne(@Param('id') id: string) {
    return this.ltlShipmentService.findOne(id);
  }

  @Patch(':id/status')
  @Roles(RoleName.ADMIN, RoleName.LOGISTICIAN)
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: LtlShipmentStatus,
  ) {
    return this.ltlShipmentService.updateStatus(id, status);
  }

  @Patch(':id')
  @Roles(RoleName.ADMIN, RoleName.LOGISTICIAN)
  update(
    @Param('id') id: string,
    @Body() updateLtlShipmentDto: UpdateLtlShipmentDto,
    @GetUser() user: RequestUser,
  ) {
    return this.ltlShipmentService.update(id, updateLtlShipmentDto, user);
  }

  @Delete(':id')
  @Roles(RoleName.ADMIN, RoleName.LOGISTICIAN)
  remove(@Param('id') id: string, @GetUser() user: RequestUser) {
    return this.ltlShipmentService.remove(id, user);
  }
}
