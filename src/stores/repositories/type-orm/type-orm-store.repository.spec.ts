import { Repository } from 'typeorm';
import { Coordinates } from 'src/stores/types/address.interface';
import { TypeOrmStoreRepository } from './type-orm-store.repository';
import { Store } from 'src/stores/entities/store.entity';
import { RepositoryError } from 'src/common/errors/repository.error';

jest.mock('typeorm', () => ({
  Repository: jest.fn().mockImplementation(() => ({
    save: jest.fn(),
    findOne: jest.fn(),
    findAndCount: jest.fn(),
    createQueryBuilder: jest.fn().mockReturnValue({
      addSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      setParameters: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      getRawAndEntities: jest.fn(),
    }),
    delete: jest.fn(),
  })),
}));

describe('TypeOrmStoreRepository', () => {
  let repository: TypeOrmStoreRepository;
  let mockRepo: jest.Mocked<Repository<Store>>;

  beforeEach(() => {
    mockRepo = {
      save: jest.fn(),
      findOne: jest.fn(),
      findAndCount: jest.fn(),
      createQueryBuilder: jest.fn().mockReturnValue({
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        setParameters: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        getRawAndEntities: jest.fn(),
      }),
      delete: jest.fn(),
    } as unknown as jest.Mocked<Repository<Store>>;

    repository = new TypeOrmStoreRepository(mockRepo);
  });

  describe('save', () => {
    it('should save a store successfully', async () => {
      const store = new Store();
      mockRepo.save.mockResolvedValue(store);

      const result = await repository.save(store);

      expect(mockRepo.save).toHaveBeenCalledWith(store);
      expect(result).toBe(store);
    });

    it('should throw RepositoryError on save failure', async () => {
      mockRepo.save.mockRejectedValue(new Error('Save failed'));

      await expect(repository.save(new Store())).rejects.toThrowError(
        new RepositoryError('save', 'Store', 'Save failed'),
      );
    });
  });

  describe('findById', () => {
    it('should find a store by ID', async () => {
      const store = new Store();
      mockRepo.findOne.mockResolvedValue(store);

      const result = await repository.findById('1');

      expect(mockRepo.findOne).toHaveBeenCalledWith({
        where: { storeID: '1' },
      });
      expect(result).toBe(store);
    });

    it('should throw RepositoryError on findById failure', async () => {
      mockRepo.findOne.mockRejectedValue(new Error('Find failed'));

      await expect(repository.findById('1')).rejects.toThrowError(
        new RepositoryError('findById', 'Store', 'Find failed'),
      );
    });
  });

  describe('findAll', () => {
    it('should return all stores with pagination', async () => {
      const stores = [new Store()];
      mockRepo.findAndCount.mockResolvedValue([stores, 1]);

      const result = await repository.findAll(10, 0);

      expect(mockRepo.findAndCount).toHaveBeenCalledWith({
        take: 10,
        skip: 0,
      });
      expect(result).toEqual({
        stores,
        limit: 10,
        offset: 0,
        total: 1,
      });
    });

    it('should throw RepositoryError on findAll failure', async () => {
      mockRepo.findAndCount.mockRejectedValue(new Error('Find failed'));

      await expect(repository.findAll(10, 0)).rejects.toThrowError(
        new RepositoryError('findAll', 'Store', 'Find failed'),
      );
    });
  });

  describe('findNearestStores', () => {
    it('should find nearest stores within 50km', async () => {
      const stores = [new Store()];
      const raw = [{ distance: 10 }];
      mockRepo.createQueryBuilder = jest.fn().mockReturnValue({
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        setParameters: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        getRawAndEntities: jest.fn().mockResolvedValue({
          entities: stores,
          raw,
        }),
      });

      const coordinates: Coordinates = {
        latitude: '-23.550520',
        longitude: '-46.633308',
      };

      const result = await repository.findNearestStores(coordinates, 10, 0);

      expect(mockRepo.createQueryBuilder).toHaveBeenCalled();
      expect(result).toEqual({
        stores: [{ ...stores[0], distance: 10 }],
        limit: 10,
        offset: 0,
        total: 1,
      });
    });

    it('should throw RepositoryError on query failure', async () => {
      mockRepo.createQueryBuilder = jest.fn().mockReturnValue({
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        setParameters: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        getRawAndEntities: jest
          .fn()
          .mockRejectedValue(new Error('Query failed')),
      });

      const coordinates: Coordinates = {
        latitude: '-23.550520',
        longitude: '-46.633308',
      };

      await expect(
        repository.findNearestStores(coordinates, 10, 0),
      ).rejects.toThrowError(
        new RepositoryError('findNearestStores', 'Store', 'Query failed'),
      );
    });
  });

  describe('delete', () => {
    it('should delete a store by ID', async () => {
      mockRepo.delete.mockResolvedValue(undefined);

      await repository.delete('1');

      expect(mockRepo.delete).toHaveBeenCalledWith('1');
    });

    it('should throw RepositoryError on delete failure', async () => {
      mockRepo.delete.mockRejectedValue(new Error('Delete failed'));

      await expect(repository.delete('1')).rejects.toThrowError(
        new RepositoryError('delete', 'Store', 'Delete failed'),
      );
    });
  });
});
