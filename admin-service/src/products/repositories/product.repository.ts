import { CreateProductDto } from '../dto/create-product.dto';
import { Product } from '../entities/product.entity';

export interface ProductRepository {
  createProduct(data: CreateProductDto): Promise<void>;
  deleteProduct(id: string): Promise<void>;
  getProducts(): Promise<Product[]>;
  getProductById(id: string): Promise<Product>;
  updateProduct(id: string, name: string): Promise<void>;
  save(product: Product): Promise<Product>;
}
