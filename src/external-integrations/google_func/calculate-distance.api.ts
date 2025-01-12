import axios from 'axios';
import logger from 'src/config/logger.config';
import { Coordinates } from 'src/stores/types/address.interface';
import { ResponseCalculateDistance } from './google.types';
import { env } from 'src/config/env/env.config';

export async function calculateDistance(
  origin: Coordinates,
  destination: Coordinates,
): Promise<ResponseCalculateDistance> {
  const googleApiKey = env.GOOGLE_API_KEY;
  const url = buildDistanceMatrixUrl(origin, destination, googleApiKey);

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

function buildDistanceMatrixUrl(
  origin: Coordinates,
  destination: Coordinates,
  apiKey: string,
): string {
  const { latitude: originLat, longitude: originLng } = origin;
  const { latitude: destLat, longitude: destLng } = destination;

  return (
    `https://maps.googleapis.com/maps/api/distancematrix/json?` +
    `origins=${originLat},${originLng}` +
    `&destinations=${destLat},${destLng}` +
    `&key=${apiKey}`
  );
}
