import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { IsLatitude, IsLongitude } from 'class-validator';

@Entity()
export class Address {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  street: string;

  @Column()
  number: string;

  @Column()
  neighborhood: string;

  @Column()
  city: string;

  @Column()
  state: string;

  @Column()
  zip: string;

  @Column('float')
  @IsLatitude()
  latitude: number;

  @Column('float')
  @IsLongitude()
  longitude: number;
}
