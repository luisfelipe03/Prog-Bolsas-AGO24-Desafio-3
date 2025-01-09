import { Injectable } from '@nestjs/common';
import { Product } from './entities/product.entity';
import { NoProductsNotFoundException } from './errors/noProductNotFoundException';
import { ProductNotFoundException } from './errors/productNotFoundException';
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { TypeOrmProductRepository } from './repositories/typeORM/type-orm-product-repository';
import logger from 'src/shared/logger';

@Injectable()
export class ProductsService {
  constructor(private productRepo: TypeOrmProductRepository) {}

  async findAll() {
    const products = await this.productRepo.getProducts();
    if (products.length === 0) {
      logger.error('No products found');
      throw new NoProductsNotFoundException();
    }
    return products;
  }

  async findOne(id: string) {
    const product = await this.productRepo.getProductById(id);

    if (!product) {
      logger.error(`Product with ID ${id} not found`);
      throw new ProductNotFoundException();
    }

    return product;
  }

  async findProductsByCategory(categoryName: string) {
    const products = await this.productRepo.getProductsByCategory(categoryName);
    if (products.length === 0) {
      logger.error(`No products found for category ${categoryName}`);
      throw new NoProductsNotFoundException();
    }
    return products;
  }

  @RabbitSubscribe({
    exchange: 'products',
    routingKey: 'product.created',
    queue: 'catalog-product-created',
  })
  async handleProductCreated(message: Product) {
    try {
      logger.info('Message received:', {
        exchange: 'products',
        routingKey: 'product.created',
        message,
      });

      const product = Product.create(message);
      const savedProduct = await this.productRepo.save(product);

      logger.info('Product created:', savedProduct);

      return savedProduct;
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
      logger.info('Message received:', {
        exchange: 'products',
        routingKey: 'product.updated',
        message,
      });

      const product = await this.productRepo.getProductById(message.id);

      if (!product) {
        throw new ProductNotFoundException();
      }

      Object.assign(product, message);

      const updatedProduct = await this.productRepo.save(product);

      logger.info('Product updated:', updatedProduct);

      return updatedProduct;
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
      logger.info('Message received:', {
        exchange: 'products',
        routingKey: 'product.deleted',
        message,
      });

      const product = await this.productRepo.getProductById(message.id);

      if (!product) {
        throw new ProductNotFoundException();
      }

      await this.productRepo.deleteProduct(product.id);

      logger.info('Product deleted:', product);
    } catch (error) {
      console.error('Erro ao processar a mensagem:', error);
    }
  }
}
