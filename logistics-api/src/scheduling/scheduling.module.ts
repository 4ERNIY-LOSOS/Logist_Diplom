import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SchedulingService } from './scheduling.service';
import { Shipment } from '../shipment/entities/shipment.entity';
import { VehicleMaintenance } from '../vehicle/entities/vehicle-maintenance.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Shipment, VehicleMaintenance])],
  providers: [SchedulingService],
  exports: [SchedulingService],
})
export class SchedulingModule {}
