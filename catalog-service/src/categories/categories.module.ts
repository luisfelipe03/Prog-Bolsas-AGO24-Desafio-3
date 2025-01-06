import { Module } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CategoriesController } from './categories.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { InMemoryCategoryRepository } from './repositories/in-memory/in-memory-category-repository';
import { TypeORMCategoryRepository } from './repositories/typeORM/type-orm-category-repository';

@Module({
  imports: [TypeOrmModule.forFeature([Category])],
  controllers: [CategoriesController],
  providers: [
    CategoriesService,
    TypeORMCategoryRepository,
    InMemoryCategoryRepository,
  ],
  exports: [CategoriesService],
})
export class CategoriesModule {}
