import { Injectable, Inject } from '@nestjs/common';
import { Product } from './entities/product.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CategoriesService } from '../categories/categories.service';
import { NoProductsNotFoundException } from './errors/noProductNotFoundException';
import { ProductNotFoundException } from './errors/productNotFoundException';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product) private productRepo: Repository<Product>,
    @Inject() private readonly categoryService: CategoriesService,
    private amqpConnection: AmqpConnection,
  ) {}

  async findAll() {
    const products = await this.productRepo.find({
      relations: ['category'],
    });
    if (products.length === 0) {
      throw new NoProductsNotFoundException();
    }
    return products;
  }

  async findOne(id: string) {
    const product = await this.productRepo.findOne({
      where: { id },
      relations: ['category'],
    });

    if (!product) {
      throw new ProductNotFoundException();
    }

    return product;
  }
}
