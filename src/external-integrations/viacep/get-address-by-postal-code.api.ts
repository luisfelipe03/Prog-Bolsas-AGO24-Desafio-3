import axios from 'axios';
import { ViaCepResponse } from './viacep.types';
import { PartialAddress } from 'src/stores/types/address.interface';
import logger from 'src/config/logger.config';
import { validatePostalCode } from 'src/common/utils/validations/postal-code-validation.util';
import { PostalCodeInvalidError } from 'src/stores/errors/postal-code-invalid.error';

export const getAdressByPostalCode = async (
  postalCode: string,
): Promise<PartialAddress> => {
  try {
    if (!validatePostalCode(postalCode)) {
      logger.error(`Invalid postal code format: ${postalCode}`);
      throw new Error(
        'Invalid postal code format. It must contain exactly 8 digits.',
      );
    }

    const response = await axios.get<ViaCepResponse>(
      `https://viacep.com.br/ws/${postalCode}/json/`,
    );

    if (response.status !== 200) {
      logger.error(`Failed to fetch address. HTTP status: ${response.status}`);
      throw new Error(
        `Failed to fetch address. HTTP status: ${response.status}`,
      );
    }

    const data = response.data;

    if ('erro' in data) {
      logger.error(`Postal code ${postalCode} not found.`);
      throw new PostalCodeInvalidError(`Postal code ${postalCode} not found.`);
    }

    const partialAddress: PartialAddress = {
      address: data.logradouro,
      district: data.bairro,
      city: data.localidade,
      state: data.uf,
      country: 'Brasil',
      postalCode: data.cep.replace('-', ''),
    };

    return partialAddress;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      logger.error(`Axios error: ${error.message}`);
      throw new Error('Failed to fetch address data from ViaCEP.');
    }

    logger.error(`Error: ${error.message}`);
    throw error;
  }
};
