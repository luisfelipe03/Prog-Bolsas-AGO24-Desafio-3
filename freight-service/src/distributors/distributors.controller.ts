import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { DistributorsService } from './distributors.service';
import { Distributor } from './entities/distributor.entity';

@ApiTags('Distributors')
@Controller('distributors')
export class DistributorsController {
  constructor(private readonly distributorsService: DistributorsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todos os distribuidores' })
  @ApiResponse({
    status: 200,
    description: 'Lista de todos os distribuidores.',
    type: [Distributor],
  })
  findAll() {
    return this.distributorsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter um distribuidor por ID' })
  @ApiParam({
    name: 'id',
    description: 'ID do distribuidor',
    example: 'abc123',
  })
  @ApiResponse({
    status: 200,
    description: 'Distribuidor encontrado.',
    type: Distributor,
  })
  @ApiResponse({
    status: 404,
    description: 'Distribuidor não encontrado.',
  })
  findOne(@Param('id') id: string) {
    return this.distributorsService.findOne(id);
  }

  @Get('type/:type')
  findDistributorsByType(@Param('type') type: string) {
    return this.distributorsService.findByType(type);
  }

  @Get('state/:state')
  findDistributorsByState(@Param('state') state: string) {
    return this.distributorsService.findByState(state);
  }

  @Get('nearby/:clientCep')
  findNearbyDistributorsByClientCep(@Param('clientCep') clientCep: string) {
    return this.distributorsService.findNearbyDistributorsByClientCep(
      clientCep,
    );
  }
}
