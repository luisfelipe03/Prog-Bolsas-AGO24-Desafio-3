import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { IStore } from '../types/store.interface';

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
}
