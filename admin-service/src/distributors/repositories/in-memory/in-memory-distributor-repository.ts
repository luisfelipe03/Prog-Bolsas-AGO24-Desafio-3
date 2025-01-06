import { Injectable } from '@nestjs/common';
import { DistributorRepository } from '../distributor.repository';
import { Distributor } from 'src/distributors/entities/distributor.entity';
import { CreateDistributorDto } from 'src/distributors/dto/create-distributor.dto';

@Injectable()
export class InMemoryDistributorRepository implements DistributorRepository {
  private distributors: Distributor[] = [];

  getDistributorById(id: string): Promise<Distributor> {
    throw new Error('Method not implemented.');
  }
  getDistributors(): Promise<Distributor[]> {
    throw new Error('Method not implemented.');
  }
  createDistributor(distributor: CreateDistributorDto): Promise<Distributor> {
    throw new Error('Method not implemented.');
  }
  updateDistributor(distributor: Distributor): Promise<Distributor> {
    throw new Error('Method not implemented.');
  }
  deleteDistributor(id: string): Promise<void> {
    throw new Error('Method not implemented.');
  }
}
