import { Store } from './store.entity';
import { CreateStoreDto } from '../dto/create-store.dto';
import { Address } from '../types/address.interface';
import { describe, it, expect } from 'vitest';

describe('Store Entity', () => {
  const validStoreDto: CreateStoreDto = {
    storeName: 'Test Store',
    type: 'PDV',
    postalCode: '12345-678',
    address: 'Av. Paulista, 1000',
    city: 'São Paulo',
    district: 'Bela Vista',
    state: 'SP',
  };

  const validAddress: Address = {
    latitude: '-23.550520',
    longitude: '-46.633308',
    address: 'Av. Paulista, 1000',
    city: 'São Paulo',
    district: 'Bela Vista',
    state: 'SP',
    country: 'Brasil',
    postalCode: '12345-678',
  };

  it('should create a Store instance with valid data', () => {
    const store = Store.create(validStoreDto, validAddress);

    expect(store).toBeInstanceOf(Store);
    expect(store.storeName).toBe(validStoreDto.storeName);
    expect(store.type).toBe(validStoreDto.type);
    expect(store.latitude).toBe(validAddress.latitude);
    expect(store.longitude).toBe(validAddress.longitude);
    expect(store.address).toBe(validAddress.address);
  });

  it('should throw an error if storeName is empty', () => {
    const invalidStoreDto = { ...validStoreDto, storeName: '' };

    expect(() => Store.create(invalidStoreDto, validAddress)).toThrowError(
      'storeName is required and cannot be empty',
    );
  });

  it('should throw an error if type is invalid', () => {
    const invalidStoreDto = { ...validStoreDto, type: 'INVALID' as any };

    expect(() => Store.create(invalidStoreDto, validAddress)).toThrowError(
      'type must be either "PDV" or "LOJA"',
    );
  });

  it('should throw an error if latitude or longitude is missing', () => {
    const invalidAddress = { ...validAddress, latitude: '' };

    expect(() => Store.create(validStoreDto, invalidAddress)).toThrowError(
      'latitude and longitude are required',
    );
  });

  it('should throw an error if postalCode is missing', () => {
    const invalidStoreDto = { ...validStoreDto, postalCode: '' };

    expect(() => Store.create(invalidStoreDto, validAddress)).toThrowError(
      'postalCode is required',
    );
  });
});
