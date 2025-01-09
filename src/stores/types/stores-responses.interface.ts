import { Store } from '../entities/store.entity';

export interface StoresResponses1 {
  stores: Store[];
  limit: number;
  offset: number;
  total: number;
}
