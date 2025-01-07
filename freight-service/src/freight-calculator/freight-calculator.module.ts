import { Module } from '@nestjs/common';
import { FreightCalculatorService } from './freight-calculator.service';
import { DistributorsModule } from 'src/distributors/distributors.module';
import { FreightCalculatorController } from './freight-calculator.controller';

@Module({
  imports: [DistributorsModule],
  controllers: [FreightCalculatorController],
  providers: [FreightCalculatorService],
  exports: [FreightCalculatorService],
})
export class FreightCalculatorModule {}
