import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { FileUploadException } from 'src/shared/errors/fileUploadException';
import { Product } from './entities/product.entity';
import { UpdateProductDto } from './dto/update-product.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProductNotFoundException } from './errors/productNotFoundException';
import { CreateProductDto } from './dto/create-product.dto';

@Controller('products')
export class ProductsController {
  constructor(private readonly productService: ProductsService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('cover', {
      limits: { fileSize: 10 * 1024 * 1024 }, // Limite de 10MB
    }),
  )
  async create(
    @Body() createProductDto: CreateProductDto,
    @UploadedFile() cover?: Express.Multer.File,
  ): Promise<Product> {
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

    return this.productService.create({ ...createProductDto, cover });
  }

  @Get()
  findAll(): Promise<Product[]> {
    return this.productService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Product> {
    const product = await this.productService.findOne(id);
    if (!product) {
      throw new ProductNotFoundException();
    }
    return product;
  }

  @Patch(':id')
  @UseInterceptors(
    FileInterceptor('cover', {
      limits: { fileSize: 10 * 1024 * 1024 }, // Limite de 10MB
    }),
  )
  async update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
    @UploadedFile() cover?: Express.Multer.File,
  ): Promise<Product> {
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

    return await this.productService.update(id, { ...updateProductDto, cover });
  }

  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id') id: string): Promise<void> {
    await this.productService.remove(id);
  }
}
