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
  @Transform(({ value }) => parseFloat(value), { toClassOnly: true }) // Garante que seja tratado como número
  volume: number;

  @IsNumber()
  @IsPositive()
  @Transform(({ value }) => parseFloat(value), { toClassOnly: true }) // Garante que seja tratado como número
  alcohol_content: number;

  @IsOptional()
  cover?: Express.Multer.File;

  @IsNumber()
  @IsPositive()
  @Transform(({ value }) => parseFloat(value), { toClassOnly: true }) // Garante que seja tratado como número
  price: number;

  @IsUUID()
  @IsNotEmpty()
  category_id: string;
}
