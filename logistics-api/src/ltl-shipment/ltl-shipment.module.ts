import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LtlShipment } from './entities/ltl-shipment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([LtlShipment])],
  controllers: [],
  providers: [],
  exports: [TypeOrmModule.forFeature([LtlShipment])],
})
export class LtlShipmentModule {}