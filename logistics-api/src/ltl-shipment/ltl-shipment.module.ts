import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LtlShipment } from './entities/ltl-shipment.entity';
import { LtlShipmentService } from './ltl-shipment.service';
import { LtlShipmentController } from './ltl-shipment.controller';
import { Shipment } from '../shipment/entities/shipment.entity'; // Import Shipment entity
import { UserModule } from '../user/user.module';

@Module({
  imports: [TypeOrmModule.forFeature([LtlShipment, Shipment]), UserModule], // Add UserModule here
  controllers: [LtlShipmentController],
  providers: [LtlShipmentService],
  exports: [LtlShipmentService, TypeOrmModule.forFeature([LtlShipment])], // Export LtlShipmentService
})
export class LtlShipmentModule {}
