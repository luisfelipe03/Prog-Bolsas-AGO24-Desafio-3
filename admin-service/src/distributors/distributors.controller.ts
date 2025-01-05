import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  UsePipes,
  Patch,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { DistributorsService } from './distributors.service';
import { JoiValidationPipe } from 'src/shared/pipes/JoiValidationPipe';
import {
  CreateDistributorDto,
  CreateDistributorSchema,
} from './dto/create-distributor.dto';
import { UpdateDistributorDto } from './dto/update-distributor.dto';
import { OutputDistributorDto } from './dto/output-distributor.dto';

@ApiTags('Distributors')
@Controller('distributors')
export class DistributorsController {
  constructor(private readonly distributorsService: DistributorsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todos os distribuidores' })
  @ApiResponse({
    status: 200,
    description: 'Lista de todos os distribuidores.',
    type: [OutputDistributorDto],
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
    type: OutputDistributorDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Distribuidor não encontrado.',
  })
  findOne(@Param('id') id: string) {
    return this.distributorsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Criar um novo distribuidor' })
  @ApiBody({
    description: 'Dados para criar um distribuidor',
    type: CreateDistributorDto,
  })
  @ApiResponse({
    status: 201,
    description: 'Distribuidor criado com sucesso.',
    type: OutputDistributorDto,
  })
  @UsePipes(new JoiValidationPipe(CreateDistributorSchema))
  create(@Body() createDistributorDto: CreateDistributorDto) {
    return this.distributorsService.create(createDistributorDto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar um distribuidor existente' })
  @ApiParam({
    name: 'id',
    description: 'ID do distribuidor',
    example: 'abc123',
  })
  @ApiBody({
    description: 'Dados para atualizar um distribuidor',
    type: UpdateDistributorDto,
  })
  @ApiResponse({
    status: 200,
    description: 'Distribuidor atualizado com sucesso.',
    type: OutputDistributorDto,
  })
  update(
    @Param('id') id: string,
    @Body() updateDistributorDto: UpdateDistributorDto,
  ) {
    return this.distributorsService.update(id, updateDistributorDto);
  }

  @Get('/desactive/:id')
  @ApiOperation({ summary: 'Desativar um distribuidor' })
  @ApiParam({
    name: 'id',
    description: 'ID do distribuidor',
    example: 'abc123',
  })
  @ApiResponse({
    status: 200,
    description: 'Distribuidor desativado com sucesso.',
    type: OutputDistributorDto,
  })
  desactive(@Param('id') id: string) {
    return this.distributorsService.desactivate(id);
  }

  @Get('/activate/:id')
  @ApiOperation({ summary: 'Ativar um distribuidor' })
  @ApiParam({
    name: 'id',
    description: 'ID do distribuidor',
    example: 'abc123',
  })
  @ApiResponse({
    status: 200,
    description: 'Distribuidor ativado com sucesso.',
    type: OutputDistributorDto,
  })
  activate(@Param('id') id: string) {
    return this.distributorsService.activate(id);
  }
}
