import { Module } from '@nestjs/common';
import { PricingEngineService } from './pricing-engine.service';
import { TariffModule } from '../tariff/tariff.module';

@Module({
  imports: [TariffModule],
  providers: [PricingEngineService],
  exports: [PricingEngineService],
})
export class PricingModule {}
