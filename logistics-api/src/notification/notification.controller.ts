import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RoleName } from '../auth/enums/role-name.enum';
import { GetUser } from '../auth/decorators/get-user.decorator';
import type { RequestUser } from '../auth/interfaces/request-user.interface';

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
  findAllMy(@GetUser() user: RequestUser) {
    return this.notificationService.findAllByUserId(user.userId);
  }

  @Get('my/unread')
  @Roles(RoleName.CLIENT, RoleName.LOGISTICIAN, RoleName.ADMIN)
  findMyUnread(@GetUser() user: RequestUser) {
    return this.notificationService.findUnreadByUserId(user.userId);
  }

  @Get('all')
  @Roles(RoleName.ADMIN, RoleName.LOGISTICIAN)
  findAllNotifications() {
    return this.notificationService.findAllNotifications();
  }

  @Patch(':id/read')
  @Roles(RoleName.CLIENT, RoleName.LOGISTICIAN, RoleName.ADMIN)
  markAsRead(@Param('id') id: string, @GetUser() user: RequestUser) {
    return this.notificationService.markAsRead(id, user.userId);
  }

  @Patch('mark-all-read')
  @Roles(RoleName.CLIENT, RoleName.LOGISTICIAN, RoleName.ADMIN)
  markAllAsRead(@GetUser() user: RequestUser) {
    return this.notificationService.markAllAsRead(user.userId);
  }

  @Delete(':id')
  @Roles(RoleName.CLIENT, RoleName.LOGISTICIAN, RoleName.ADMIN)
  remove(@Param('id') id: string, @GetUser() user: RequestUser) {
    return this.notificationService.remove(id, user.userId);
  }

  @Delete(':id/admin')
  @Roles(RoleName.ADMIN)
  removeNotificationByAdmin(@Param('id') id: string) {
    return this.notificationService.removeNotificationByAdmin(id);
  }
}
