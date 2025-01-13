import { describe, it, expect, beforeEach, vi, Mock } from 'vitest';
import { ViacepService } from './viacep.service';
import axios, { AxiosError } from 'axios';
import logger from 'src/config/logger.config';
import { PostalCodeInvalidError } from 'src/common/errors/postal-code-invalid.error';

vi.mock('axios');
vi.mock('src/config/logger.config');

describe('ViacepService', () => {
  let viacepService: ViacepService;

  beforeEach(() => {
    viacepService = new ViacepService();
  });

  describe('getAdressByPostalCode', () => {
    const mockPostalCode = '01001000';

    it('deve retornar o endereço parcial quando a API do ViaCEP responder corretamente', async () => {
      const mockResponse = {
        cep: '01001000',
        logradouro: 'Praça da Sé',
        bairro: 'Sé',
        localidade: 'São Paulo',
        uf: 'SP',
      };

      (axios.get as unknown as Mock).mockResolvedValue({
        status: 200,
        data: mockResponse,
      });

      const result = await viacepService.getAdressByPostalCode(mockPostalCode);

      expect(result).toEqual({
        address: 'Praça da Sé',
        district: 'Sé',
        city: 'São Paulo',
        state: 'SP',
        country: 'Brasil',
        postalCode: '01001000',
      });

      expect(axios.get).toHaveBeenCalledWith(
        `https://viacep.com.br/ws/${mockPostalCode}/json/`,
      );
    });

    it('deve lançar um erro de formato de CEP inválido se o formato do CEP estiver incorreto', async () => {
      const invalidPostalCode = '0100-0000';

      await expect(
        viacepService.getAdressByPostalCode(invalidPostalCode),
      ).rejects.toThrowError(
        'Invalid postal code format. It must contain exactly 8 digits.',
      );

      expect(logger.error).toHaveBeenCalledWith(
        'Invalid postal code format: 0100-0000',
      );
    });

    it('deve lançar um erro de CEP não encontrado quando a API retornar erro', async () => {
      const mockResponse = { erro: true };
      (axios.get as unknown as Mock).mockResolvedValue({
        status: 200,
        data: mockResponse,
      });

      await expect(
        viacepService.getAdressByPostalCode(mockPostalCode),
      ).rejects.toThrowError(
        new PostalCodeInvalidError(`Postal code ${mockPostalCode} not found.`),
      );

      expect(logger.error).toHaveBeenCalledWith(
        `Postal code ${mockPostalCode} not found.`,
      );
    });

    it('deve lançar um erro quando ocorrer um erro no axios', async () => {
      const mockError = new AxiosError('Axios error', 'ERR_BAD_REQUEST', {
        url: 'https://viacep.com.br/ws',
        method: 'get',
        headers: undefined,
      });

      (axios.get as unknown as Mock).mockRejectedValue(mockError);

      await expect(
        viacepService.getAdressByPostalCode(mockPostalCode),
      ).rejects.toThrowError(AxiosError);

      expect(logger.error).toHaveBeenCalledWith('Error: ');
    });

    it('deve lançar um erro genérico quando ocorrer outro tipo de erro', async () => {
      const mockError = new Error('Other error');
      (axios.get as unknown as Mock).mockRejectedValue(mockError);

      await expect(
        viacepService.getAdressByPostalCode(mockPostalCode),
      ).rejects.toThrowError('Other error');

      expect(logger.error).toHaveBeenCalledWith('Error: Other error');
    });
  });
});
