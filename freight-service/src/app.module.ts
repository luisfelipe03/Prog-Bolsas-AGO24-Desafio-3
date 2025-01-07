import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { env } from './shared/env';
import { Distributor } from './distributors/entities/distributor.entity';
import { Address } from './distributors/entities/address.entity';
import { DistributorsModule } from './distributors/distributors.module';
import { RabbitmqModule } from './rabbitmq/rabbitmq.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: env.DB_HOST,
      port: env.DB_PORT,
      username: env.DB_USER,
      password: env.DB_PASS,
      database: env.DB_NAME,
      entities: [Distributor, Address],
      synchronize: true,
    }),
    DistributorsModule,
    RabbitmqModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
