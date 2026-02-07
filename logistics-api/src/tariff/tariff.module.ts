import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tariff } from './entities/tariff.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Tariff])],
  controllers: [],
  providers: [],
  exports: [TypeOrmModule.forFeature([Tariff])],
})
export class TariffModule {}