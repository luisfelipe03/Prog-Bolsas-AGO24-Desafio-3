import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Address } from './entities/address.entity';
import { NoDistributorsFoundException } from './errors/noDistributorsFoundException';
import { DistributorNotFoundException } from './errors/distributorNotFoundException';
import { TypeOrmDistributorRepository } from './repositories/typeORM/type-orm-distributor-repository';
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { Distributor } from './entities/distributor.entity';

@Injectable()
export class DistributorsService {
  constructor(
    private distributorRepo: TypeOrmDistributorRepository,
    @InjectRepository(Address)
    private addressRepo: Repository<Address>,
  ) {}

  async findAll() {
    const distributors = await this.distributorRepo.getDistributors();

    if (distributors.length === 0) {
      throw new NoDistributorsFoundException();
    }

    return distributors;
  }

  async findOne(id: string) {
    const distributor = await this.distributorRepo.getDistributorById(id);
    if (!distributor) {
      throw new DistributorNotFoundException();
    }

    return distributor;
  }

  async findByType(type: string) {
    let distributors = [];
    if (type === 'store') {
      distributors =
        await this.distributorRepo.getDistributorWhereTypeIsStore();
    } else if (type === 'pdv') {
      distributors = await this.distributorRepo.getDistributorWhereTypeIsPdv();
    }

    if (distributors.length === 0) {
      throw new NoDistributorsFoundException();
    }

    return distributors;
  }

  async findByState(state: string) {
    const distributors = await this.distributorRepo.getDistributorsByState(
      state.toUpperCase(),
    );

    if (distributors.length === 0) {
      throw new NoDistributorsFoundException();
    }

    return distributors;
  }

  async findNearbyDistributorsByClientCep(clientCep: string) {
    const clientAddress =
      await this.distributorRepo.findManyNearbyDistributors(clientCep);

    if (!clientAddress) {
      throw new NoDistributorsFoundException();
    }

    return clientAddress;
  }

  @RabbitSubscribe({
    exchange: 'stores',
    routingKey: 'store.created',
    queue: 'catalog-store-created',
  })
  async handleStoresCreated(msg: Distributor) {
    try {
      console.log('Received message:', msg);
      const distributor = Distributor.create(msg);
      await this.distributorRepo.saveDistributor(distributor);
    } catch (error) {
      console.error('Error handling message', error);
    }
  }

  @RabbitSubscribe({
    exchange: 'stores',
    routingKey: 'store.updated',
    queue: 'catalog-store-updated',
  })
  async handleStoresUpdated(msg: Distributor) {
    try {
      console.log('Received message:', msg);
      const distributor = Distributor.create(msg);
      await this.distributorRepo.updateDistributor(distributor);
    } catch (error) {
      console.error('Error handling message', error);
    }
  }
}
