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
import { RequestService } from './request.service';
import { CreateRequestDto } from './dto/create-request.dto';
import { UpdateRequestDto } from './dto/update-request.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RoleName } from '../auth/enums/role-name.enum';
import { GetUser } from '../auth/decorators/get-user.decorator';
import type { RequestUser } from '../auth/interfaces/request-user.interface';

@Controller('request')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class RequestController {
  constructor(private readonly requestService: RequestService) {}

  @Get('statuses')
  @Roles(RoleName.ADMIN, RoleName.LOGISTICIAN, RoleName.CLIENT)
  findAllStatuses() {
    return this.requestService.findAllStatuses();
  }

  @Post()
  @Roles(RoleName.CLIENT)
  create(@Body() createRequestDto: CreateRequestDto, @GetUser() user: RequestUser) {
    return this.requestService.create(createRequestDto, user);
  }

  @Get()
  @Roles(RoleName.ADMIN, RoleName.LOGISTICIAN, RoleName.CLIENT)
  findAll(@GetUser() user: RequestUser) {
    return this.requestService.findAll(user);
  }

  @Get(':id')
  @Roles(RoleName.ADMIN, RoleName.LOGISTICIAN, RoleName.CLIENT)
  findOne(@Param('id', ParseUUIDPipe) id: string, @GetUser() user: RequestUser) {
    return this.requestService.findOne(id, user);
  }

  @Patch(':id')
  @Roles(RoleName.ADMIN, RoleName.LOGISTICIAN, RoleName.CLIENT)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateRequestDto: UpdateRequestDto,
    @GetUser() user: RequestUser,
  ) {
    return this.requestService.update(id, updateRequestDto, user);
  }

  @Delete(':id')
  @Roles(RoleName.ADMIN, RoleName.LOGISTICIAN, RoleName.CLIENT)
  remove(@Param('id', ParseUUIDPipe) id: string, @GetUser() user: RequestUser) {
    return this.requestService.remove(id, user);
  }
}
