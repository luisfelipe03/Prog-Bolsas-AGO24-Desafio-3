import { Injectable } from '@nestjs/common';
import axios from 'axios';
import logger from 'src/config/logger.config';
import { Coordinates } from 'src/stores/types/address.interface';
import {
  ResponseCalculateDistance,
  GeocodingAPIResponse,
} from './google.types';
import { env } from 'src/config/env/env.config';
import { Address, PartialAddress } from 'src/stores/types/address.interface';

@Injectable()
export class GoogleService {
  private readonly distanceMatrixUrl =
    'https://maps.googleapis.com/maps/api/distancematrix/json';
  private readonly geocodeUrl =
    'https://maps.googleapis.com/maps/api/geocode/json';

  /**
   * Calculates the distance between two points using the Google Distance Matrix API.
   * @param origin Origin coordinates.
   * @param destination Destination coordinates.
   * @returns Distance and duration.
   */
  async calculateDistance(
    origin: Coordinates,
    destination: Coordinates,
  ): Promise<ResponseCalculateDistance> {
    const googleApiKey = env.GOOGLE_API_KEY;
    const url = this.buildDistanceMatrixUrl(origin, destination, googleApiKey);

    try {
      const response = await axios.get(url);
      const element = response?.data?.rows?.[0]?.elements?.[0];

      if (!element || element.status !== 'OK') {
        const errorMessage = `Invalid response from Google Distance Matrix API: ${
          element?.status || 'Unknown status'
        }`;
        logger.error(errorMessage, { response: response.data });
        throw new Error(errorMessage);
      }

      const distance = element.distance.value / 1000;
      const duration = element.duration.value / 60;

      return { distance, duration };
    } catch (error) {
      const errorMessage =
        'Error calculating distance from Google Distance Matrix API';
      logger.error(errorMessage, {
        message: error.message || error,
        stack: error.stack,
      });
      throw new Error(errorMessage);
    }
  }

  /**
   * Gets the coordinates (latitude and longitude) of an address using the Google Geocode API.
   * @param address Partial address information.
   * @returns Complete address with latitude and longitude.
   */
  async getCoordinateByAddress(address: PartialAddress): Promise<Address> {
    try {
      const addressString = `${address.address}, ${address.district}, ${address.city}, ${address.state}, ${address.country}`;

      const response = await axios.get<GeocodingAPIResponse>(
        `${this.geocodeUrl}?address=${encodeURIComponent(addressString)}&key=${env.GOOGLE_API_KEY}`,
      );

      if (response.status !== 200 || response.data.status !== 'OK') {
        logger.error(
          `Failed to fetch address. HTTP status: ${response.status}`,
        );
        throw new Error(
          `Failed to fetch address. HTTP status: ${response.status}`,
        );
      }

      const { lat, lng } = response.data.results[0].geometry.location;

      return {
        address: address.address,
        district: address.district,
        city: address.city,
        state: address.state,
        country: address.country,
        postalCode: address.postalCode,
        latitude: `${lat}`,
        longitude: `${lng}`,
      };
    } catch (error) {
      logger.error('Error fetching coordinates by address:', {
        message: error.message || error,
        stack: error.stack,
      });
      throw new Error('Unable to fetch coordinates for the given address');
    }
  }

  /**
   * Constrói a URL para a API Distance Matrix do Google.
   * @param origin Coordenadas de origem.
   * @param destination Coordenadas de destino.
   * @param apiKey Chave da API do Google.
   * @returns URL completa.
   */
  private buildDistanceMatrixUrl(
    origin: Coordinates,
    destination: Coordinates,
    apiKey: string,
  ): string {
    const { latitude: originLat, longitude: originLng } = origin;
    const { latitude: destLat, longitude: destLng } = destination;

    return (
      `${this.distanceMatrixUrl}?` +
      `origins=${originLat},${originLng}` +
      `&destinations=${destLat},${destLng}` +
      `&key=${apiKey}`
    );
  }
}
