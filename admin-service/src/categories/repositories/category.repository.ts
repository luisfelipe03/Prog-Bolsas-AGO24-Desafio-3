import { CreateCategoryDto } from '../dto/create-category.dto';
import { Category } from '../entities/category.entity';

export interface CategoryRepository {
  createCategory(data: CreateCategoryDto): Promise<void>;
  getCategories(): Promise<Category[]>;
  getCategoryById(id: string): Promise<Category>;
  updateCategory(id: string, name: string): Promise<void>;
  deleteCategory(id: string): Promise<void>;
  save(category: Category): Promise<Category>;
}
