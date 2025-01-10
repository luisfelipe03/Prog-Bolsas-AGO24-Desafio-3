import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { TypeOrmStoreRepository } from './repositories/type-orm/type-orm-store.repository';
import { CreateStoreDto } from './dto/create-store.dto';
import { getAdressByPostalCode } from 'src/api/viacep/get-address-by-postal-code.api';
import { getCoordinateByAddress } from 'src/api/google/get-coordinate-by-address.api';
import { Store } from './entities/store.entity';
import logger from 'src/config/logger.config';
import { UpdateStoreDto } from './dto/update-store.dto';
import { Address, PartialAddress } from './types/address.interface';
import { PostalCodeInvalidError } from './errors/postal-code-invalid.error';

@Injectable()
export class StoresService {
  constructor(private readonly storeRepo: TypeOrmStoreRepository) {}

  async getAllStores(limit: number, offset: number) {
    try {
      const stores = await this.storeRepo.findAll(limit, offset);

      if (stores.stores.length === 0) {
        throw new NotFoundException('No stores registered.');
      }

      return stores;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      logger.error(`Error fetching all stores: ${error.message}`);
      throw new InternalServerErrorException('Failed to fetch stores.');
    }
  }

  async getStoresByState(state: string, limit: number, offset: number) {
    try {
      const stores = await this.storeRepo.findByState(state, limit, offset);

      if (stores.stores.length === 0) {
        throw new NotFoundException(`No stores found for this state: ${state}`);
      }

      return stores;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      logger.error(`Error fetching stores by state: ${error.message}`);
      throw new InternalServerErrorException(
        'Failed to fetch stores by state.',
      );
    }
  }

  async getStoreById(id: string) {
    try {
      const store = await this.storeRepo.findById(id);
      if (!store) {
        throw new NotFoundException(`Store with ID ${id} not found.`);
      }
      return store;
    } catch (error) {
      logger.error(`Error fetching store by ID: ${error.message}`);
      throw error instanceof NotFoundException
        ? error
        : new InternalServerErrorException('Failed to fetch store.');
    }
  }

  async getNearestStores(
    clientPostalCode: string,
    limit: number,
    offset: number,
  ) {
    try {
      const clientAddress =
        await this.fetchAddressAndCoordinates(clientPostalCode);

      const stores = await this.storeRepo.findNearestStores(
        clientAddress,
        limit,
        offset,
      );

      if (stores.stores.length === 0) {
        throw new NotFoundException('No nearby stores found.');
      }

      return stores;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      logger.error(`Error fetching nearest stores: ${error.message}`);
      throw error instanceof NotFoundException
        ? error
        : new InternalServerErrorException('Failed to fetch nearest stores.');
    }
  }

  async createStore(storeDto: CreateStoreDto) {
    try {
      const addressWithCoordinates = await this.fetchAddressAndCoordinates(
        storeDto.postalCode,
      );
      const store = Store.create(storeDto, addressWithCoordinates);
      return await this.storeRepo.save(store);
    } catch (error) {
      logger.error(`Error creating store: ${error.message}`);
      throw new InternalServerErrorException('Failed to create store.');
    }
  }

  async updateStore(id: string, storeDto: UpdateStoreDto) {
    try {
      const storeToUpdate = await this.storeRepo.findById(id);
      if (!storeToUpdate) {
        throw new NotFoundException(`Store with ID ${id} not found.`);
      }

      if (
        storeDto.postalCode &&
        storeDto.postalCode !== storeToUpdate.postalCode
      ) {
        const addressWithCoordinates = await this.fetchAddressAndCoordinates(
          storeDto.postalCode,
        );
        storeDto.address = addressWithCoordinates.address;
        storeDto.district = addressWithCoordinates.district;
        storeDto.city = addressWithCoordinates.city;
        storeToUpdate.latitude = addressWithCoordinates.latitude;
        storeToUpdate.longitude = addressWithCoordinates.longitude;
      }

      Object.assign(storeToUpdate, storeDto);
      return await this.storeRepo.save(storeToUpdate);
    } catch (error) {
      logger.error(`Error updating store: ${error.message}`);
      throw error instanceof NotFoundException
        ? error
        : new InternalServerErrorException('Failed to update store.');
    }
  }

  async deleteStore(id: string) {
    try {
      const store = await this.storeRepo.findById(id);
      if (!store) {
        throw new NotFoundException(`Store with ID ${id} not found.`);
      }
      await this.storeRepo.delete(id);
    } catch (error) {
      logger.error(`Error fetching store by ID: ${error.message}`);
      throw error instanceof NotFoundException
        ? error
        : new InternalServerErrorException('Failed to fetch store.');
    }
  }

  //TODO: Terminate the method
  private async fetchAddressAndCoordinates(
    postalCode: string,
  ): Promise<Address> {
    try {
      const partialAddress: PartialAddress =
        await getAdressByPostalCode(postalCode);
      const address: Address = await getCoordinateByAddress(partialAddress);
      if (!address.latitude || !address.longitude) {
        throw new InternalServerErrorException('Failed to fetch coordinates.');
      }
      return address;
    } catch (error) {
      if (error instanceof PostalCodeInvalidError) {
        throw error;
      } else {
        logger.error(
          `Error fetching address and coordinates: ${error.message}`,
        );
        throw new InternalServerErrorException(
          'Failed to fetch address and coordinates.',
        );
      }
    }
  }
}
