import { Test, TestingModule } from '@nestjs/testing';
import { GoogleService } from './google.service';
import { beforeEach, describe, expect, it, Mock, vi } from 'vitest';
import axios from 'axios';
import logger from 'src/config/logger.config';

vi.mock('axios');
vi.mock('src/config/logger.config');

describe('GoogleService', () => {
  let service: GoogleService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GoogleService],
    }).compile();

    service = module.get<GoogleService>(GoogleService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('calculateDistance', () => {
    const mockOrigin = { latitude: '10.000', longitude: '20.000' };
    const mockDestination = { latitude: '30.000', longitude: '40.000' };

    it('deve calcular a distância e a duração corretamente', async () => {
      const mockResponse = {
        data: {
          rows: [
            {
              elements: [
                {
                  status: 'OK',
                  distance: { value: 12000 }, // 12 km
                  duration: { value: 900 }, // 15 minutos
                },
              ],
            },
          ],
        },
      };

      (axios.get as unknown as Mock).mockResolvedValue(mockResponse);

      const result = await service.calculateDistance(
        mockOrigin,
        mockDestination,
      );

      expect(result).toEqual({
        distance: 12,
        duration: 15,
      });

      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining(
          'https://maps.googleapis.com/maps/api/distancematrix/json',
        ),
      );
    });

    it('deve lançar um erro quando a API retornar status inválido', async () => {
      const mockResponse = {
        data: {
          rows: [
            {
              elements: [{ status: 'NOT_FOUND' }],
            },
          ],
        },
      };

      (axios.get as unknown as Mock).mockResolvedValue(mockResponse);

      await expect(
        service.calculateDistance(mockOrigin, mockDestination),
      ).rejects.toThrow(
        'Error calculating distance from Google Distance Matrix API',
      );

      expect(logger.error).toHaveBeenCalledWith(
        expect.stringContaining(
          'Invalid response from Google Distance Matrix API',
        ),
        expect.any(Object),
      );
    });

    it('deve lançar um erro quando a API falhar', async () => {
      (axios.get as unknown as Mock).mockRejectedValue(
        new Error('Network error'),
      );

      await expect(
        service.calculateDistance(mockOrigin, mockDestination),
      ).rejects.toThrow(
        'Error calculating distance from Google Distance Matrix API',
      );

      expect(logger.error).toHaveBeenCalledWith(
        'Error calculating distance from Google Distance Matrix API',
        expect.any(Object),
      );
    });
  });

  describe('getCoordinateByAddress', () => {
    const mockAddress = {
      address: 'Rua Exemplo',
      district: 'Bairro Exemplo',
      city: 'Cidade Exemplo',
      state: 'Estado Exemplo',
      country: 'País Exemplo',
      postalCode: '12345-678',
    };

    it('deve retornar as coordenadas corretamente', async () => {
      const mockResponse = {
        status: 200,
        data: {
          status: 'OK',
          results: [
            {
              geometry: { location: { lat: -23.55052, lng: -46.633308 } },
            },
          ],
        },
      };

      (axios.get as unknown as Mock).mockResolvedValue(mockResponse);

      const result = await service.getCoordinateByAddress(mockAddress);

      expect(result).toEqual({
        ...mockAddress,
        latitude: '-23.55052',
        longitude: '-46.633308',
      });

      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining(
          'https://maps.googleapis.com/maps/api/geocode/json',
        ),
      );
    });

    it('deve lançar um erro quando a API retornar status inválido', async () => {
      const mockResponse = {
        status: 400,
        data: { status: 'ZERO_RESULTS' },
      };

      (axios.get as unknown as Mock).mockResolvedValue(mockResponse);

      await expect(service.getCoordinateByAddress(mockAddress)).rejects.toThrow(
        'Unable to fetch coordinates for the given address',
      );

      expect(logger.error).toHaveBeenCalledWith(
        'Failed to fetch address. HTTP status: 400',
      );
    });

    it('deve lançar um erro quando a API falhar', async () => {
      (axios.get as unknown as Mock).mockRejectedValue(
        new Error('Network error'),
      );

      await expect(service.getCoordinateByAddress(mockAddress)).rejects.toThrow(
        'Unable to fetch coordinates for the given address',
      );

      expect(logger.error).toHaveBeenCalledWith(
        'Error fetching coordinates by address:',
        expect.any(Object),
      );
    });
  });
});
