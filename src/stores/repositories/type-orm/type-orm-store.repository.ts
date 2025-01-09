import { Store } from 'src/stores/entities/store.entity';
import { Coordinates } from 'src/stores/types/address.interface';
import { IStoreRepository } from '../iStore.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RepositoryError } from 'src/common/errors/repository.error';
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
      return await this.storeRepo.findOne({ where: { storeID: id } });
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
    limit: number,
    offset: number,
  ): Promise<StoresResponses1> {
    const { latitude, longitude } = clientCoordinates;

    try {
      const query = this.storeRepo
        .createQueryBuilder('store')
        .addSelect(
          `6371 * ACOS(
            COS(RADIANS(:latitude)) 
            * COS(RADIANS(store.latitude)) 
            * COS(RADIANS(store.longitude) - RADIANS(:longitude)) 
            + SIN(RADIANS(:latitude)) 
            * SIN(RADIANS(store.latitude))
          )`,
          'distance',
        )
        .where('store.takeOutInStore = :takeOutInStore', {
          takeOutInStore: true,
        })
        .setParameters({ latitude, longitude })
        .orderBy('distance', 'ASC')
        .take(limit)
        .skip(offset);

      const rawResult = await query.getRawAndEntities();

      const stores: StoreWithDistance[] = rawResult.entities.map(
        (store, index) => ({
          ...store,
          distance: parseFloat(rawResult.raw[index].distance.toFixed(1)),
        }),
      );

      const total = await this.storeRepo
        .createQueryBuilder('store')
        .where('store.takeOutInStore = :takeOutInStore', {
          takeOutInStore: true,
        })
        .getCount();

      return {
        stores,
        limit,
        offset,
        total,
      };
    } catch (error) {
      throw new RepositoryError('findNearestStores', 'Store', error);
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
