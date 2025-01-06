import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Distributor } from './entities/distributor.entity';
import { Repository } from 'typeorm';
import { Address } from './entities/address.entity';
import { NoDistributorsFoundException } from './errors/noDistributorsFoundException';
import { DistributorNotFoundException } from './errors/distributorNotFoundException';
import { OutputDistributorDto } from './dto/output-distributor.dto';
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';

@Injectable()
export class DistributorsService {
  constructor(
    @InjectRepository(Distributor)
    private distributorRepo: Repository<Distributor>,
    @InjectRepository(Address)
    private addressRepo: Repository<Address>,
  ) {}

  async findAll() {
    const distributors = await this.distributorRepo.find({
      relations: ['address'],
    });

    if (distributors.length === 0) {
      throw new NoDistributorsFoundException();
    }

    return OutputDistributorDto.fromEntities(distributors);
  }

  async findOne(id: string) {
    const distributor = await this.distributorRepo.findOne({
      where: { id },
      relations: ['address'],
    });
    if (!distributor) {
      throw new DistributorNotFoundException();
    }

    return distributor;
  }

  async findDistributorByCnpj(cnpj: string) {
    const distributor = await this.distributorRepo.findOne({
      where: { cnpj },
      relations: ['address'],
    });

    if (!distributor) {
      throw new DistributorNotFoundException();
    }

    return OutputDistributorDto.fromEntities(distributor);
  }

  async findDistributorByState(state: string) {
    const distributors = await this.distributorRepo.find({
      relations: ['address'],
    });

    if (distributors.length === 0) {
      throw new NoDistributorsFoundException();
    }

    const distributorsByState = distributors.filter(
      (distributor) => distributor.address.state === state,
    );

    return OutputDistributorDto.fromEntities(distributorsByState);
  }

  async findDistributorByCity(city: string) {
    const distributors = await this.distributorRepo.find({
      relations: ['address'],
    });

    if (distributors.length === 0) {
      throw new NoDistributorsFoundException();
    }

    const distributorsByCity = distributors.filter(
      (distributor) => distributor.address.city === city,
    );

    return OutputDistributorDto.fromEntities(distributorsByCity);
  }

  // async findNearbyDistributor(clientCep: string) {
  //   const clientAddress = await GetCoordinatesByAddress.executeByZip(clientCep);

  // }

  @RabbitSubscribe({
    exchange: 'stores',
    routingKey: 'stores.created',
    queue: 'catalog-store-created',
  })
  async handleDistributorCreated(message: Distributor) {
    try {
      const distributor = this.distributorRepo.create(message);

      await this.distributorRepo.save(distributor);
    } catch (error) {
      console.error('Erro ao processar a mensagem:', error);
    }
  }

  @RabbitSubscribe({
    exchange: 'stores',
    routingKey: 'store.updated',
    queue: 'catalog-store-updated',
  })
  async handleDistributorUpdated(message: Distributor) {
    try {
      const distributor = await this.distributorRepo.findOne({
        where: { id: message.id },
      });

      if (!distributor) {
        throw new DistributorNotFoundException();
      }

      Object.assign(distributor, message);

      await this.distributorRepo.save(distributor);
    } catch (error) {
      console.error('Erro ao processar a mensagem:', error);
    }
  }
}
