import { Controller, Get, UseGuards, Req, ForbiddenException } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { UserService } from '../user/user.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RoleName } from '../auth/enums/role-name.enum';

@Controller('reports')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class ReportsController {
  constructor(
    private readonly reportsService: ReportsService,
    private readonly userService: UserService,
  ) {}

  @Get('client-stats')
  @Roles(RoleName.CLIENT)
  async getClientStats(@Req() req) {
    const user = await this.userService.findOne(req.user.userId);
    if (!user.company) {
      throw new ForbiddenException('User is not associated with a company.');
    }
    return this.reportsService.getClientStats(user.company.id);
  }

  @Get('kpi')
  @Roles(RoleName.ADMIN, RoleName.LOGISTICIAN)
  async getKpis() {
    return this.reportsService.getKpis();
  }
}
