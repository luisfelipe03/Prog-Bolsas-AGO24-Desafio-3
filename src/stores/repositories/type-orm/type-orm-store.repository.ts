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

  async save(store: Store): Promise<Store> {
    try {
      return await this.storeRepo.save(store);
    } catch (error) {
      throw new RepositoryError('save', 'Store', error);
    }
  }

  async findById(id: string): Promise<Store | undefined> {
    try {
      return await this.storeRepo.findOne({
        where: { storeID: id },
      });
    } catch (error) {
      throw new RepositoryError('findById', 'Store', error);
    }
  }

  async findAll(limit: number, offset: number): Promise<StoresResponses1> {
    try {
      const [stores, total] = await this.storeRepo.findAndCount({
        take: limit,
        skip: offset,
      });

      return {
        stores,
        limit,
        offset,
        total,
      };
    } catch (error) {
      throw new RepositoryError('findAll', 'Store', error);
    }
  }

  async findByState(
    state: string,
    limit: number,
    offset: number,
  ): Promise<StoresResponses1> {
    try {
      const [stores, total] = await this.storeRepo.findAndCount({
        where: { state },
        take: limit,
        skip: offset,
      });

      return {
        stores,
        limit,
        offset,
        total,
      };
    } catch (error) {
      throw new RepositoryError('findByState', 'Store', error);
    }
  }

  async findNearestStores(
    clientCoordinates: Coordinates,
    limit: number = 10,
    offset: number = 0,
  ): Promise<StoresResponses1> {
    const { latitude, longitude } = clientCoordinates;

    if (isNaN(+latitude) || isNaN(+longitude)) {
      throw new Error('Coordenadas inválidas fornecidas.');
    }

    try {
      const query = this.storeRepo
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
        .where('store.takeOutInStore = :takeOutInStore', {
          takeOutInStore: true,
        })
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

      const rawResult = await query.getRawAndEntities();

      if (!rawResult.entities.length) {
        return {
          stores: [],
          limit,
          offset,
          total: 0,
        };
      }

      const stores: StoreWithDistance[] = rawResult.entities.map(
        (store, index) => ({
          ...store,
          distance: parseFloat(rawResult.raw[index].distance.toFixed(1)),
        }),
      );

      const total = stores.length;

      return {
        stores,
        limit,
        offset,
        total,
      };
    } catch (error) {
      throw new RepositoryError(
        'findNearestStores',
        'Store',
        error.message || error,
      );
    }
  }

  async update(store: Store): Promise<Store> {
    try {
      return await this.storeRepo.save(store);
    } catch (error) {
      throw new RepositoryError('update', 'Store', error);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.storeRepo.delete(id);
    } catch (error) {
      throw new RepositoryError('delete', 'Store', error);
    }
  }
}
