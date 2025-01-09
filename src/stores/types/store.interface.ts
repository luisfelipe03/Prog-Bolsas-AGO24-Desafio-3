export interface IStore {
  storeID: string;
  storeName: string;
  takeOutInStore: boolean;
  shippingTimeInDays: number;
  latitude: string;
  longitude: string;
  address: string;
  city: string;
  district: string;
  state: string;
  country: string;
  postalCode: string;
  type: 'PDV' | 'LOJA';
}

export interface StoreWithDistance extends IStore {
  distance: number;
}
