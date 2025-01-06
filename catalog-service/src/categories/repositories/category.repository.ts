import { Category } from '../entities/category.entity';

export interface CategoryRepository {
  getCategories(): Promise<Category[]>;
  getCategoryById(id: string): Promise<Category>;
  updateCategory(id: string, name: string): Promise<void>;
  deleteCategory(id: string): Promise<void>;
  save(category: Category): Promise<Category>;
}
