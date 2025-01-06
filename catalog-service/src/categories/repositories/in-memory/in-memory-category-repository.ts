import { Injectable, NotFoundException } from '@nestjs/common';
import { CategoryRepository } from '../category.repository';
import { Category } from 'src/categories/entities/category.entity';

@Injectable()
export class InMemoryCategoryRepository implements CategoryRepository {
  private categories: Category[] = [];

  async deleteCategory(id: string): Promise<void> {
    const index = this.categories.findIndex((category) => category.id === id);
    if (index === -1) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
    this.categories.splice(index, 1);
  }

  async getCategories(): Promise<Category[]> {
    return this.categories;
  }

  async getCategoryById(id: string): Promise<Category> {
    const category = this.categories.find((category) => category.id === id);
    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
    return category;
  }

  async updateCategory(id: string, name: string): Promise<void> {
    const category = await this.getCategoryById(id);
    category.name = name;
  }

  async save(category: Category): Promise<Category> {
    const existingIndex = this.categories.findIndex(
      (existingCategory) => existingCategory.id === category.id,
    );

    if (existingIndex !== -1) {
      this.categories[existingIndex] = category;
    } else {
      this.categories.push(category);
    }

    return category;
  }
}
