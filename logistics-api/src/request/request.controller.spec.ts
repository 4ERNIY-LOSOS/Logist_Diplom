import { Test, TestingModule } from '@nestjs/testing';
import { RequestController } from './request.controller';
import { RequestService } from './request.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Request } from './entities/request.entity';
import { RequestStatus } from './entities/request-status.entity';
import { UserService } from '../user/user.service';
import { PricingEngineService } from '../pricing/pricing-engine.service';

describe('RequestController', () => {
  let controller: RequestController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RequestController],
      providers: [
        RequestService,
        {
          provide: getRepositoryToken(Request),
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

    controller = module.get<RequestController>(RequestController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
