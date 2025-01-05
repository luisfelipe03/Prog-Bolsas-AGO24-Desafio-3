import { PartialType } from '@nestjs/mapped-types';
import { CreateCategoryDto } from './create-category.dto';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {
  @ApiProperty({
    description: 'ID da categoria',
    example: 'fd23189c-be35-4ff0-aa77-98aa317b2c7e',
  })
  id: string;
}
