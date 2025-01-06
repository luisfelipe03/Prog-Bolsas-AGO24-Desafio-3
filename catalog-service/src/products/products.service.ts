import { Injectable, Inject } from '@nestjs/common';
import { Product } from './entities/product.entity';
import { CategoriesService } from '../categories/categories.service';
import { NoProductsNotFoundException } from './errors/noProductNotFoundException';
import { ProductNotFoundException } from './errors/productNotFoundException';
import { AmqpConnection, RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { TypeOrmProductRepository } from './repositories/typeORM/type-orm-product-repository';

@Injectable()
export class ProductsService {
  constructor(
    @Inject() private readonly categoryService: CategoriesService,
    private productRepo: TypeOrmProductRepository,
    private amqpConnection: AmqpConnection,
  ) {}

  async findAll() {
    const products = await this.productRepo.getProducts();
    if (products.length === 0) {
      throw new NoProductsNotFoundException();
    }
    return products;
  }

  async findOne(id: string) {
    const product = await this.productRepo.getProductById(id);

    if (!product) {
      throw new ProductNotFoundException();
    }

    return product;
  }

  @RabbitSubscribe({
    exchange: 'products',
    routingKey: 'product.created',
    queue: 'catalog-product-created',
  })
  async handleProductCreated(message: Product) {
    try {
      const product = Product.create(message);

      await this.productRepo.save(product);
    } catch (error) {
      console.error('Erro ao processar a mensagem:', error);
    }
  }

  @RabbitSubscribe({
    exchange: 'products',
    routingKey: 'product.updated',
    queue: 'catalog-product-updated',
  })
  async handleProductUpdated(message: Product) {
    try {
      const product = await this.productRepo.getProductById(message.id);

      if (!product) {
        throw new ProductNotFoundException();
      }

      Object.assign(product, message);

      await this.productRepo.save(product);
    } catch (error) {
      console.error('Erro ao processar a mensagem:', error);
    }
  }

  @RabbitSubscribe({
    exchange: 'products',
    routingKey: 'product.deleted',
    queue: 'catalog-product-deleted',
  })
  async handleProductDeleted(message: { id: string }) {
    try {
      const product = await this.productRepo.getProductById(message.id);

      if (!product) {
        throw new ProductNotFoundException();
      }

      await this.productRepo.deleteProduct(product.id);
    } catch (error) {
      console.error('Erro ao processar a mensagem:', error);
    }
  }
}
