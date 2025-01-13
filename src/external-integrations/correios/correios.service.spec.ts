import { describe, it, expect, beforeEach, vi, Mock } from 'vitest';
import axios from 'axios';
import { CorreiosService } from './correios.service';
import logger from 'src/config/logger.config';

vi.mock('axios');
vi.mock('src/config/logger.config');

describe('CorreiosService', () => {
  let correiosService: CorreiosService;

  beforeEach(() => {
    correiosService = new CorreiosService();
  });

  describe('fetchFreightPrice', () => {
    const mockCepOrigem = '01001-000';
    const mockCepDestino = '20040-000';

    it('deve retornar os preços do frete quando a API dos Correios responder corretamente', async () => {
      const mockResponse = [
        {
          prazo: '5',
          codProdutoAgencia: '12345',
          precoAgencia: '25.50',
          urlTitulo: 'PAC',
        },
        {
          prazo: '3',
          codProdutoAgencia: '67890',
          precoAgencia: '35.00',
          urlTitulo: 'SEDEX',
        },
      ];

      (axios.post as unknown as Mock).mockResolvedValue({ data: mockResponse });

      const result = await correiosService.fetchFreightPrice(
        mockCepOrigem,
        mockCepDestino,
      );

      expect(result).toEqual([
        {
          prazo: '5',
          codProdutoAgencia: '12345',
          price: '25.50',
          description: 'PAC',
        },
        {
          prazo: '3',
          codProdutoAgencia: '67890',
          price: '35.00',
          description: 'SEDEX',
        },
      ]);

      expect(axios.post).toHaveBeenCalledWith(
        'https://www.correios.com.br/@@precosEPrazosView',
        {
          cepDestino: mockCepDestino,
          cepOrigem: mockCepOrigem,
          comprimento: '15',
          largura: '15',
          altura: '15',
        },
      );
    });

    it('deve registrar um erro e lançar uma exceção quando a API dos Correios falhar', async () => {
      const mockError = new Error('API error');
      (axios.post as unknown as Mock).mockRejectedValue(mockError);

      await expect(
        correiosService.fetchFreightPrice(mockCepOrigem, mockCepDestino),
      ).rejects.toThrow('Unable to calculate Correios freight');

      expect(logger.error).toHaveBeenCalledWith(
        'Error calculating Correios freight:',
        mockError,
      );
    });
  });
});
