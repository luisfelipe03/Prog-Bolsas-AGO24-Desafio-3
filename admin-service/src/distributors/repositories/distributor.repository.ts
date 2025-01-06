import { CreateDistributorDto } from '../dto/create-distributor.dto';
import { Distributor } from '../entities/distributor.entity';

export interface DistributorRepository {
  getDistributorById(id: string): Promise<Distributor>;
  getDistributors(): Promise<Distributor[]>;
  createDistributor(distributor: CreateDistributorDto): Promise<Distributor>;
  updateDistributor(distributor: Distributor): Promise<Distributor>;
  deleteDistributor(id: string): Promise<void>;
}
