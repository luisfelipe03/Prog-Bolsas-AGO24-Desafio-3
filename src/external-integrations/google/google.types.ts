export interface GeocodingAPIResponse {
  results: {
    formatted_address: string;
    geometry: {
      location: {
        lat: number;
        lng: number;
      };
    };
  }[];
  status: string;
}

export interface ResponseCalculateDistance {
  distance: number;
  duration: number;
}
