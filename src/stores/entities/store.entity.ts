import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { IStore } from '../types/store.interface';
import { Address } from '../types/address.interface';
import { CreateStoreDto } from '../dto/create-store.dto';

@Entity()
export class Store implements IStore {
  @PrimaryGeneratedColumn('uuid')
  storeID: string;

  @Column()
  storeName: string;

  @Column({ default: true })
  takeOutInStore: boolean;

  @Column('int', { default: 1 })
  shippingTimeInDays: number;

  @Column()
  latitude: string;

  @Column()
  longitude: string;

  @Column()
  address: string;

  @Column()
  city: string;

  @Column()
  district: string;

  @Column()
  state: string;

  @Column()
  country: string;

  @Column()
  postalCode: string;

  @Column()
  type: 'PDV' | 'LOJA';

  static create(store: CreateStoreDto, address: Address): Store {
    if (!store.storeName || store.storeName.trim() === '') {
      throw new Error('storeName is required and cannot be empty');
    }
    if (!['PDV', 'LOJA'].includes(store.type)) {
      throw new Error('type must be either "PDV" or "LOJA"');
    }
    if (!address.latitude || !address.longitude) {
      throw new Error('latitude and longitude are required');
    }
    if (!store.postalCode) {
      throw new Error('postalCode is required');
    }

    const newStore = new Store();
    newStore.storeName = store.storeName;
    newStore.takeOutInStore = true;
    newStore.shippingTimeInDays = 1;
    newStore.latitude = address.latitude;
    newStore.longitude = address.longitude;
    newStore.address = address.address;
    newStore.city = address.city;
    newStore.district = address.district;
    newStore.state = address.state;
    newStore.country = address.country;
    newStore.postalCode = address.postalCode;
    newStore.type = store.type;

    return newStore;
  }
}
