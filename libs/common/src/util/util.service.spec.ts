import { Test, TestingModule } from '@nestjs/testing';

import { CustomConfigModule } from '../config/config.module';
import { UtilService } from './util.service';

describe('UtilService', () => {
  let service: UtilService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [CustomConfigModule],
      providers: [UtilService],
    }).compile();

    service = module.get<UtilService>(UtilService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
