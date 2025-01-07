import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { DistributorsService } from 'src/distributors/distributors.service';
import { env } from 'src/shared/env';
import { GetCoordinatesByAddress } from 'src/shared/external/googleGeoconding';

export interface Address {
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
  zip: string;
}

export interface Store {
  name: string;
  phone: string;
  type: string;
  address: Address;
}

export interface FreightMethod {
  storeOrigem: Store;
  prazo: string;
  preco?: number;
  distancia?: string;
  valores?: CorreiosResponse;
}

export interface CorreiosResponse {
  sedex: { prazo: string; url: string; precoAgencia: string };
  pac: { prazo: string; url: string; precoAgencia: string };
}

@Injectable()
export class FreightCalculatorService {
  constructor(private readonly distributorService: DistributorsService) {}

  async calculateFreight(clientCep: string) {
    const deliveryMethods: Record<string, Partial<FreightMethod>> = {};
    const { store, pdv } =
      await this.distributorService.findNearestStoreAndPdvByClientCep(
        clientCep,
      );
    const clientAddress = await GetCoordinatesByAddress.executeByCep(clientCep);

    const distances = {
      store: await this.calculateDistance(clientAddress, store.address),
      pdv: await this.calculateDistance(clientAddress, pdv.address),
    };

    const nearestDistributor =
      distances.pdv < distances.store
        ? { distributor: pdv, distance: distances.pdv }
        : { distributor: store, distance: distances.store };

    deliveryMethods.retirada = this.createRetiradaMethod(
      nearestDistributor.distributor,
      nearestDistributor.distance,
    );

    if (nearestDistributor.distance <= 50) {
      deliveryMethods.motoboy = this.createMotoboyMethod(
        nearestDistributor.distributor,
        nearestDistributor.distance,
      );
    }

    deliveryMethods.correios = {
      valores: await this.getCorreiosFreight(store.address.zip, clientCep),
      storeOrigem: store,
    };

    return deliveryMethods;
  }

  private async calculateDistance(
    clientAddress: any,
    distributorAddress: any,
  ): Promise<number> {
    const googleApiKey = env.GOOGLE_API_KEY;
    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${clientAddress.latitude},${clientAddress.longitude}&destinations=${distributorAddress.latitude},${distributorAddress.longitude}&key=${googleApiKey}`;

    try {
      const response = await axios.get(url);
      const distanceInMeters = response.data.rows[0].elements[0].distance.value;
      return distanceInMeters / 1000;
    } catch (error) {
      console.error('Error calculating distance:', error);
      throw new Error('Unable to calculate distance');
    }
  }

  private async getCorreiosFreight(
    cepOrigem: string,
    cepDestino: string,
  ): Promise<CorreiosResponse> {
    try {
      const response = await axios.post(
        'https://www.correios.com.br/@@precosEPrazosView',
        {
          cepDestino,
          cepOrigem,
          comprimento: '50',
          largura: '50',
          altura: '50',
        },
      );
      const [sedex, pac] = response.data;

      return {
        sedex: {
          prazo: sedex.prazo,
          url: sedex.url,
          precoAgencia: sedex.precoAgencia,
        },
        pac: { prazo: pac.prazo, url: pac.url, precoAgencia: pac.precoAgencia },
      };
    } catch (error) {
      console.error('Error calculating Correios freight:', error);
      throw new Error('Unable to calculate Correios freight');
    }
  }

  private createRetiradaMethod(
    distributor: Store,
    distance: number,
  ): FreightMethod {
    return {
      storeOrigem: distributor,
      prazo: 'Imediato',
      distancia: `${distance.toFixed(2)} km`,
    };
  }

  private createMotoboyMethod(
    distributor: Store,
    distance: number,
  ): FreightMethod {
    return {
      storeOrigem: distributor,
      prazo: this.calculateMotoboyTime(distance),
      preco: 15,
      distancia: `${distance.toFixed(2)} km`,
    };
  }

  private calculateMotoboyTime(distance: number): string {
    if (distance <= 15) return '30 minutos';
    if (distance <= 30) return '1 hora';
    if (distance <= 50) return '2 horas';
    return 'Indisponível';
  }
}
