import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsOptional,
  IsUUID,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  brand: string;

  @IsNumber()
  @IsPositive()
  @Transform(({ value }) => parseFloat(value), { toClassOnly: true })
  volume: number;

  @IsNumber()
  @IsPositive()
  @Transform(({ value }) => parseFloat(value), { toClassOnly: true })
  alcohol_content: number;

  @IsOptional()
  cover?: Express.Multer.File;

  @IsNumber()
  @IsPositive()
  @Transform(({ value }) => parseFloat(value), { toClassOnly: true })
  price: number;

  @IsUUID()
  @IsNotEmpty()
  category_id: string;
}
