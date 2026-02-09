import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tariff } from './entities/tariff.entity';
import { TariffService } from './tariff.service';
import { TariffController } from './tariff.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Tariff])],
  controllers: [TariffController],
  providers: [TariffService],
  exports: [TypeOrmModule.forFeature([Tariff]), TariffService], // Export TariffService for use in other modules
})
export class TariffModule {}
