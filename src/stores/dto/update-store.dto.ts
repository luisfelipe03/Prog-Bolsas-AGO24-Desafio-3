import { PartialType } from '@nestjs/mapped-types';
import { ApiProperty } from '@nestjs/swagger';
import { CreateStoreDto } from './create-store.dto';

export class UpdateStoreDto extends PartialType(CreateStoreDto) {
  @ApiProperty({
    description: 'The name of the store.',
    type: String,
    required: false,
    example: 'Store Name',
  })
  storeName?: string;

  @ApiProperty({
    description: 'The street address of the store.',
    type: String,
    required: false,
    example: 'Rua do Comércio, 123',
  })
  address?: string;

  @ApiProperty({
    description: 'The city where the store is located.',
    type: String,
    required: false,
    example: 'São Paulo',
  })
  city?: string;

  @ApiProperty({
    description: 'The district where the store is located.',
    type: String,
    required: false,
    example: 'Centro',
  })
  district?: string;

  @ApiProperty({
    description: 'The state where the store is located.',
    type: String,
    required: false,
    example: 'SP',
  })
  state?: string;

  @ApiProperty({
    description: 'The postal code of the store.',
    type: String,
    required: false,
    example: '12345678',
  })
  postalCode?: string;

  @ApiProperty({
    description: 'The type of the store.',
    type: String,
    required: false,
    example: 'PDV or LOJA',
  })
  type?: 'PDV' | 'LOJA';
}
