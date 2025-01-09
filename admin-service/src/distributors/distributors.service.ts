import { ConflictException, Injectable } from '@nestjs/common';
import { CreateDistributorDto } from './dto/create-distributor.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Distributor } from './entities/distributor.entity';
import { Not, QueryFailedError, Repository } from 'typeorm';
import { GetCoordinatesByAddress } from 'src/shared/external/googleGeoconding';
import { Address } from './entities/address.entity';
import { NoDistributorsFoundException } from './errors/noDistributorsFoundException';
import { DistributorNotFoundException } from './errors/distributorNotFoundException';
import * as bcrypt from 'bcrypt';
import { OutputDistributorDto } from './dto/output-distributor.dto';
import { UpdateDistributorDto } from './dto/update-distributor.dto';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import logger from 'src/shared/logger';

@Injectable()
export class DistributorsService {
  constructor(
    @InjectRepository(Distributor)
    private distributorRepo: Repository<Distributor>,
    @InjectRepository(Address)
    private addressRepo: Repository<Address>,
    private amqpConnection: AmqpConnection,
  ) {}

  async create(createDistributorDto: CreateDistributorDto) {
    const { name, phone, email, password, cnpj, type, address } =
      createDistributorDto;

    const queryRunner =
      this.distributorRepo.manager.connection.createQueryRunner();
    await queryRunner.startTransaction();

    try {
      const hashedPassword = await bcrypt.hash(password, 10);

      const addressWithCoordinates =
        await GetCoordinatesByAddress.execute(address);

      if (
        !addressWithCoordinates.latitude ||
        !addressWithCoordinates.longitude
      ) {
        logger.error('Address not found or invalid');
        throw new ConflictException('Endereço não encontrado ou inválido.');
      }

      const newAddress = this.addressRepo.create({
        street: addressWithCoordinates.street,
        number: addressWithCoordinates.number,
        neighborhood: addressWithCoordinates.neighborhood,
        city: addressWithCoordinates.city,
        state: addressWithCoordinates.state,
        zip: addressWithCoordinates.zip,
        latitude: addressWithCoordinates.latitude,
        longitude: addressWithCoordinates.longitude,
      });

      const addressExists = await queryRunner.manager.findOne(Address, {
        where: {
          street: newAddress.street,
          number: newAddress.number,
          neighborhood: newAddress.neighborhood,
          city: newAddress.city,
          state: newAddress.state,
          zip: newAddress.zip,
        },
      });

      if (addressExists) {
        logger.error('Address already exists');
        throw new ConflictException('Endereço já cadastrado.');
      }

      const savedAddress = await queryRunner.manager.save(newAddress);

      logger.info('Address created', savedAddress);

      const distributor = this.distributorRepo.create({
        name,
        phone,
        email,
        password: hashedPassword,
        cnpj,
        type,
        address: savedAddress,
      });

      const savedDistributor = await queryRunner.manager.save(distributor);

      await queryRunner.commitTransaction();

      await this.amqpConnection.publish(
        'stores',
        'store.created',
        savedDistributor,
      );

      logger.info('Distributor created', savedDistributor);
      logger.info('Message published to RabbitMQ', {
        exchange: 'stores',
        routingKey: 'store.created',
        payload: savedDistributor,
      });

      return savedDistributor;
    } catch (error) {
      await queryRunner.rollbackTransaction();

      logger.error(error);

      if (
        error instanceof QueryFailedError &&
        error.message.includes('duplicate key value violates unique constraint')
      ) {
        throw new ConflictException(
          'Já existe um distribuidor com o mesmo CNPJ, telefone ou e-mail.',
        );
      }

      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll() {
    const distributors = await this.distributorRepo.find({
      relations: ['address'],
    });

    if (distributors.length === 0) {
      logger.info('No distributors found');
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
      logger.info('Distributor not found');
      throw new DistributorNotFoundException();
    }

    return distributor;
  }

  async update(id: string, updateDistributorDto: UpdateDistributorDto) {
    const distributor = await this.distributorRepo.findOne({
      where: { id },
      relations: ['address'],
    });

    if (!distributor) {
      logger.info('Distributor not found');
      throw new DistributorNotFoundException();
    }

    const { phone, email, password, cnpj, address } = updateDistributorDto;

    try {
      const whereConditions: any[] = [];

      if (cnpj) {
        whereConditions.push({ cnpj, id: Not(id) });
      }
      if (phone) {
        whereConditions.push({ phone, id: Not(id) });
      }
      if (email) {
        whereConditions.push({ email, id: Not(id) });
      }

      const duplicateDistributor =
        whereConditions.length > 0
          ? await this.distributorRepo.findOne({
              where: whereConditions,
              relations: ['address'],
            })
          : null;

      if (duplicateDistributor) {
        logger.error('Distributor already exists');
        throw new ConflictException(
          'Já existe um distribuidor com o mesmo CNPJ, telefone ou e-mail.',
        );
      }

      if (address) {
        const oldAddress = await this.addressRepo.findOne({
          where: { id: distributor.address.id },
        });

        if (!oldAddress) {
          logger.error('Address not found');
          throw new ConflictException(
            'Endereço do distribuidor não encontrado.',
          );
        }

        const addressWithCoordinates =
          await GetCoordinatesByAddress.execute(address);

        if (
          !addressWithCoordinates.latitude ||
          !addressWithCoordinates.longitude
        ) {
          logger.error('Address not found or invalid');
          throw new ConflictException('Endereço não encontrado ou inválido.');
        }

        const newAddress = Object.assign(oldAddress, addressWithCoordinates);

        await this.addressRepo.save(newAddress);

        distributor.address = newAddress;

        logger.info('Address updated', newAddress);
      }

      if (password) {
        const isSamePassword = await bcrypt.compare(
          password,
          distributor.password,
        );

        if (isSamePassword) {
          throw new ConflictException(
            'A nova senha não pode ser igual à antiga.',
          );
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        updateDistributorDto.password = hashedPassword;
      }

      Object.keys(updateDistributorDto).forEach((key) => {
        if (updateDistributorDto[key]) {
          if (key === 'address') {
            Object.assign(distributor.address, updateDistributorDto.address);
          } else if (updateDistributorDto[key] !== distributor[key]) {
            distributor[key] = updateDistributorDto[key];
          }
        }
      });

      await this.distributorRepo.save(distributor);

      await this.amqpConnection.publish('stores', 'store.updated', distributor);

      logger.info('Distributor updated', distributor);
      logger.info('Message published to RabbitMQ', {
        exchange: 'stores',
        routingKey: 'store.updated',
        payload: distributor,
      });

      return distributor;
    } catch (error) {
      logger.error(error);
      if (
        error instanceof QueryFailedError &&
        error.message.includes('duplicate key value violates unique constraint')
      ) {
        throw new ConflictException(
          'Já existe um distribuidor com o mesmo CNPJ, telefone ou e-mail.',
        );
      }

      throw error;
    }
  }

  async desactivate(id: string) {
    const distributor = await this.distributorRepo.findOneBy({ id });

    if (!distributor) {
      throw new DistributorNotFoundException();
    }

    if (!distributor.is_active) {
      throw new ConflictException('Distribuidor já está desativado.');
    }

    distributor.is_active = false;

    await this.distributorRepo.save(distributor);

    await this.amqpConnection.publish('stores', 'store.updated', distributor);

    logger.info('Distributor desactivated', distributor);
    logger.info('Message published to RabbitMQ', {
      exchange: 'stores',
      routingKey: 'store.updated',
      payload: distributor,
    });

    return distributor;
  }

  async activate(id: string) {
    const distributor = await this.distributorRepo.findOneBy({ id });

    if (!distributor) {
      throw new DistributorNotFoundException();
    }

    if (distributor.is_active) {
      throw new ConflictException('Distribuidor já está ativo.');
    }

    distributor.is_active = true;

    await this.distributorRepo.save(distributor);

    await this.amqpConnection.publish('stores', 'store.updated', distributor);

    logger.info('Distributor activated', distributor);
    logger.info('Message published to RabbitMQ', {
      exchange: 'stores',
      routingKey: 'store.updated',
      payload: distributor,
    });

    return distributor;
  }
}
