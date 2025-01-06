import { Module } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CategoriesController } from './categories.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { TypeORMCategoryRepository } from './repositories/typeORM/type-orm-category-repository';

@Module({
  imports: [TypeOrmModule.forFeature([Category])],
  controllers: [CategoriesController],
  providers: [CategoriesService, TypeORMCategoryRepository],
  exports: [CategoriesService],
})
export class CategoriesModule {}
