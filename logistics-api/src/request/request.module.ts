import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RequestService } from './request.service';
import { RequestController } from './request.controller';
import { Request } from './entities/request.entity';
import { RequestStatus } from './entities/request-status.entity';
import { UserModule } from '../user/user.module';
import { AuthModule } from '../auth/auth.module';
import { TariffModule } from '../tariff/tariff.module'; // Import TariffModule

@Module({
  imports: [
    TypeOrmModule.forFeature([Request, RequestStatus]),
    UserModule, // To get access to UserService
    AuthModule, // To get access to guards
    TariffModule, // Import TariffModule here
  ],
  controllers: [RequestController],
  providers: [RequestService],
  exports: [TypeOrmModule.forFeature([Request, RequestStatus]), RequestService],
})
export class RequestModule {}
