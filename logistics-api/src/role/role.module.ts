import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoleService } from './role.service';
import { RoleController } from './role.controller';
import { Role } from './entities/role.entity';
import { User } from '../user/entities/user.entity'; // Import User entity

@Module({
  imports: [TypeOrmModule.forFeature([Role, User])],
  controllers: [RoleController],
  providers: [RoleService],
  exports: [TypeOrmModule.forFeature([Role, User]), RoleService], // Export TypeOrmModule.forFeature([Role, User])
})
export class RoleModule {}
