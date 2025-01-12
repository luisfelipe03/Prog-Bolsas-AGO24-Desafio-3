import { Module } from '@nestjs/common';
import { StoresModule } from './stores/stores.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { env } from './config/env/env.config';
import { Store } from './stores/entities/store.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: env.DB_HOST,
      port: env.DB_PORT,
      username: env.DB_USER,
      password: env.DB_PASS,
      database: env.DB_NAME,
      entities: [Store],
      synchronize: true,
    }),
    StoresModule,
  ],
})
export class AppModule {}
