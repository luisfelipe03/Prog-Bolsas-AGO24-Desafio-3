import { Store } from '../entities/store.entity';
import { Coordinates } from '../types/address.interface';

export interface IStoreRepository {
  save(store: Store): Promise<Store>;
  findById(id: string): Promise<Store | undefined>;
  findAll(limit: number, offset: number): Promise<Store[]>;
  findByState(state: string, limit: number, offset: number): Promise<Store[]>;
  findNearestStores(clientCoordinates: Coordinates): Promise<Store[]>;
  update(store: Store): Promise<Store>;
  delete(id: string): Promise<void>;
}
