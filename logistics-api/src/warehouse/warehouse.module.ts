import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Warehouse } from './entities/warehouse.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Warehouse])],
  controllers: [],
  providers: [],
  exports: [TypeOrmModule.forFeature([Warehouse])],
})
export class WarehouseModule {}
