import { Injectable, Logger } from '@nestjs/common';
import { TariffService } from '../tariff/tariff.service';
import { Request } from '../request/entities/request.entity';
import { Cargo } from '../cargo/entities/cargo.entity';

@Injectable()
export class PricingEngineService {
  private readonly logger = new Logger(PricingEngineService.name);

  constructor(private readonly tariffService: TariffService) {}

  async calculateRequestCost(request: Request): Promise<{
    preliminaryCost: number;
    breakdown: {
      baseFee: number;
      distanceCost: number;
      weightCost: number;
      volumeCost: number;
      cargoTypeSurcharge: number;
      requirementsSurcharge: number;
    };
  }> {
    const tariff = await this.tariffService.findActiveTariff();
    const distance = Number(request.distanceKm) || 0;

    let totalWeight = 0;
    let totalVolume = 0;
    let cargoTypeSurcharge = 0;
    let requirementsSurcharge = 0;

    for (const cargo of request.cargos) {
      totalWeight += Number(cargo.weight);
      totalVolume += Number(cargo.volume);

      // Apply Cargo Type Multiplier
      if (cargo.cargoType) {
        const typeMultiplier = Number(cargo.cargoType.baseMultiplier) - 1;
        if (typeMultiplier > 0) {
          // Surcharge based on portion of base costs
          const portionOfBase = (tariff.baseFee / request.cargos.length) +
                               (distance * tariff.costPerKm / request.cargos.length);
          cargoTypeSurcharge += portionOfBase * typeMultiplier;
        }
      }

      // Apply specific requirements flat surcharges
      if (cargo.requirements) {
        for (const req of cargo.requirements) {
          requirementsSurcharge += Number(req.surchargeAmount);
        }
      }
    }

    const distanceCost = distance * tariff.costPerKm;
    const weightCost = totalWeight * tariff.costPerKg;
    const volumeCost = totalVolume * tariff.costPerM3;

    const preliminaryCost = parseFloat(
      (
        tariff.baseFee +
        distanceCost +
        weightCost +
        volumeCost +
        cargoTypeSurcharge +
        requirementsSurcharge
      ).toFixed(2),
    );

    return {
      preliminaryCost,
      breakdown: {
        baseFee: tariff.baseFee,
        distanceCost,
        weightCost,
        volumeCost,
        cargoTypeSurcharge: parseFloat(cargoTypeSurcharge.toFixed(2)),
        requirementsSurcharge: parseFloat(requirementsSurcharge.toFixed(2)),
      },
    };
  }
}
