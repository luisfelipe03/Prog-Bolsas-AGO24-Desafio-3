import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiProperty({
    description: 'Nome da categoria',
    example: 'Cerveja',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Capa da categoria (opcional)',
    type: 'string',
    format: 'binary',
    required: false,
  })
  @IsOptional()
  cover?: Express.Multer.File;
}
