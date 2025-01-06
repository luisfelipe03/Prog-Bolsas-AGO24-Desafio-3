import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { DistributorsService } from './distributors.service';

@ApiTags('Distributors')
@Controller('distributors')
export class DistributorsController {
  constructor(private readonly distributorsService: DistributorsService) {}

  // @Get('/nearby/:clientCep')
  // async findNearbyStores(@Param('clientCep') clientCep: string) {
  //   return this.distributorsService.findNearbyDistributor(clientCep);
  // }
}
