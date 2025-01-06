import { Injectable } from '@nestjs/common';
import { Category } from './entities/category.entity';
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { NoCategoriesFoundException } from './errors/noCategoriesFoundException';
import { CategoryNotFoundException } from './errors/categoryNotFoundException';
import { validate } from 'uuid';
import { TypeORMCategoryRepository } from './repositories/typeORM/type-orm-category-repository';

@Injectable()
export class CategoriesService {
  constructor(private categoryRepo: TypeORMCategoryRepository) {}

  async findAll() {
    const categories = await this.categoryRepo.getCategories();
    if (categories.length === 0) {
      throw new NoCategoriesFoundException();
    }
    return categories;
  }

  async findOne(id: string) {
    const category = await this.categoryRepo.getCategoryById(id);

    if (!category) {
      throw new CategoryNotFoundException();
    }

    return category;
  }

  @RabbitSubscribe({
    exchange: 'categories',
    routingKey: 'category.created',
    queue: 'catalog-category-created',
  })
  async handleCategoryCreated(message: Category) {
    try {
      if (!validate(message.id)) {
        throw new Error('ID inválido recebido');
      }

      const category = Category.create(message);

      await this.categoryRepo.save(category);
    } catch (error) {
      console.error('Erro ao processar a mensagem:', error);
    }
  }

  @RabbitSubscribe({
    exchange: 'categories',
    routingKey: 'category.updated',
    queue: 'catalog-category-updated',
  })
  async handleCategoryUpdated(message: Category) {
    try {
      if (!validate(message.id)) {
        throw new Error('ID inválido recebido');
      }

      const category = await this.categoryRepo.getCategoryById(message.id);

      if (!category) {
        throw new CategoryNotFoundException();
      }

      if (message.name) category.name = message.name;
      if (message.image_url) category.image_url = message.image_url;

      await this.categoryRepo.save(category);
    } catch (error) {
      console.error('Erro ao processar a mensagem:', error);
    }
  }

  @RabbitSubscribe({
    exchange: 'categories',
    routingKey: 'category.deleted',
    queue: 'catalog-category-deleted',
  })
  async handleCategoryDeleted(message: { id: string }) {
    try {
      if (!validate(message.id)) {
        throw new Error('ID inválido recebido');
      }

      const category = await this.categoryRepo.getCategoryById(message.id);

      if (!category) {
        throw new CategoryNotFoundException();
      }

      await this.categoryRepo.deleteCategory(message.id);
    } catch (error) {
      console.error('Erro ao processar a mensagem:', error);
    }
  }
}
