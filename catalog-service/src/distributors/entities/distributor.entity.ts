import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { Address } from './address.entity';

@Entity()
@Unique(['cnpj', 'email', 'phone'])
export class Distributor {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  phone: string;

  @Column()
  email: string;

  @Column()
  password: string;

  @Column()
  cnpj: string;

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
}
