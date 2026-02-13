import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { Shipment } from '../shipment/entities/shipment.entity';
import { Vehicle } from '../vehicle/entities/vehicle.entity';
import { Request } from '../request/entities/request.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Shipment, Vehicle, Request])],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}
