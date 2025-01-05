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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productService: ProductsService) {}

  @Post()
  @ApiOperation({ summary: 'Criar um novo produto' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Dados para criar um produto',
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'Cerveja Premium' },
        description: {
          type: 'string',
          example: 'Uma cerveja premium com sabor único.',
        },
        brand: { type: 'string', example: 'Cervejaria XPTO' },
        volume: { type: 'number', example: 500 },
        alcohol_content: { type: 'number', example: 5.5 },
        cover: {
          type: 'string',
          format: 'binary',
          description: 'Imagem de capa do produto (PNG ou JPEG, máx. 10MB)',
        },
        price: { type: 'number', example: 12.99 },
        category_id: { type: 'string', format: 'uuid', example: 'cat456' },
      },
      required: [
        'name',
        'description',
        'brand',
        'volume',
        'alcohol_content',
        'price',
        'category_id',
      ],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Produto criado com sucesso.',
    schema: {
      example: {
        id: 'abc123',
        name: 'Cerveja Premium',
        description: 'Uma cerveja premium com sabor único.',
        brand: 'Cervejaria XPTO',
        volume: 500,
        alcohol_content: 5.5,
        cover: 'beer-cover.jpg',
        price: 12.99,
        category_id: 'cat456',
      },
    },
  })
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
  @ApiOperation({ summary: 'Listar todos os produtos' })
  @ApiResponse({
    status: 200,
    description: 'Lista de produtos.',
    schema: {
      example: [
        {
          id: 'abc123',
          name: 'Cerveja Premium',
          description: 'Uma cerveja premium com sabor único.',
          brand: 'Cervejaria XPTO',
          volume: 500,
          alcohol_content: 5.5,
          cover: 'beer-cover.jpg',
          price: 12.99,
          category_id: 'cat456',
        },
        {
          id: 'abc124',
          name: 'Vinho Tinto',
          description: 'Vinho tinto seco de alta qualidade.',
          brand: 'Vinícola XYZ',
          volume: 750,
          alcohol_content: 13,
          cover: 'wine-cover.jpg',
          price: 89.99,
          category_id: 'cat789',
        },
      ],
    },
  })
  findAll(): Promise<Product[]> {
    return this.productService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter um produto por ID' })
  @ApiParam({
    name: 'id',
    description: 'ID do produto',
    example: 'abc123',
  })
  @ApiResponse({
    status: 200,
    description: 'Produto encontrado.',
    schema: {
      example: {
        id: 'abc123',
        name: 'Cerveja Premium',
        description: 'Uma cerveja premium com sabor único.',
        brand: 'Cervejaria XPTO',
        volume: 500,
        alcohol_content: 5.5,
        cover: 'beer-cover.jpg',
        price: 12.99,
        category_id: 'cat456',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Produto não encontrado.',
    schema: {
      example: {
        statusCode: 404,
        message: 'Produto não encontrado.',
        error: 'Not Found',
      },
    },
  })
  async findOne(@Param('id') id: string): Promise<Product> {
    const product = await this.productService.findOne(id);
    if (!product) {
      throw new ProductNotFoundException();
    }
    return product;
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar um produto existente' })
  @ApiConsumes('multipart/form-data')
  @ApiParam({
    name: 'id',
    description: 'ID do produto',
    example: 'abc123',
  })
  @ApiBody({
    description: 'Dados para atualizar um produto (campos opcionais)',
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'Cerveja Premium Light' },
        description: {
          type: 'string',
          example: 'Uma versão light da cerveja premium.',
        },
        brand: { type: 'string', example: 'Cervejaria XPTO' },
        volume: { type: 'number', example: 450 },
        alcohol_content: { type: 'number', example: 4.5 },
        cover: {
          type: 'string',
          format: 'binary',
          description:
            'Nova imagem de capa do produto (PNG ou JPEG, máx. 10MB)',
        },
        price: { type: 'number', example: 10.99 },
        category_id: { type: 'string', format: 'uuid', example: 'cat456' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Produto atualizado com sucesso.',
    schema: {
      example: {
        id: 'abc123',
        name: 'Cerveja Premium Light',
        description: 'Versão light da nossa cerveja premium.',
        brand: 'Cervejaria XPTO',
        volume: 450,
        alcohol_content: 4.5,
        cover: 'new-beer-cover.jpg',
        price: 10.99,
        category_id: 'cat456',
      },
    },
  })
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
  @ApiOperation({ summary: 'Remover um produto' })
  @ApiParam({
    name: 'id',
    description: 'ID do produto',
    example: 'abc123',
  })
  @ApiResponse({
    status: 204,
    description: 'Produto removido com sucesso.',
  })
  @ApiResponse({
    status: 404,
    description: 'Produto não encontrado.',
  })
  async remove(@Param('id') id: string): Promise<void> {
    await this.productService.remove(id);
  }
}
