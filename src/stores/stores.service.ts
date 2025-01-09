import { Injectable } from '@nestjs/common';
import { TypeOrmStoreRepository } from './repositories/type-orm/type-orm-store.repository';
import { Coordinates } from './types/address.interface';

@Injectable()
export class StoresService {
  constructor(private readonly storeRepo: TypeOrmStoreRepository) {}

  async getAllStores(limit: number, offset: number) {
    return await this.storeRepo.findAll(limit, offset);
  }

  async getStoresByState(state: string, limit: number, offset: number) {
    return await this.storeRepo.findByState(state, limit, offset);
  }

  async getStoreById(id: string) {
    return await this.storeRepo.findById(id);
  }

  async getNearestStores(
    clientCoordinates: Coordinates,
    limit: number,
    offset: number,
  ) {
    return await this.storeRepo.findNearestStores(
      clientCoordinates,
      limit,
      offset,
    );
  }
}
