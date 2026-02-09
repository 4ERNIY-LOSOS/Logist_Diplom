import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { User } from './entities/user.entity';
import { RoleModule } from '../role/role.module';
import { CompanyModule } from '../company/company.module';
import { Role } from '../role/entities/role.entity'; // Import Role entity
import { Company } from '../company/entities/company.entity'; // Import Company entity
import { Request } from '../request/entities/request.entity'; // Import Request entity

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Role, Company, Request]),
    RoleModule, // Import RoleModule
    forwardRef(() => CompanyModule), // Resolve circular dependency with forwardRef
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
