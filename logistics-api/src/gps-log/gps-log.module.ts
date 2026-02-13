import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GpsLog } from './entities/gps-log.entity';
import { GpsLogService } from './gps-log.service';
import { GpsLogController } from './gps-log.controller';
import { Shipment } from '../shipment/entities/shipment.entity';
import { GpsSimulationService } from './gps-simulation.service';
import { UserModule } from '../user/user.module'; // Import UserModule

@Module({
  imports: [
    TypeOrmModule.forFeature([GpsLog, Shipment]),
    UserModule, // Add UserModule here
  ],
  controllers: [GpsLogController],
  providers: [GpsLogService, GpsSimulationService],
  exports: [GpsLogService, GpsSimulationService, TypeOrmModule.forFeature([GpsLog])],
})
export class GpsLogModule {}
