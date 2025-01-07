import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { env } from '../env';

export type GetCoordinatesByAddressInput = {
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
  zip: string;
};

export type GetCoordinatesByAddressOutput = {
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
  zip: string;
  latitude: number;
  longitude: number;
};

@Injectable()
export class GetCoordinatesByAddress {
  static async execute(
    input: GetCoordinatesByAddressInput,
  ): Promise<GetCoordinatesByAddressOutput> {
    const address = `${input.street}+${input.number}+${input.neighborhood}+${input.city}+${input.state}+${input.zip}`;
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=${env.GOOGLE_API_KEY}`,
    );

    const { lat, lng } = response.data.results[0].geometry.location;

    const addressComponents = response.data.results[0].address_components;

    let street = '';
    let number = '';
    let neighborhood = '';
    let city = '';
    let state = '';
    let zip = '';

    addressComponents.forEach((component) => {
      const types = component.types;

      if (types.includes('route')) {
        street = component.long_name;
      }
      if (types.includes('street_number')) {
        number = component.long_name;
      }
      if (types.includes('sublocality_level_1')) {
        neighborhood = component.long_name;
      }
      if (types.includes('administrative_area_level_2')) {
        city = component.long_name;
      }
      if (types.includes('administrative_area_level_1')) {
        state = component.short_name;
      }
      if (types.includes('postal_code')) {
        zip = component.long_name.replace('-', '');
      }
    });

    return {
      street,
      number,
      neighborhood,
      city,
      state,
      zip,
      latitude: lat,
      longitude: lng,
    };
  }

  static async executeByCep(
    cep: string,
  ): Promise<GetCoordinatesByAddressOutput> {
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${cep}&key=${env.GOOGLE_API_KEY}`,
    );

    if (response.data.status === 'ZERO_RESULTS') {
      throw new Error('Address not found');
    }

    const { lat, lng } = response.data.results[0].geometry.location;

    const addressComponents = response.data.results[0].address_components;

    let street = '';
    let number = '';
    let neighborhood = '';
    let city = '';
    let state = '';
    let zip = '';

    addressComponents.forEach((component) => {
      const types = component.types;

      if (types.includes('route')) {
        street = component.long_name;
      }
      if (types.includes('street_number')) {
        number = component.long_name;
      }
      if (types.includes('sublocality_level_1')) {
        neighborhood = component.long_name;
      }
      if (types.includes('administrative_area_level_2')) {
        city = component.long_name;
      }
      if (types.includes('administrative_area_level_1')) {
        state = component.short_name;
      }
      if (types.includes('postal_code')) {
        zip = component.long_name.replace('-', '');
      }
    });

    return {
      street,
      number,
      neighborhood,
      city,
      state,
      zip,
      latitude: lat,
      longitude: lng,
    };
  }
}
