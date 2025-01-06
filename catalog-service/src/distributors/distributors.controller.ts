import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { DistributorsService } from './distributors.service';

@ApiTags('Distributors')
@Controller('distributors')
export class DistributorsController {
  constructor(private readonly distributorsService: DistributorsService) {}

  @Get()
  async findAll() {
    return this.distributorsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.distributorsService.findOne(id);
  }
}
