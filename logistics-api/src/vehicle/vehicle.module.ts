import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Vehicle } from './entities/vehicle.entity';
import { VehicleType } from './entities/vehicle-type.entity';
import { VehicleController } from './vehicle.controller';
import { VehicleService } from './vehicle.service';

@Module({
  imports: [TypeOrmModule.forFeature([Vehicle, VehicleType])],
  controllers: [VehicleController],
  providers: [VehicleService],
  exports: [TypeOrmModule.forFeature([Vehicle, VehicleType]), VehicleService],
})
export class VehicleModule {}
