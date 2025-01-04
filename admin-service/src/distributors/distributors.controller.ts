import { Controller, Post, Body, Get, Param, UsePipes } from '@nestjs/common';
import { DistributorsService } from './distributors.service';
import { JoiValidationPipe } from 'src/shared/pipes/JoiValidationPipe';
import {
  CreateDistributorDto,
  CreateDistributorSchema,
} from './dto/create-distributor.dto';

@Controller('distributors')
export class DistributorsController {
  constructor(private readonly distributorsService: DistributorsService) {}

  @Post()
  @UsePipes(new JoiValidationPipe(CreateDistributorSchema))
  create(@Body() createDistributorDto: CreateDistributorDto) {
    return this.distributorsService.create(createDistributorDto);
  }

  @Get()
  findAll() {
    return this.distributorsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.distributorsService.findOne(id);
  }

  @Get('/cnpj/:cnpj')
  findByCnpj(@Param('cnpj') cnpj: string) {
    return this.distributorsService.findByCnpj(cnpj);
  }

  @Get('/type/:type')
  findByType(@Param('type') type: 'store' | 'pdv') {
    return this.distributorsService.findDistibutorsByType(type);
  }

  @Get('/state/:state')
  findByState(@Param('state') state: string) {
    return this.distributorsService.findDistributorsByState(
      state.toUpperCase(),
    );
  }

  @Get('/city/:city')
  findByCity(@Param('city') city: string) {
    return this.distributorsService.findDistributorsByCity(city);
  }

  @Get('/desactive/:id')
  desactive(@Param('id') id: string) {
    return this.distributorsService.desactivate(id);
  }

  @Get('/activate/:id')
  activate(@Param('id') id: string) {
    return this.distributorsService.activate(id);
  }
}
