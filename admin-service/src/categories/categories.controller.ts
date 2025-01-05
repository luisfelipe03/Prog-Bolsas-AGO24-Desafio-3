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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';

@ApiTags('Categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoryService: CategoriesService) {}

  @Post()
  @ApiOperation({ summary: 'Criar uma nova categoria' })
  @ApiResponse({
    status: 201,
    description: 'Categoria criada com sucesso.',
    schema: {
      example: {
        message: 'Categoria criada com sucesso.',
        category: {
          id: '123',
          name: 'Nova Categoria',
          cover: 'cover-image.jpg',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Erro de validação de dados ou arquivo.',
    schema: {
      example: {
        statusCode: 400,
        message: 'Invalid file type. Only PNG and JPEG are allowed.',
        error: 'Bad Request',
      },
    },
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Dados para criar uma categoria',
    type: CreateCategoryDto,
    required: true,
  })
  @UseInterceptors(
    FileInterceptor('cover', {
      limits: { fileSize: 10 * 1024 * 1024 },
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

    const category = await this.categoryService.create({ name, cover });
    return {
      message: 'Categoria criada com sucesso.',
      category,
    };
  }

  @Get()
  @ApiOperation({ summary: 'Obter todas as categorias' })
  @ApiResponse({
    status: 200,
    description: 'Lista de categorias',
    schema: {
      example: [
        { id: '123', name: 'Exemplo Categoria', cover: 'cover1.jpg' },
        { id: '124', name: 'Outra Categoria', cover: 'cover2.jpg' },
      ],
    },
  })
  findAll() {
    return this.categoryService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter uma categoria por ID' })
  @ApiParam({
    name: 'id',
    description: 'ID da categoria',
    example: '123',
  })
  @ApiResponse({
    status: 200,
    description: 'Categoria encontrada',
    schema: {
      example: {
        id: '123',
        name: 'Exemplo Categoria',
        cover: 'cover.jpg',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Categoria não encontrada.',
    schema: {
      example: {
        statusCode: 404,
        message: 'Categoria não encontrada.',
        error: 'Not Found',
      },
    },
  })
  async findOne(@Param('id') id: string) {
    const category = await this.categoryService.findOne(id);
    if (!category) {
      throw new CategoryNotFoundException();
    }
    return category;
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar uma categoria existente' })
  @ApiParam({
    name: 'id',
    description: 'ID da categoria',
    example: '123',
  })
  @ApiResponse({
    status: 200,
    description: 'Categoria atualizada com sucesso.',
    schema: {
      example: {
        message: 'Categoria atualizada com sucesso.',
        category: {
          id: '123',
          name: 'Categoria Atualizada',
          cover: 'new-cover.jpg',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Erro de validação de dados ou arquivo.',
    schema: {
      example: {
        statusCode: 400,
        message: 'File size exceeds 10MB.',
        error: 'Bad Request',
      },
    },
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Dados para atualizar uma categoria',
    type: UpdateCategoryDto,
    required: true,
  })
  @UseInterceptors(
    FileInterceptor('cover', {
      limits: { fileSize: 10 * 1024 * 1024 },
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

    const category = await this.categoryService.update({
      id,
      cover,
      ...updateCategoryDto,
    });
    return {
      message: 'Categoria atualizada com sucesso.',
      category,
    };
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Remover uma categoria' })
  @ApiParam({
    name: 'id',
    description: 'ID da categoria',
    example: '123',
  })
  @ApiResponse({
    status: 204,
    description: 'Categoria removida com sucesso.',
  })
  @ApiResponse({
    status: 404,
    description: 'Categoria não encontrada.',
    schema: {
      example: {
        statusCode: 404,
        message: 'Categoria não encontrada.',
        error: 'Not Found',
      },
    },
  })
  async remove(@Param('id') id: string): Promise<void> {
    await this.categoryService.remove(id);
  }
}
