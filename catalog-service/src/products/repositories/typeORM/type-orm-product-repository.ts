import { InjectRepository } from '@nestjs/typeorm';
import { ProductRepository } from '../product.repository';
import { Product } from 'src/products/entities/product.entity';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';

export class TypeOrmProductRepository implements ProductRepository {
  constructor(
    @InjectRepository(Product) private productRepo: Repository<Product>,
  ) {}

  async deleteProduct(id: string): Promise<void> {
    try {
      const result = await this.productRepo.delete(id);
      if (result.affected === 0) {
        throw new NotFoundException(`Product with ID ${id} not found`);
      }
    } catch (error) {
      throw new Error(`Error deleting product with ID ${id}: ${error.message}`);
    }
  }

  async getProducts(): Promise<Product[]> {
    try {
      return await this.productRepo.find({
        relations: ['category'],
      });
    } catch (error) {
      throw new Error(`Error fetching products: ${error.message}`);
    }
  }

  async getProductById(id: string): Promise<Product> {
    try {
      const product = await this.productRepo.findOne({
        where: { id },
        relations: ['category'],
      });
      if (!product) {
        throw new NotFoundException(`Product with ID ${id} not found`);
      }
      return product;
    } catch (error) {
      throw new Error(`Error fetching product with ID ${id}: ${error.message}`);
    }
  }

  async updateProduct(id: string, name: string): Promise<void> {
    try {
      const product = await this.getProductById(id);
      product.name = name;
      await this.productRepo.save(product);
    } catch (error) {
      throw new Error(`Error updating product with ID ${id}: ${error.message}`);
    }
  }

  async save(product: Product): Promise<Product> {
    try {
      return await this.productRepo.save(product);
    } catch (error) {
      throw new Error(`Error saving product: ${error.message}`);
    }
  }

  async getProductsByCategory(categoryName: string): Promise<Product[]> {
    try {
      return await this.productRepo
        .createQueryBuilder('product')
        .leftJoinAndSelect('product.category', 'category')
        .where('LOWER(category.name) = LOWER(:categoryName)', {
          categoryName: categoryName.toLowerCase(),
        })
        .getMany();
    } catch (error) {
      throw new Error(`Error fetching products by category: ${error.message}`);
    }
  }
}
