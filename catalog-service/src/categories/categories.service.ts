import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { Repository } from 'typeorm';
import { AmqpConnection, RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { NoCategoriesFoundException } from './errors/noCategoriesFoundException';
import { CategoryNotFoundException } from './errors/categoryNotFoundException';
import { validate } from 'uuid';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category) private categoryRepo: Repository<Category>,
    private amqpConnection: AmqpConnection,
  ) {}

  async findAll() {
    const categories = await this.categoryRepo.find();
    if (categories.length === 0) {
      throw new NoCategoriesFoundException();
    }
    return categories;
  }

  async findOne(id: string) {
    const category = await this.categoryRepo.findOne({
      where: { id },
    });

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

      const category = new Category();
      category.id = message.id;
      category.name = message.name;
      category.image_url = message.image_url;

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

      const category = await this.categoryRepo.findOne({
        where: { id: message.id },
      });

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

      const category = await this.categoryRepo.findOne({
        where: { id: message.id },
      });

      if (!category) {
        throw new CategoryNotFoundException();
      }

      await this.categoryRepo.remove(category);
    } catch (error) {
      console.error('Erro ao processar a mensagem:', error);
    }
  }
}
