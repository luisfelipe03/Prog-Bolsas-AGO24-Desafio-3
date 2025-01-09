import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CategoryRepository } from '../category.repository';
import { Category } from 'src/categories/entities/category.entity';
import { CreateCategoryDto } from 'src/categories/dto/create-category.dto';

@Injectable()
export class TypeORMCategoryRepository implements CategoryRepository {
  constructor(
    @InjectRepository(Category) private categoryRepo: Repository<Category>,
  ) {}

  async save(category: Category): Promise<Category> {
    try {
      return await this.categoryRepo.save(category);
    } catch (error) {
      throw new Error(`Error saving category: ${error.message}`);
    }
  }

  async createCategory(data: CreateCategoryDto): Promise<void> {
    try {
      const category = this.categoryRepo.create(data);
      await this.categoryRepo.save(category);
    } catch (error) {
      throw new Error(`Error creating category: ${error.message}`);
    }
  }

  async deleteCategory(id: string): Promise<void> {
    try {
      const result = await this.categoryRepo.delete(id);
      if (result.affected === 0) {
        throw new NotFoundException(`Category with ID ${id} not found`);
      }
    } catch (error) {
      throw new Error(`Error deleting category: ${error.message}`);
    }
  }

  async getCategories(): Promise<Category[]> {
    try {
      return await this.categoryRepo.find();
    } catch (error) {
      throw new Error(`Error fetching categories: ${error.message}`);
    }
  }

  async getCategoryById(id: string): Promise<Category> {
    try {
      return await this.categoryRepo.findOne({ where: { id } });
    } catch (error) {
      throw new Error(`Error fetching category by ID: ${error.message}`);
    }
  }

  async updateCategory(id: string, name: string): Promise<void> {
    try {
      const category = await this.getCategoryById(id);
      category.name = name;
      await this.categoryRepo.save(category);
    } catch (error) {
      throw new Error(`Error updating category: ${error.message}`);
    }
  }
}
