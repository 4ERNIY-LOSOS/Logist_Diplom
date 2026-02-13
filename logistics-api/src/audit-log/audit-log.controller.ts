import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuditLogService } from './audit-log.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RoleName } from '../auth/enums/role-name.enum';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('audit-log')
export class AuditLogController {
  constructor(private readonly auditLogService: AuditLogService) {}

  @Get()
  @Roles(RoleName.ADMIN)
  findAll() {
    return this.auditLogService.findAll();
  }
}
