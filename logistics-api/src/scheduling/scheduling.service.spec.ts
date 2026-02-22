import { Test, TestingModule } from '@nestjs/testing';
import { SchedulingService } from './scheduling.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Shipment } from '../shipment/entities/shipment.entity';
import { VehicleMaintenance } from '../vehicle/entities/vehicle-maintenance.entity';
import { BadRequestException } from '@nestjs/common';

describe('SchedulingService', () => {
  let service: SchedulingService;
  let shipmentRepo: any;

  beforeEach(async () => {
    const mockShipmentRepo = {
      createQueryBuilder: jest.fn().mockReturnThis(),
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SchedulingService,
        {
          provide: getRepositoryToken(Shipment),
          useValue: mockShipmentRepo,
        },
        {
          provide: getRepositoryToken(VehicleMaintenance),
          useValue: { findOne: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<SchedulingService>(SchedulingService);
    shipmentRepo = module.get(getRepositoryToken(Shipment));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('checkVehicleAvailability', () => {
    it('should throw BadRequestException if overlapping shipment found', async () => {
      shipmentRepo.getOne.mockResolvedValue({ id: 'existing-id' });

      await expect(service.checkVehicleAvailability('v-id', new Date(), new Date()))
        .rejects.toThrow(BadRequestException);
    });

    it('should return true if no overlapping shipment found', async () => {
      shipmentRepo.getOne.mockResolvedValue(null);

      const result = await service.checkVehicleAvailability('v-id', new Date(), new Date());
      expect(result).toBe(true);
    });
  });
});
