import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { LtlShipmentService } from './ltl-shipment.service';
import { CreateLtlShipmentDto } from './dto/create-ltl-shipment.dto';
import { UpdateLtlShipmentDto } from './dto/update-ltl-shipment.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RoleName } from '../auth/enums/role-name.enum';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('ltl-shipment')
export class LtlShipmentController {
  constructor(private readonly ltlShipmentService: LtlShipmentService) {}

  @Post()
  @Roles(RoleName.ADMIN, RoleName.LOGISTICIAN)
  create(@Body() createLtlShipmentDto: CreateLtlShipmentDto, @Req() req) {
    return this.ltlShipmentService.create(createLtlShipmentDto, req.user);
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

  @Patch(':id')
  @Roles(RoleName.ADMIN, RoleName.LOGISTICIAN)
  update(
    @Param('id') id: string,
    @Body() updateLtlShipmentDto: UpdateLtlShipmentDto,
    @Req() req,
  ) {
    return this.ltlShipmentService.update(id, updateLtlShipmentDto, req.user);
  }

  @Delete(':id')
  @Roles(RoleName.ADMIN, RoleName.LOGISTICIAN)
  remove(@Param('id') id: string, @Req() req) {
    return this.ltlShipmentService.remove(id, req.user);
  }
}
