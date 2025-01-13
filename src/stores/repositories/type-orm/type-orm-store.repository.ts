import { Store } from 'src/stores/entities/store.entity';
import { Coordinates } from 'src/stores/types/address.interface';
import { IStoreRepository } from '../iStore.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RepositoryError } from 'src/stores/errors/repository.error';
import { StoresResponses1 } from 'src/stores/types/stores-responses.interface';
import { StoreWithDistance } from 'src/stores/types/store.interface';

export class TypeOrmStoreRepository implements IStoreRepository {
  constructor(
    @InjectRepository(Store) private readonly storeRepo: Repository<Store>,
  ) {}

  private handleRepositoryError(operation: string, error: any): never {
    throw new RepositoryError(operation, 'Store', error.message || error);
  }

  async save(store: Store): Promise<Store> {
    try {
      return await this.storeRepo.save(store);
    } catch (error) {
      this.handleRepositoryError('save', error);
    }
  }

  async findById(id: string): Promise<Store | undefined> {
    try {
      return await this.storeRepo.findOne({ where: { storeID: id } });
    } catch (error) {
      this.handleRepositoryError('findById', error);
    }
  }

  async findAll(limit: number, offset: number): Promise<StoresResponses1> {
    return this.findWithPagination({}, limit, offset, 'findAll');
  }

  async findByState(
    state: string,
    limit: number,
    offset: number,
  ): Promise<StoresResponses1> {
    return this.findWithPagination({ state }, limit, offset, 'findByState');
  }

  private async findWithPagination(
    where: Record<string, any>,
    limit: number,
    offset: number,
    operation: string,
  ): Promise<StoresResponses1> {
    try {
      const [stores, total] = await this.storeRepo.findAndCount({
        where,
        take: limit,
        skip: offset,
      });

      return { stores, limit, offset, total };
    } catch (error) {
      this.handleRepositoryError(operation, error);
    }
  }

  async findNearestStores(
    clientCoordinates: Coordinates,
    limit = 10,
    offset = 0,
  ): Promise<StoresResponses1> {
    const { latitude, longitude } = clientCoordinates;

    if (isNaN(+latitude) || isNaN(+longitude)) {
      throw new Error('Invalid coordinates provided.');
    }

    try {
      const query = this.buildNearestStoresQuery(
        clientCoordinates,
        limit,
        offset,
      );

      const rawResult = await query.getRawAndEntities();

      const stores = rawResult.entities.map((store, index) => ({
        ...store,
        distance: parseFloat(rawResult.raw[index].distance.toFixed(1)),
      })) as StoreWithDistance[];

      return {
        stores,
        limit,
        offset,
        total: stores.length,
      };
    } catch (error) {
      this.handleRepositoryError('findNearestStores', error);
    }
  }

  private buildNearestStoresQuery(
    clientCoordinates: Coordinates,
    limit: number,
    offset: number,
  ) {
    const { latitude, longitude } = clientCoordinates;

    return this.storeRepo
      .createQueryBuilder('store')
      .addSelect(
        `6371 * ACOS(
          COS(RADIANS(:latitude)) 
          * COS(RADIANS(CAST(store.latitude AS double precision))) 
          * COS(RADIANS(CAST(store.longitude AS double precision)) - RADIANS(:longitude)) 
          + SIN(RADIANS(:latitude)) 
          * SIN(RADIANS(CAST(store.latitude AS double precision)))
        )`,
        'distance',
      )
      .where('store.takeOutInStore = :takeOutInStore', { takeOutInStore: true })
      .andWhere(
        `(store.type != 'PDV' OR 6371 * ACOS(
          COS(RADIANS(:latitude)) 
          * COS(RADIANS(CAST(store.latitude AS double precision))) 
          * COS(RADIANS(CAST(store.longitude AS double precision)) - RADIANS(:longitude)) 
          + SIN(RADIANS(:latitude)) 
          * SIN(RADIANS(CAST(store.latitude AS double precision)))
        ) <= 50)`,
      )
      .setParameters({
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
      })
      .orderBy('distance', 'ASC')
      .take(limit)
      .skip(offset);
  }

  async update(store: Store): Promise<Store> {
    try {
      return await this.storeRepo.save(store);
    } catch (error) {
      this.handleRepositoryError('update', error);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.storeRepo.delete(id);
    } catch (error) {
      this.handleRepositoryError('delete', error);
    }
  }
}
