import { InjectRepository } from '@nestjs/typeorm';
import { Distributor } from 'src/distributors/entities/distributor.entity';
import { Repository } from 'typeorm';
import { CreateDistributorDto } from 'src/distributors/dto/create-distributor.dto';
import { NotFoundException } from '@nestjs/common';
import { DistributorRepository } from '../distributor.repository';

export class TypeOrmDistributorRepository implements DistributorRepository {
  constructor(
    @InjectRepository(Distributor)
    private readonly distributorRepo: Repository<Distributor>,
  ) {}

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

  async getDistributors(): Promise<Distributor[]> {
    try {
      return await this.distributorRepo.find({ relations: ['address'] });
    } catch (error) {
      throw new Error(`Error fetching distributors: ${error.message}`);
    }
  }

  async createDistributor(
    distributorDto: CreateDistributorDto,
  ): Promise<Distributor> {
    try {
      const distributor = this.distributorRepo.create(distributorDto);
      return await this.distributorRepo.save(distributor);
    } catch (error) {
      throw new Error(`Error creating distributor: ${error.message}`);
    }
  }

  async updateDistributor(distributor: Distributor): Promise<Distributor> {
    try {
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
}
