import { Injectable, NotFoundException } from '@nestjs/common';
import { ProductRepository } from '../product.repository';
import { Product } from 'src/products/entities/product.entity';
import { CreateProductDto } from 'src/products/dto/create-product.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class InMemoryProductRepository implements ProductRepository {
  private products: Product[] = [];
  private categories: any[] = [];

  async createProduct(data: CreateProductDto): Promise<void> {
    try {
      const product = new Product();
      product.id = uuidv4();
      product.name = data.name;
      product.description = data.description;
      product.price = data.price;
      product.brand = data.brand;
      product.alcohol_content = data.alcohol_content;
      product.volume = data.volume;
      product.is_active = true;
      product.image_url = data.cover.buffer.toString('base64');

      const category = this.categories.find(
        (cat) => cat.id === data.category_id,
      );
      if (!category) {
        throw new NotFoundException(
          `Category with ID ${data.category_id} not found`,
        );
      }

      product.category = category;

      this.products.push(product);
    } catch (error) {
      throw new Error(`Error creating product: ${error.message}`);
    }
  }

  async deleteProduct(id: string): Promise<void> {
    try {
      const index = this.products.findIndex((product) => product.id === id);
      if (index === -1) {
        throw new NotFoundException(`Product with ID ${id} not found`);
      }
      this.products.splice(index, 1);
    } catch (error) {
      throw new Error(`Error deleting product with ID ${id}: ${error.message}`);
    }
  }

  async getProducts(): Promise<Product[]> {
    try {
      return this.products;
    } catch (error) {
      throw new Error(`Error fetching products: ${error.message}`);
    }
  }

  async getProductById(id: string): Promise<Product> {
    try {
      const product = this.products.find((product) => product.id === id);
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
    } catch (error) {
      throw new Error(`Error updating product with ID ${id}: ${error.message}`);
    }
  }

  async save(product: Product): Promise<Product> {
    try {
      const index = this.products.findIndex(
        (existingProduct) => existingProduct.id === product.id,
      );

      if (index !== -1) {
        this.products[index] = product;
      } else {
        this.products.push(product);
      }

      return product;
    } catch (error) {
      throw new Error(`Error saving product: ${error.message}`);
    }
  }
}
