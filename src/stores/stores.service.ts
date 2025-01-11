import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { TypeOrmStoreRepository } from './repositories/type-orm/type-orm-store.repository';
import { CreateStoreDto } from './dto/create-store.dto';
import { getAdressByPostalCode } from 'src/utils/external/viacep/get-address-by-postal-code.api';
import { getCoordinateByAddress } from 'src/utils/external/google/get-coordinate-by-address.api';
import { Store } from './entities/store.entity';
import logger from 'src/config/logger.config';
import { UpdateStoreDto } from './dto/update-store.dto';
import { Address, PartialAddress, PinMaps } from './types/address.interface';
import { PostalCodeInvalidError } from './errors/postal-code-invalid.error';
import {
  StoreResponse2,
  StoresResponses2,
} from './types/stores-responses.interface';
import { calculateDistance } from 'src/utils/external/google/calculate-distance.api';
import { fetchFreightPriceCorreios } from 'src/utils/external/correios/fetch-freight-price-correios.api';

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
  ): Promise<StoresResponses2> {
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

      const storesWithDeliveryPrice = await Promise.all(
        stores.stores.map(async (store) => {
          const distance = await calculateDistance(
            { latitude: store.latitude, longitude: store.longitude },
            {
              latitude: clientAddress.latitude,
              longitude: clientAddress.longitude,
            },
          );

          const deliveryOptions = await this.deliveryOptions(
            store,
            distance,
            clientPostalCode,
          );

          return { ...store, distance, deliveryOptions };
        }),
      );

      const pins: PinMaps[] = stores.stores.map((store) => ({
        position: {
          lat: Number(store.latitude),
          lng: Number(store.longitude),
        },
        title: store.storeName,
      }));

      const storesResponse: StoreResponse2[] = storesWithDeliveryPrice.map(
        (store) => {
          const storeR = {
            name: store.storeName,
            city: store.city,
            postalCode: store.postalCode,
            type: store.type,
            distance: `${store.distance.toFixed(1)} km`,
            value: store.deliveryOptions,
          };
          return storeR;
        },
      );

      return {
        stores: storesResponse,
        pins,
        limit: stores.limit,
        offset: stores.offset,
        total: stores.total,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      logger.error(`Error fetching nearest stores: ${error.message}`);
      throw new InternalServerErrorException('Failed to fetch nearest stores.');
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

  private async deliveryOptions(
    store: Store,
    distance: number,
    clientPostalCode: string,
  ) {
    const deliveryOptions = [];

    if (store.type === 'PDV' && distance <= 50) {
      deliveryOptions.push({
        prazo: this.calculatePrazo(distance),
        price: this.calculatePrice(distance),
        description: 'Motoboy',
      });
    } else if (store.type === 'LOJA') {
      if (distance <= 50) {
        deliveryOptions.push({
          prazo: this.calculatePrazo(distance),
          price: this.calculatePrice(distance),
          description: 'Motoboy',
        });
      }
      const correiosOptions = await fetchFreightPriceCorreios(
        clientPostalCode,
        store.postalCode,
      );
      correiosOptions.forEach((option) => {
        deliveryOptions.push({
          prazo: option.prazo,
          price: option.price,
          description: option.description,
        });
      });
    }
    return deliveryOptions;
  }

  private calculatePrice(distance: number) {
    return `R$ ${(15 + distance * 0.5).toFixed(2)}`;
  }

  private calculatePrazo(distance: number) {
    if (distance <= 10) {
      return '30 minutos';
    } else if (distance <= 20) {
      return '1 hora';
    } else if (distance <= 30) {
      return '1 hora e 30 minutos';
    } else if (distance <= 40) {
      return '2 horas';
    } else {
      return '2 horas e 30 minutos';
    }
  }
}
