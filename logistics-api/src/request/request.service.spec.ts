import { Test, TestingModule } from '@nestjs/testing';
import { RequestService } from './request.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Request } from './entities/request.entity';
import { RequestStatus } from './entities/request-status.entity';
import { CargoType } from '../cargo/entities/cargo-type.entity';
import { UserService } from '../user/user.service';
import { PricingEngineService } from '../pricing/pricing-engine.service';

describe('RequestService', () => {
  let service: RequestService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RequestService,
        {
          provide: getRepositoryToken(Request),
          useValue: {},
        },
        {
          provide: getRepositoryToken(CargoType),
          useValue: {},
        },
        {
          provide: getRepositoryToken(RequestStatus),
          useValue: {},
        },
        {
          provide: UserService,
          useValue: {},
        },
        {
          provide: PricingEngineService,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<RequestService>(RequestService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
