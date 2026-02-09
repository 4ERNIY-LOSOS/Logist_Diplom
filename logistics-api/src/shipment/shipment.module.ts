import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Shipment } from './entities/shipment.entity';
import { ShipmentStatus } from './entities/shipment-status.entity';
import { ShipmentController } from './shipment.controller';
import { ShipmentService } from './shipment.service';
import { RequestModule } from '../request/request.module';
import { DriverModule } from '../driver/driver.module';
import { VehicleModule } from '../vehicle/vehicle.module';
import { UserModule } from '../user/user.module'; // Import UserModule

@Module({
  imports: [
    TypeOrmModule.forFeature([Shipment, ShipmentStatus]),
    RequestModule,
    DriverModule,
    VehicleModule,
    UserModule, // Add UserModule to imports
  ],
  controllers: [ShipmentController],
  providers: [ShipmentService],
  exports: [ShipmentService],
})
export class ShipmentModule {}
