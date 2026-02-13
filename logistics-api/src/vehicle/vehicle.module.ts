import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Vehicle } from './entities/vehicle.entity';
import { VehicleType } from './entities/vehicle-type.entity';
import { VehicleMaintenance } from './entities/vehicle-maintenance.entity';
import { VehicleController } from './vehicle.controller';
import { VehicleService } from './vehicle.service';

@Module({
  imports: [TypeOrmModule.forFeature([Vehicle, VehicleType, VehicleMaintenance])],
  controllers: [VehicleController],
  providers: [VehicleService],
  exports: [TypeOrmModule.forFeature([Vehicle, VehicleType, VehicleMaintenance]), VehicleService],
})
export class VehicleModule {}
