import { Store } from '../entities/store.entity';
import { PinMaps } from './address.interface';

export interface StoresResponses1 {
  stores: Store[];
  limit: number;
  offset: number;
  total: number;
}

export interface StoresResponses2 {
  stores: Store2[];
  pins: PinMaps[];
  limit: number;
  offset: number;
  total: number;
}

export interface Store2 {
  name: string;
  city: string;
  postalCode: string;
  type: string;
  distance: string;
  value: any[];
}
