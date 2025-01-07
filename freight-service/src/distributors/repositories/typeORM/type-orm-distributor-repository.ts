import { InjectRepository } from '@nestjs/typeorm';
import { Distributor } from 'src/distributors/entities/distributor.entity';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { DistributorRepository } from '../distributor.repository';
import { GetCoordinatesByAddress } from 'src/shared/external/googleGeoconding';

export type DistributorWithDistance = Distributor & { distance: number };

export class TypeOrmDistributorRepository implements DistributorRepository {
  constructor(
    @InjectRepository(Distributor)
    private readonly distributorRepo: Repository<Distributor>,
  ) {}

  async getDistributors(): Promise<Distributor[]> {
    try {
      return await this.distributorRepo.find({
        relations: ['address'],
        where: { is_active: true },
      });
    } catch (error) {
      throw new Error(`Error fetching distributors: ${error.message}`);
    }
  }

  async getDistributorById(id: string): Promise<Distributor> {
    try {
      const distributor = await this.distributorRepo.findOne({
        where: { id },
        relations: ['address'],
      });
      if (!distributor) {
        throw new NotFoundException(`Distributor with ID ${id} not found`);
      }
      return distributor;
    } catch (error) {
      throw new Error(
        `Error fetching distributor with ID ${id}: ${error.message}`,
      );
    }
  }

  async getDistributorsByState(state: string): Promise<Distributor[]> {
    try {
      const distributors = await this.distributorRepo
        .createQueryBuilder('distributor')
        .innerJoinAndSelect('distributor.address', 'address')
        .where('address.state = :state', { state })
        .andWhere('distributor.is_active = :isActive', { isActive: true })
        .orderBy('distributor.name', 'ASC')
        .getMany();

      return distributors;
    } catch (error) {
      throw new Error(`Error fetching distributors by state: ${error.message}`);
    }
  }

  async saveDistributor(distributor: Distributor): Promise<Distributor> {
    try {
      return await this.distributorRepo.save(distributor);
    } catch (error) {
      throw new Error(
        `Error saving distributor with ID ${distributor.id}: ${error.message}`,
      );
    }
  }

  async updateDistributor(distributor: Distributor): Promise<Distributor> {
    try {
      console.log('Updating distributor:', distributor);
      const existingDistributor = await this.getDistributorById(distributor.id);
      if (!existingDistributor) {
        throw new NotFoundException(
          `Distributor with ID ${distributor.id} not found`,
        );
      }

      Object.assign(existingDistributor, distributor);
      return await this.distributorRepo.save(existingDistributor);
    } catch (error) {
      throw new Error(
        `Error updating distributor with ID ${distributor.id}: ${error.message}`,
      );
    }
  }

  async deleteDistributor(id: string): Promise<void> {
    try {
      const distributor = await this.getDistributorById(id);
      if (!distributor) {
        throw new NotFoundException(`Distributor with ID ${id} not found`);
      }

      await this.distributorRepo.remove(distributor);
    } catch (error) {
      throw new Error(
        `Error deleting distributor with ID ${id}: ${error.message}`,
      );
    }
  }

  async findManyNearbyDistributors(
    clientCep: string,
  ): Promise<DistributorWithDistance[]> {
    try {
      const address = await GetCoordinatesByAddress.executeByCep(clientCep);
      const { latitude, longitude } = address;

      const query = this.distributorRepo
        .createQueryBuilder('distributor')
        .innerJoinAndSelect('distributor.address', 'address')
        .addSelect(
          `6371 * ACOS(
            COS(RADIANS(:latitude)) 
            * COS(RADIANS(address.latitude)) 
            * COS(RADIANS(address.longitude) - RADIANS(:longitude)) 
            + SIN(RADIANS(:latitude)) 
            * SIN(RADIANS(address.latitude))
          )`,
          'distance',
        )
        .where('distributor.is_active = :isActive', { isActive: true }) // Filtra apenas distribuidores ativos
        .setParameters({ latitude, longitude })
        .orderBy('distance', 'ASC');

      const rawResult = await query.getRawAndEntities();

      return rawResult.entities.map((distributor, index) => ({
        ...distributor,
        distance: parseFloat(rawResult.raw[index].distance.toFixed(1)),
      }));
    } catch (error) {
      throw new Error(`Error fetching nearby distributors: ${error.message}`);
    }
  }

  async getDistributorWhereTypeIsStore(): Promise<Distributor[]> {
    try {
      return await this.distributorRepo.find({
        where: { type: 'store', is_active: true },
        relations: ['address'],
      });
    } catch (error) {
      throw new Error(`Error fetching store distributors: ${error.message}`);
    }
  }

  async getDistributorWhereTypeIsPdv(): Promise<Distributor[]> {
    try {
      return await this.distributorRepo.find({
        where: { type: 'pdv', is_active: true },
        relations: ['address'],
      });
    } catch (error) {
      throw new Error(`Error fetching pdv distributors: ${error.message}`);
    }
  }
}
