import { Controller, Get, Param } from '@nestjs/common';
import { FreightCalculatorService } from './freight-calculator.service';

@Controller('freight-calculator')
export class FreightCalculatorController {
  constructor(
    private readonly freightCalculatorService: FreightCalculatorService,
  ) {}

  @Get(':clientCep')
  async calculateFreight(@Param('clientCep') clientCep: string) {
    return this.freightCalculatorService.calculateFreight(clientCep);
  }
}
