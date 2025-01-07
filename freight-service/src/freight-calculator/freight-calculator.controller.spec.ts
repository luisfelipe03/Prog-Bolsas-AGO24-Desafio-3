import { Test, TestingModule } from '@nestjs/testing';
import { FreightCalculatorController } from './freight-calculator.controller';
import { FreightCalculatorService } from './freight-calculator.service';

describe('FreightCalculatorController', () => {
  let controller: FreightCalculatorController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FreightCalculatorController],
      providers: [FreightCalculatorService],
    }).compile();

    controller = module.get<FreightCalculatorController>(FreightCalculatorController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
