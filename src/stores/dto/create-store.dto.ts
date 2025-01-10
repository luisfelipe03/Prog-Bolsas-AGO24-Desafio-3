import { IsString, IsNotEmpty, IsEnum, MaxLength } from 'class-validator';

export class CreateStoreDto {
  @IsString({ message: 'Store name must be a string.' })
  @IsNotEmpty({ message: 'Store name should not be empty.' })
  @MaxLength(100, {
    message: 'Store name should not be longer than 100 characters.',
  })
  storeName: string;

  @IsString({ message: 'Address must be a string.' })
  @IsNotEmpty({ message: 'Address should not be empty.' })
  @MaxLength(200, {
    message: 'Address should not be longer than 200 characters.',
  })
  address: string;

  @IsString({ message: 'City must be a string.' })
  @IsNotEmpty({ message: 'City should not be empty.' })
  @MaxLength(100, { message: 'City should not be longer than 100 characters.' })
  city: string;

  @IsString({ message: 'District must be a string.' })
  @IsNotEmpty({ message: 'District should not be empty.' })
  @MaxLength(100, {
    message: 'District should not be longer than 100 characters.',
  })
  district: string;

  @IsString({ message: 'State must be a string.' })
  @IsNotEmpty({ message: 'State should not be empty.' })
  @MaxLength(2, { message: 'State must be exactly 2 characters long.' })
  state: string;

  @MaxLength(8, {
    message: 'Postal code must contain exactly 8 digits.',
  })
  postalCode: string;

  @IsEnum(['PDV', 'LOJA'], { message: 'Type must be either PDV or LOJA.' })
  type: 'PDV' | 'LOJA';
}
