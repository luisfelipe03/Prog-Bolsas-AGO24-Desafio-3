export class CreateStoreDto {
  storeName: string;
  address: string;
  city: string;
  district: string;
  state: string;
  postalCode: string;
  type: 'PDV' | 'LOJA';
}
