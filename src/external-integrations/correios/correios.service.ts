import { Injectable } from '@nestjs/common';
import axios from 'axios';
import {
  ClientFreightResponse,
  CorreiosResponse,
} from '../correios/correios.types';
import logger from 'src/config/logger.config';

@Injectable()
export class CorreiosService {
  private readonly correiosUrl =
    'https://www.correios.com.br/@@precosEPrazosView';

  /**
   * Fetches the freight price from Correios API.
   * @param cepOrigem Origin postal code.
   * @param cepDestino Destination postal code.
   * @returns Freight prices.
   * @throws Error if it's unable to calculate the freight.
   * @throws Error if the API response is invalid.
   */
  async fetchFreightPrice(
    cepOrigem: string,
    cepDestino: string,
  ): Promise<ClientFreightResponse[]> {
    try {
      const response = await axios.post<CorreiosResponse>(this.correiosUrl, {
        cepDestino,
        cepOrigem,
        comprimento: '15', // hardcoded values, because the real values are not provided
        largura: '15',
        altura: '15',
      });

      const freightPrices = response.data.map((item) => ({
        prazo: item.prazo,
        codProdutoAgencia: item.codProdutoAgencia,
        price: item.precoAgencia,
        description: item.urlTitulo,
      }));

      return freightPrices;
    } catch (error) {
      logger.error('Error calculating Correios freight:', error);
      throw new Error('Unable to calculate Correios freight');
    }
  }
}
