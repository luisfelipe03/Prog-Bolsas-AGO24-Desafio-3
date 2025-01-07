import { Distributor } from '../entities/distributor.entity';

export interface DistributorRepository {
  getDistributorById(id: string): Promise<Distributor>;
  getDistributors(): Promise<Distributor[]>;
  getDistributorWhereTypeIsStore(): Promise<Distributor[]>;
  getDistributorWhereTypeIsPdv(): Promise<Distributor[]>;
  saveDistributor(distributor: Distributor): Promise<Distributor>;
  updateDistributor(distributor: Distributor): Promise<Distributor>;
  deleteDistributor(id: string): Promise<void>;
}
