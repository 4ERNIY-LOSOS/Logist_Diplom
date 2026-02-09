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
import { TariffService } from './tariff.service';
import { CreateTariffDto } from './dto/create-tariff.dto';
import { UpdateTariffDto } from './dto/update-tariff.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RoleName } from '../auth/enums/role-name.enum';

@UseGuards(AuthGuard('jwt'), RolesGuard) // Protect all endpoints by default
@Controller('tariff')
export class TariffController {
  constructor(private readonly tariffService: TariffService) {}

  @Post()
  @Roles(RoleName.ADMIN, RoleName.LOGISTICIAN)
  create(@Body() createTariffDto: CreateTariffDto) {
    return this.tariffService.create(createTariffDto);
  }

  @Get()
  @Roles(RoleName.ADMIN, RoleName.LOGISTICIAN)
  findAll() {
    return this.tariffService.findAll();
  }

  @Get('active')
  @Roles(RoleName.CLIENT, RoleName.ADMIN, RoleName.LOGISTICIAN)
  findActiveTariff() {
    return this.tariffService.findActiveTariff();
  }

  @Get(':id')
  @Roles(RoleName.ADMIN, RoleName.LOGISTICIAN)
  findOne(@Param('id') id: string) {
    return this.tariffService.findOne(id);
  }

  @Patch(':id')
  @Roles(RoleName.ADMIN, RoleName.LOGISTICIAN)
  update(@Param('id') id: string, @Body() updateTariffDto: UpdateTariffDto) {
    return this.tariffService.update(id, updateTariffDto);
  }

  @Delete(':id')
  @Roles(RoleName.ADMIN, RoleName.LOGISTICIAN)
  remove(@Param('id') id: string) {
    return this.tariffService.remove(id);
  }
}
