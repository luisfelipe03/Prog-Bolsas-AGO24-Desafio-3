import axios from 'axios';
import { env } from 'src/config/env/env.config';
import { Address, PartialAddress } from 'src/stores/types/address.interface';
import { GeocodingAPIResponse } from './google.types';
import logger from 'src/config/logger.config';

export const getCoordinateByAddress = async (
  address: PartialAddress,
): Promise<Address> => {
  try {
    const addressString = `${address.address}, ${address.district}, ${address.city}, ${address.state}, ${address.country}`;

    const response = await axios.get<GeocodingAPIResponse>(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${addressString}&key=${env.GOOGLE_API_KEY}`,
    );

    if (response.status !== 200) {
      logger.error(`Failed to fetch address. HTTP status: ${response.status}`);
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
    console.error('Error:', error.message);
    throw error;
  }
};
