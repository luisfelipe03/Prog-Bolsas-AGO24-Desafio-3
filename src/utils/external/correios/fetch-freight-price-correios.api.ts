import axios from 'axios';
import { ClientFreightResponse, CorreiosResponse } from './correios.types';
import logger from 'src/config/logger.config';

export async function fetchFreightPriceCorreios(
  cepOrigem: string,
  cepDestino: string,
): Promise<ClientFreightResponse[]> {
  try {
    const response = await axios.post<CorreiosResponse>(
      'https://www.correios.com.br/@@precosEPrazosView',
      {
        cepDestino,
        cepOrigem,
        comprimento: '15',
        largura: '15',
        altura: '15',
      },
    );

    const value = response.data.map((item) => ({
      prazo: item.prazo,
      codProdutoAgencia: item.codProdutoAgencia,
      price: item.precoAgencia,
      description: item.urlTitulo,
    }));

    return value;
  } catch (error) {
    logger.error('Error calculating Correios freight:', error);
    throw new Error('Unable to calculate Correios freight');
  }
}
