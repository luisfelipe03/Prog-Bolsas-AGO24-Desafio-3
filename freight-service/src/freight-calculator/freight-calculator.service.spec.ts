import { Test, TestingModule } from '@nestjs/testing';
import { FreightCalculatorService } from './freight-calculator.service';

describe('FreightCalculatorService', () => {
  let service: FreightCalculatorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FreightCalculatorService],
    }).compile();

    service = module.get<FreightCalculatorService>(FreightCalculatorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
