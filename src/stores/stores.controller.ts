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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';

@ApiTags('Stores')
@Controller('stores')
export class StoresController {
  constructor(private readonly storesService: StoresService) {}

  @Get(':postalCode')
  @ApiOperation({ summary: 'Get stores by postal code' })
  @ApiResponse({
    status: 200,
    description: 'List of nearest stores returned successfully.',
  })
  @ApiResponse({
    status: 404,
    description: 'No stores found for the given postal code.',
  })
  @ApiParam({
    name: 'postalCode',
    description: 'The postal code to search for stores',
    example: '12345',
  })
  @ApiQuery({
    name: 'limit',
    description: 'Limit the number of results',
    required: false,
    example: 10,
  })
  @ApiQuery({
    name: 'offset',
    description: 'Offset for pagination',
    required: false,
    example: 0,
  })
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
  @ApiOperation({ summary: 'Get all stores' })
  @ApiResponse({
    status: 200,
    description: 'List of all stores returned successfully.',
  })
  @ApiQuery({
    name: 'limit',
    description: 'Limit the number of results',
    required: false,
    example: 10,
  })
  @ApiQuery({
    name: 'offset',
    description: 'Offset for pagination',
    required: false,
    example: 0,
  })
  async getAllStores(
    @Query('limit') limit: number,
    @Query('offset') offset: number,
  ) {
    return await this.storesService.getAllStores(limit || 10, offset || 0);
  }

  @Get('state/:state')
  @ApiOperation({ summary: 'Get stores by state' })
  @ApiResponse({
    status: 200,
    description: 'List of stores in the given state returned successfully.',
  })
  @ApiParam({
    name: 'state',
    description: 'The state abbreviation to filter stores',
    example: 'NY',
  })
  @ApiQuery({
    name: 'limit',
    description: 'Limit the number of results',
    required: false,
    example: 10,
  })
  @ApiQuery({
    name: 'offset',
    description: 'Offset for pagination',
    required: false,
    example: 0,
  })
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
  @ApiOperation({ summary: 'Get store by ID' })
  @ApiResponse({
    status: 200,
    description: 'Store details returned successfully.',
  })
  @ApiResponse({ status: 404, description: 'Store not found.' })
  @ApiParam({ name: 'id', description: 'The ID of the store', example: '123' })
  async getStoreById(@Param('id') id: string) {
    return await this.storesService.getStoreById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new store' })
  @ApiResponse({ status: 201, description: 'Store created successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid input data.' })
  async createStore(@Body() storeDto: CreateStoreDto) {
    return await this.storesService.createStore(storeDto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a store by ID' })
  @ApiResponse({ status: 200, description: 'Store updated successfully.' })
  @ApiResponse({ status: 404, description: 'Store not found.' })
  @ApiParam({
    name: 'id',
    description: 'The ID of the store to update',
    example: '123',
  })
  async updateStore(@Param('id') id: string, @Body() storeDto: UpdateStoreDto) {
    return await this.storesService.updateStore(id, storeDto);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete a store by ID' })
  @ApiResponse({ status: 204, description: 'Store deleted successfully.' })
  @ApiResponse({ status: 404, description: 'Store not found.' })
  @ApiParam({
    name: 'id',
    description: 'The ID of the store to delete',
    example: '123',
  })
  async deleteStore(@Param('id') id: string) {
    await this.storesService.deleteStore(id);
  }
}
