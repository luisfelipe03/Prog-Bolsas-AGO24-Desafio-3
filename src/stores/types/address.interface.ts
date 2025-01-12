export interface PartialAddress {
  address: string;
  district: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
}

export interface Coordinates {
  latitude: string;
  longitude: string;
}

export interface Address extends PartialAddress, Coordinates {}

export interface PinMaps {
  position: {
    lat: number;
    lng: number;
  };
  title: string;
}
