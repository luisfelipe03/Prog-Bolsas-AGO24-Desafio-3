import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { env } from './shared/env';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: env.DB_HOST,
      port: env.DB_PORT,
      username: env.DB_USER,
      password: env.DB_PASS,
      database: env.DB_NAME,
      ssl: {
        rejectUnauthorized: false,
      },
      entities: [],
      synchronize: true,
    }),
  ],
})
export class AppModule {}
