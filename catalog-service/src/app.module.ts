import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from './categories/entities/category.entity';
import { env } from './shared/env';
import { RabbitmqModule } from './rabbitmq/rabbitmq.module';
import { Product } from './products/entities/product.entity';
import { ProductsModule } from './products/products.module';
import { CategoriesModule } from './categories/categories.module';
@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: env.DB_HOST,
      port: env.DB_PORT,
      username: env.DB_USER,
      password: env.DB_PASS,
      database: env.DB_NAME,
      entities: [Category, Product],
      synchronize: true,
      logger: 'advanced-console',
    }),
    CategoriesModule,
    ProductsModule,
    RabbitmqModule,
  ],
})
export class AppModule {}
