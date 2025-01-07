import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Address } from './address.entity';

@Entity()
export class Distributor {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  phone: string;

  @Column({ default: true })
  is_active: boolean;

  @Column()
  type: 'store' | 'pdv';

  @OneToOne(() => Address, {
    nullable: true,
    cascade: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn()
  address: Address;

  static create(data: Partial<Distributor>): Distributor {
    const entity = new Distributor();
    Object.assign(entity, data);
    return entity;
  }
}
