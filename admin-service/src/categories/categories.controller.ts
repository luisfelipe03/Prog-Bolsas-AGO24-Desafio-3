import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateCategoryDto } from './dto/create-category.dto';
import { FileUploadException } from '../shared/errors/fileUploadException';
import { CategoryNotFoundException } from './errors/categoryNotFoundException';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoryService: CategoriesService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('cover', {
      limits: { fileSize: 10 * 1024 * 1024 }, // Limite de 10MB
    }),
  )
  async create(
    @Body() createCategoryDto: CreateCategoryDto,
    @UploadedFile() cover?: Express.Multer.File,
  ) {
    const { name } = createCategoryDto;

    if (cover) {
      if (!['image/png', 'image/jpeg'].includes(cover.mimetype)) {
        throw new FileUploadException(
          'Invalid file type. Only PNG and JPEG are allowed.',
        );
      }
      if (cover.size > 10 * 1024 * 1024) {
        throw new FileUploadException('File size exceeds 10MB.');
      }
    }

    return this.categoryService.create({ name, cover });
  }

  @Get()
  findAll() {
    return this.categoryService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const category = await this.categoryService.findOne(id);
    if (!category) {
      throw new CategoryNotFoundException();
    }
    return category;
  }

  @Patch(':id')
  @UseInterceptors(
    FileInterceptor('cover', {
      limits: { fileSize: 10 * 1024 * 1024 }, // Limite de 10MB
    }),
  )
  async update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
    @UploadedFile() cover?: Express.Multer.File,
  ) {
    if (cover) {
      if (!['image/png', 'image/jpeg'].includes(cover.mimetype)) {
        throw new FileUploadException(
          'Invalid file type. Only PNG and JPEG are allowed.',
        );
      }
      if (cover.size > 10 * 1024 * 1024) {
        throw new FileUploadException('File size exceeds 10MB.');
      }
    }

    return this.categoryService.update({ id, cover, ...updateCategoryDto });
  }

  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id') id: string): Promise<void> {
    await this.categoryService.remove(id);
  }
}
