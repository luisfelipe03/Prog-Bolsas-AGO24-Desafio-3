import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { CategoriesModule } from 'src/categories/categories.module';
import { TypeOrmProductRepository } from './repositories/typeORM/type-orm-product-repository';
import { InMemoryProductRepository } from './repositories/in-memory/in-memory-product-repository';

@Module({
  imports: [TypeOrmModule.forFeature([Product]), CategoriesModule],
  controllers: [ProductsController],
  providers: [
    ProductsService,
    TypeOrmProductRepository,
    InMemoryProductRepository,
  ],
  exports: [ProductsService],
})
export class ProductsModule {}
