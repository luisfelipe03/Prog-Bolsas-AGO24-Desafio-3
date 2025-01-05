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

@Injectable()
export class DistributorsService {
  constructor(
    @InjectRepository(Distributor)
    private distributorRepo: Repository<Distributor>,
    @InjectRepository(Address)
    private addressRepo: Repository<Address>,
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
        throw new ConflictException('Endereço já cadastrado.');
      }

      const savedAddress = await queryRunner.manager.save(newAddress);

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

      return savedDistributor;
    } catch (error) {
      await queryRunner.rollbackTransaction();

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

  async findByCnpj(cnpj: string) {
    const distributor = await this.distributorRepo.findOne({
      where: { cnpj },
      relations: ['address'],
    });
    if (!distributor) {
      throw new DistributorNotFoundException();
    }

    return OutputDistributorDto.fromEntity(distributor);
  }

  async findDistibutorsByType(type: 'store' | 'pdv') {
    const distributors = await this.distributorRepo.find({
      where: { type },
      relations: ['address'],
    });

    if (distributors.length === 0) {
      throw new NoDistributorsFoundException();
    }

    return OutputDistributorDto.fromEntities(distributors);
  }

  async findDistributorsByState(state: string) {
    const distributors = await this.distributorRepo
      .createQueryBuilder('distributor')
      .leftJoinAndSelect('distributor.address', 'address')
      .where('address.state = :state', { state })
      .getMany();

    if (distributors.length === 0) {
      throw new NoDistributorsFoundException();
    }

    return OutputDistributorDto.fromEntities(distributors);
  }

  async findDistributorsByCity(city: string) {
    const distributors = await this.distributorRepo
      .createQueryBuilder('distributor')
      .leftJoinAndSelect('distributor.address', 'address')
      .where('address.city ILIKE :city', { city: `%${city}%` }) // Uso do operador LIKE
      .getMany();

    if (distributors.length === 0) {
      throw new NoDistributorsFoundException();
    }

    return OutputDistributorDto.fromEntities(distributors);
  }

  async update(id: string, updateDistributorDto: UpdateDistributorDto) {
    const distributor = await this.distributorRepo.findOne({
      where: { id },
      relations: ['address'],
    });

    if (!distributor) {
      throw new DistributorNotFoundException();
    }

    const { phone, email, password, cnpj, address } = updateDistributorDto;
    console.log('Service: ', phone, email, password, cnpj, address);

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

      console.log('duplicateDistributor: ', duplicateDistributor);

      if (duplicateDistributor) {
        throw new ConflictException(
          'Já existe um distribuidor com o mesmo CNPJ, telefone ou e-mail.',
        );
      }

      if (address && address !== distributor.address) {
        const addressWithCoordinates =
          await GetCoordinatesByAddress.execute(address);

        if (
          !addressWithCoordinates.latitude ||
          !addressWithCoordinates.longitude
        ) {
          throw new ConflictException('Endereço não encontrado ou inválido.');
        }

        Object.assign(updateDistributorDto.address, addressWithCoordinates);
      }

      if (password && !(await bcrypt.compare(password, distributor.password))) {
        const hashedPassword = await bcrypt.hash(password, 10);
        updateDistributorDto.password = hashedPassword;
      }

      Object.keys(updateDistributorDto).forEach((key) => {
        if (
          updateDistributorDto[key] &&
          updateDistributorDto[key] !== distributor[key]
        ) {
          distributor[key] = updateDistributorDto[key];
        }
      });

      await this.distributorRepo.save(distributor);
      return OutputDistributorDto.fromEntity(distributor);
    } catch (error) {
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

    return distributor;
  }
}
