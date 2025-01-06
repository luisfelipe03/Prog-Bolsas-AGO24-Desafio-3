import { Product } from '../entities/product.entity';

export interface ProductRepository {
  deleteProduct(id: string): Promise<void>;
  getProducts(): Promise<Product[]>;
  getProductById(id: string): Promise<Product>;
  updateProduct(id: string, name: string): Promise<void>;
  save(product: Product): Promise<Product>;
}
