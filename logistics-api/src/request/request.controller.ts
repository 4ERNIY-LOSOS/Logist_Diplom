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
  ParseUUIDPipe,
} from '@nestjs/common';
import { RequestService } from './request.service';
import { CreateRequestDto } from './dto/create-request.dto';
import { UpdateRequestDto } from './dto/update-request.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RoleName } from '../auth/enums/role-name.enum';

@Controller('request')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class RequestController {
  constructor(private readonly requestService: RequestService) {}

  @Post()
  @Roles(RoleName.CLIENT)
  create(@Body() createRequestDto: CreateRequestDto, @Req() req) {
    return this.requestService.create(createRequestDto, req.user);
  }

  @Get()
  findAll(@Req() req) {
    return this.requestService.findAll(req.user);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string, @Req() req) {
    return this.requestService.findOne(id, req.user);
  }

  @Patch(':id')
  @Roles(RoleName.ADMIN, RoleName.LOGISTICIAN)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateRequestDto: UpdateRequestDto,
    @Req() req,
  ) {
    return this.requestService.update(id, updateRequestDto, req.user);
  }

  @Delete(':id')
  @Roles(RoleName.ADMIN, RoleName.LOGISTICIAN)
  remove(@Param('id', ParseUUIDPipe) id: string, @Req() req) {
    return this.requestService.remove(id, req.user);
  }
}
