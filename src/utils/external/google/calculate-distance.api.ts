import axios from 'axios';
import { env } from 'src/config/env/env.config';
import { Coordinates } from 'src/stores/types/address.interface';

export async function calculateDistance(
  origin: Coordinates,
  destination: Coordinates,
): Promise<number> {
  const googleApiKey = env.GOOGLE_API_KEY;
  const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origin.latitude},${origin.longitude}&destinations=${destination.latitude},${destination.longitude}&key=${googleApiKey}`;

  try {
    const response = await axios.get(url);
    const distanceInMeters = response.data.rows[0].elements[0].distance.value;
    return distanceInMeters / 1000;
  } catch (error) {
    console.error('Error calculating distance:', error.message || error);
    throw new Error('Unable to calculate distance');
  }
}
