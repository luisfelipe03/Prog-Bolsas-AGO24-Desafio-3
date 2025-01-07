import { Module } from '@nestjs/common';
import { DistributorsService } from './distributors.service';
import { DistributorsController } from './distributors.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Distributor } from './entities/distributor.entity';
import { Address } from './entities/address.entity';
import { TypeOrmDistributorRepository } from './repositories/typeORM/type-orm-distributor-repository';

@Module({
  imports: [TypeOrmModule.forFeature([Distributor, Address])],
  controllers: [DistributorsController],
  providers: [DistributorsService, TypeOrmDistributorRepository],
  exports: [DistributorsService],
})
export class DistributorsModule {}
