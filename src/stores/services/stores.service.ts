import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { TypeOrmStoreRepository } from '../repositories/type-orm/type-orm-store.repository';
import { CreateStoreDto } from '../dto/create-store.dto';
import { Store } from '../entities/store.entity';
import logger from 'src/config/logger.config';
import { UpdateStoreDto } from '../dto/update-store.dto';
import { Address, PartialAddress, PinMaps } from '../types/address.interface';
import { PostalCodeInvalidError } from '../../common/errors/postal-code-invalid.error';
import { Store2, StoresResponses2 } from '../types/stores-responses.interface';
import { CorreiosService } from 'src/external-integrations/correios/correios.service';
import { GoogleService } from 'src/external-integrations/google/google.service';
import { ViacepService } from 'src/external-integrations/viacep/viacep.service';

@Injectable()
export class StoresService {
  constructor(
    private readonly storeRepo: TypeOrmStoreRepository,
    private readonly correiosService: CorreiosService,
    private readonly googleService: GoogleService,
    private readonly viacepService: ViacepService,
  ) {}

  private handleError(message: string, error: Error): never {
    logger.error(`${message}: ${error.message}`);
    throw error instanceof NotFoundException
      ? error
      : new InternalServerErrorException(message);
  }

  async getAllStores(limit: number, offset: number) {
    try {
      const stores = await this.storeRepo.findAll(limit, offset);

      if (stores.stores.length === 0) {
        throw new NotFoundException('No stores registered.');
      }

      return stores;
    } catch (error) {
      this.handleError('Failed to fetch stores.', error);
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
      this.handleError('Failed to fetch stores by state.', error);
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
      this.handleError('Failed to fetch store by ID.', error);
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

      const storesWithDeliveryOptions = await this.addDeliveryOptions(
        stores.stores,
        clientAddress,
        clientPostalCode,
      );

      const pins: PinMaps[] = stores.stores.map((store) => ({
        position: { lat: Number(store.latitude), lng: Number(store.longitude) },
        title: store.storeName,
      }));

      const storesResponse: Store2[] = storesWithDeliveryOptions.map((store) =>
        this.formatStoreResponse(store, store.distance, store.deliveryOptions),
      );

      return {
        stores: storesResponse,
        pins,
        limit: stores.limit,
        offset: stores.offset,
        total: stores.total,
      };
    } catch (error) {
      this.handleError('Failed to fetch nearest stores.', error);
    }
  }

  async createStore(storeDto: CreateStoreDto) {
    try {
      const addressWithCoordinates = await this.fetchAddressAndCoordinates(
        storeDto.postalCode,
      );

      if (!addressWithCoordinates.address && !addressWithCoordinates.district) {
        addressWithCoordinates.address = storeDto.address;
        addressWithCoordinates.district = storeDto.district;
      }

      const store = Store.create(storeDto, addressWithCoordinates);
      return await this.storeRepo.save(store);
    } catch (error) {
      this.handleError('Failed to create store.', error);
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
        storeDto = { ...storeDto, ...addressWithCoordinates };
      }

      Object.assign(storeToUpdate, storeDto);
      return await this.storeRepo.save(storeToUpdate);
    } catch (error) {
      this.handleError('Failed to update store.', error);
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
      this.handleError('Failed to delete store.', error);
    }
  }

  // Métodos privados reutilizáveis

  private async fetchAddressAndCoordinates(
    postalCode: string,
  ): Promise<Address> {
    try {
      const partialAddress: PartialAddress =
        await this.viacepService.getAdressByPostalCode(postalCode);
      const address: Address =
        await this.googleService.getCoordinateByAddress(partialAddress);
      if (!address.latitude || !address.longitude) {
        throw new InternalServerErrorException('Failed to fetch coordinates.');
      }
      return address;
    } catch (error) {
      if (error instanceof PostalCodeInvalidError) {
        throw error;
      }
      this.handleError('Failed to fetch address and coordinates.', error);
    }
  }

  private async addDeliveryOptions(
    stores: Store[],
    clientAddress: Address,
    clientPostalCode: string,
  ) {
    return Promise.all(
      stores.map(async (store) => {
        const { distance, duration } =
          await this.googleService.calculateDistance(
            { latitude: store.latitude, longitude: store.longitude },
            {
              latitude: clientAddress.latitude,
              longitude: clientAddress.longitude,
            },
          );

        const deliveryOptions = await this.deliveryOptions(
          store,
          distance,
          duration,
          clientPostalCode,
        );

        return { ...store, distance, deliveryOptions };
      }),
    ).then((results) => {
      return results.sort((a, b) => a.distance - b.distance);
    });
  }

  private formatStoreResponse(
    store: Store,
    distance: number,
    deliveryOptions: any,
  ) {
    return {
      name: store.storeName,
      city: store.city,
      postalCode: store.postalCode,
      type: store.type,
      distance: `${distance.toFixed(1)} km`,
      value: deliveryOptions,
    };
  }

  private async deliveryOptions(
    store: Store,
    distance: number,
    duration: number,
    clientPostalCode: string,
  ) {
    const deliveryOptions = [];

    if (store.type === 'PDV' && distance <= 50) {
      deliveryOptions.push({
        prazo: this.prazoMotoboy(duration),
        price: this.calculatePrice(distance),
        description: 'Motoboy',
      });
      deliveryOptions.push({
        prazo: '1 dia útil',
        price: 'Grátis',
        description: 'Retirada na loja',
      });
    }

    if (store.type === 'LOJA') {
      if (distance <= 50) {
        deliveryOptions.push({
          prazo: this.prazoMotoboy(duration),
          price: this.calculatePrice(distance),
          description: 'Motoboy',
        });
        deliveryOptions.push({
          prazo: '1 dia útil',
          price: 'Grátis',
          description: 'Retirada na loja',
        });
      }

      const correiosOptions = await this.correiosService.fetchFreightPrice(
        clientPostalCode,
        store.postalCode,
      );

      deliveryOptions.push(
        ...correiosOptions.map((option) => ({
          prazo: option.prazo,
          price: option.price,
          description: option.description,
        })),
      );
    }

    return deliveryOptions;
  }

  private prazoMotoboy(duration: number): string {
    const prazoMinimum = 15;
    const prazo = prazoMinimum + duration;
    const resto = prazo % 5;
    const prazoArredondado = prazo + (5 - (resto % 5));
    return `${prazoArredondado} minutos`;
  }

  private calculatePrice(distance: number): string {
    const price = 15 + distance * 0.25;
    const priceInCents = price * 100;
    const remainder = priceInCents % 50;
    const roundedPriceInCents = priceInCents + (50 - remainder);
    return `R$${(roundedPriceInCents / 100).toFixed(2)}`;
  }
}
