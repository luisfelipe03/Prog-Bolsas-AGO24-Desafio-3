import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsEnum,
  MaxLength,
  IsNumberString,
} from 'class-validator';

export class CreateStoreDto {
  @ApiProperty({
    description: 'The name of the store.',
    type: String,
    required: true,
    example: 'Store Name',
  })
  @IsString({ message: 'Store name must be a string.' })
  @IsNotEmpty({ message: 'Store name should not be empty.' })
  @MaxLength(100, {
    message: 'Store name should not be longer than 100 characters.',
  })
  storeName: string;

  @ApiProperty({
    description: 'The street address of the store.',
    type: String,
    required: true,
    example: 'Rua do Comércio, 123',
  })
  @IsString({ message: 'Address must be a string.' })
  @IsNotEmpty({ message: 'Address should not be empty.' })
  @MaxLength(200, {
    message: 'Address should not be longer than 200 characters.',
  })
  address: string;

  @ApiProperty({
    description: 'The city where the store is located.',
    type: String,
    required: true,
    example: 'São Paulo',
  })
  @IsString({ message: 'City must be a string.' })
  @IsNotEmpty({ message: 'City should not be empty.' })
  @MaxLength(100, { message: 'City should not be longer than 100 characters.' })
  city: string;

  @ApiProperty({
    description: 'The district where the store is located.',
    type: String,
    required: true,
    example: 'Centro',
  })
  @IsString({ message: 'District must be a string.' })
  @IsNotEmpty({ message: 'District should not be empty.' })
  @MaxLength(100, {
    message: 'District should not be longer than 100 characters.',
  })
  district: string;

  @ApiProperty({
    description: 'The state where the store is located.',
    type: String,
    required: true,
    example: 'SP',
  })
  @IsString({ message: 'State must be a string.' })
  @IsNotEmpty({ message: 'State should not be empty.' })
  @MaxLength(2, { message: 'State must be exactly 2 characters long.' })
  state: string;

  @ApiProperty({
    description: 'The postal code of the store.',
    type: String,
    required: true,
    example: '12345678',
  })
  @MaxLength(8, {
    message: 'Postal code must contain exactly 8 digits.',
  })
  @IsNumberString(
    { no_symbols: true },
    { message: 'Postal code must contain only numbers.' },
  )
  postalCode: string;

  @ApiProperty({
    description: 'The type of the store.',
    type: String,
    required: true,
    example: 'PDV or LOJA',
  })
  @IsEnum(['PDV', 'LOJA'], { message: 'Type must be either PDV or LOJA.' })
  type: 'PDV' | 'LOJA';
}
