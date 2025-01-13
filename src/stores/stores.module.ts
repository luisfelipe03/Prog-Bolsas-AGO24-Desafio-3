import { Module } from '@nestjs/common';
import { StoresService } from './services/stores.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Store } from './entities/store.entity';
import { TypeOrmStoreRepository } from './repositories/type-orm/type-orm-store.repository';
import { CorreiosModule } from 'src/external-integrations/correios/correios.module';
import { StoresController } from './controllers/stores.controller';
import { GoogleModule } from 'src/external-integrations/google/google.module';
import { ViacepModule } from 'src/external-integrations/viacep/viacep.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Store]),
    CorreiosModule,
    GoogleModule,
    ViacepModule,
  ],
  controllers: [StoresController],
  providers: [StoresService, TypeOrmStoreRepository],
  exports: [StoresService],
})
export class StoresModule {}
