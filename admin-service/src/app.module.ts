import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { env } from './shared/env';
import { CategoriesModule } from './categories/categories.module';
import { ProductsModule } from './products/products.module';
import { Category } from './categories/entities/category.entity';
import { Product } from './products/entities/product.entity';
import { Distributor } from './distributors/entities/distributor.entity';
import { Address } from './distributors/entities/address.entity';
import { DistributorsModule } from './distributors/distributors.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: env.DB_HOST,
      port: env.DB_PORT,
      username: env.DB_USER,
      password: env.DB_PASS,
      database: env.DB_NAME,
      entities: [Category, Product, Distributor, Address],
      synchronize: true,
    }),
    CategoriesModule,
    ProductsModule,
    DistributorsModule,
  ],
})
export class AppModule {}
