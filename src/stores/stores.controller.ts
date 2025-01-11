import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { StoresService } from './stores.service';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Stores')
@Controller('stores')
export class StoresController {
  constructor(private readonly storesService: StoresService) {}

  @Get(':postalCode')
  async getStoreByPostalCode(
    @Param('postalCode') postalCode: string,
    @Query('limit') limit: number,
    @Query('offset') offset: number,
  ) {
    return await this.storesService.getNearestStores(
      postalCode,
      limit || 10,
      offset || 0,
    );
  }

  @Get()
  async getAllStores(
    @Query('limit') limit: number,
    @Query('offset') offset: number,
  ) {
    return await this.storesService.getAllStores(limit || 10, offset || 0);
  }

  @Get('state/:state')
  async getStoresByState(
    @Param('state') state: string,
    @Query('limit') limit: number,
    @Query('offset') offset: number,
  ) {
    return await this.storesService.getStoresByState(
      state.toUpperCase(),
      limit || 10,
      offset || 0,
    );
  }

  @Get('id/:id')
  async getStoreById(@Param('id') id: string) {
    return await this.storesService.getStoreById(id);
  }

  @Post()
  async createStore(@Body() storeDto: CreateStoreDto) {
    return await this.storesService.createStore(storeDto);
  }

  @Patch(':id')
  async updateStore(@Param('id') id: string, @Body() storeDto: UpdateStoreDto) {
    return await this.storesService.updateStore(id, storeDto);
  }

  @Delete(':id')
  @HttpCode(204)
  async deleteStore(@Param('id') id: string) {
    await this.storesService.deleteStore(id);
  }
}
