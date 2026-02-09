import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from './entities/notification.entity';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { User } from '../user/entities/user.entity'; // Import User entity

@Module({
  imports: [TypeOrmModule.forFeature([Notification, User])], // Add User here
  controllers: [NotificationController],
  providers: [NotificationService],
  exports: [NotificationService, TypeOrmModule.forFeature([Notification])], // Export NotificationService
})
export class NotificationModule {}
