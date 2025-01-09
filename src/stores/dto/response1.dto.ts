import { Store } from '../entities/store.entity';
//TODO: Validar com class-validator
//TODO: Implementar o swagger
export class Response1Dto {
  Stores: Store[];
  limit: number;
  offset: number;
  total: number;
}
