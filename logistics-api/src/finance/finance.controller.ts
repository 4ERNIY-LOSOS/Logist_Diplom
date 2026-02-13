import { Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { FinanceService } from './finance.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RoleName } from '../auth/enums/role-name.enum';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('finance')
export class FinanceController {
  constructor(private readonly financeService: FinanceService) {}

  @Get('invoices')
  @Roles(RoleName.ADMIN, RoleName.LOGISTICIAN)
  async findAllInvoices() {
    return this.financeService.findAll();
  }

  @Patch('invoice/:id/paid')
  @Roles(RoleName.ADMIN)
  async markAsPaid(@Param('id') id: string) {
    return this.financeService.markAsPaid(id);
  }
}
