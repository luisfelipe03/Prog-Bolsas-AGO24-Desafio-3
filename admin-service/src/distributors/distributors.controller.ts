import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  UsePipes,
  Patch,
} from '@nestjs/common';
import { DistributorsService } from './distributors.service';
import { JoiValidationPipe } from 'src/shared/pipes/JoiValidationPipe';
import {
  CreateDistributorDto,
  CreateDistributorSchema,
} from './dto/create-distributor.dto';
import { UpdateDistributorDto } from './dto/update-distributor.dto';

@Controller('distributors')
export class DistributorsController {
  constructor(private readonly distributorsService: DistributorsService) {}

  @Get()
  findAll() {
    return this.distributorsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.distributorsService.findOne(id);
  }

  @Post()
  @UsePipes(new JoiValidationPipe(CreateDistributorSchema))
  create(@Body() createDistributorDto: CreateDistributorDto) {
    return this.distributorsService.create(createDistributorDto);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateDistributorDto: UpdateDistributorDto,
  ) {
    console.log('controller: ', updateDistributorDto);
    return this.distributorsService.update(id, updateDistributorDto);
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
