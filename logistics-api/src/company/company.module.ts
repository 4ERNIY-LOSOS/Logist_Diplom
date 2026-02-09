import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Company } from './entities/company.entity';
import { CompanyController } from './company.controller';
import { CompanyService } from './company.service';
import { User } from '../user/entities/user.entity';
import { UserModule } from '../user/user.module'; // Import UserModule

@Module({
  imports: [
    TypeOrmModule.forFeature([Company, User]),
    forwardRef(() => UserModule), // Resolve circular dependency with forwardRef
  ],
  controllers: [CompanyController],
  providers: [CompanyService],
  exports: [TypeOrmModule.forFeature([Company, User]), CompanyService], // Export CompanyService
})
export class CompanyModule {}
