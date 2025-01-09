import { Store } from '../entities/store.entity';
import { PinMaps } from '../types/address.interface';

export class Response2Dto {
  Stores: Store[];
  pins: PinMaps[];
  limit: number;
  offset: number;
  total: number;
}
