import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RoleName } from '../auth/enums/role-name.enum';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post()
  @Roles(RoleName.ADMIN, RoleName.LOGISTICIAN)
  create(@Body() createNotificationDto: CreateNotificationDto) {
    return this.notificationService.create(createNotificationDto);
  }

  @Get('my')
  @Roles(RoleName.CLIENT, RoleName.LOGISTICIAN, RoleName.ADMIN)
  findAllMy(@Req() req: any) {
    return this.notificationService.findAllByUserId(req.user.userId);
  }

  @Get('my/unread')
  @Roles(RoleName.CLIENT, RoleName.LOGISTICIAN, RoleName.ADMIN)
  findMyUnread(@Req() req: any) {
    return this.notificationService.findUnreadByUserId(req.user.userId);
  }

  @Get('all')
  @Roles(RoleName.ADMIN, RoleName.LOGISTICIAN)
  findAllNotifications() {
    return this.notificationService.findAllNotifications();
  }

  @Patch(':id/read')
  @Roles(RoleName.CLIENT, RoleName.LOGISTICIAN, RoleName.ADMIN)
  markAsRead(@Param('id') id: string, @Req() req: any) {
    return this.notificationService.markAsRead(id, req.user.userId);
  }

  @Patch('mark-all-read')
  @Roles(RoleName.CLIENT, RoleName.LOGISTICIAN, RoleName.ADMIN)
  markAllAsRead(@Req() req: any) {
    return this.notificationService.markAllAsRead(req.user.userId);
  }

  @Delete(':id')
  @Roles(RoleName.CLIENT, RoleName.LOGISTICIAN, RoleName.ADMIN)
  remove(@Param('id') id: string, @Req() req: any) {
    return this.notificationService.remove(id, req.user.userId);
  }

  @Delete(':id/admin')
  @Roles(RoleName.ADMIN)
  removeNotificationByAdmin(@Param('id') id: string) {
    return this.notificationService.removeNotificationByAdmin(id);
  }
}
