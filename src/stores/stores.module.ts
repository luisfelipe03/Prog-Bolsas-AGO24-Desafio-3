import { Module } from '@nestjs/common';
import { StoresService } from './stores.service';
import { StoresController } from './stores.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Store } from './entities/store.entity';
import { TypeOrmStoreRepository } from './repositories/type-orm/type-orm-store.repository';
import { CorreiosModule } from 'src/external-integrations/correios/correios.module';

@Module({
  imports: [TypeOrmModule.forFeature([Store]), CorreiosModule],
  controllers: [StoresController],
  providers: [StoresService, TypeOrmStoreRepository],
  exports: [StoresService],
})
export class StoresModule {}
