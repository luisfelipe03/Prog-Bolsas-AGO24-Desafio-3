import { Store } from '../entities/store.entity';
import { Coordinates } from '../types/address.interface';
import { StoresResponses1 } from '../types/stores-responses.interface';

export interface IStoreRepository {
  save(store: Store): Promise<Store>;
  findById(id: string): Promise<Store | undefined>;
  findAll(limit: number, offset: number): Promise<StoresResponses1>;
  findByState(
    state: string,
    limit: number,
    offset: number,
  ): Promise<StoresResponses1>;
  findNearestStores(
    clientCoordinates: Coordinates,
    limit: number,
    offset: number,
  ): Promise<StoresResponses1>;
  update(store: Store): Promise<Store>;
  delete(id: string): Promise<void>;
}
