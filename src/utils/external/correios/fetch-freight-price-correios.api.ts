import axios from 'axios';
import { ClientFreightResponse, CorreiosResponse } from './correios.types';

export async function fetchFreightPriceCorreios(
  cepOrigem: string,
  cepDestino: string,
): Promise<ClientFreightResponse> {
  try {
    const response = await axios.post<CorreiosResponse>(
      'https://www.correios.com.br/@@precosEPrazosView',
      {
        cepDestino,
        cepOrigem,
        comprimento: '50',
        largura: '50',
        altura: '50',
      },
    );

    const value = response.data.map((item) => ({
      prazo: item.prazo,
      codProdutoAgencia: item.codProdutoAgencia,
      price: item.precoAgencia,
      description: item.urlTitulo,
    }));

    return { value };
  } catch (error) {
    console.error('Error calculating Correios freight:', error);
    throw new Error('Unable to calculate Correios freight');
  }
}
