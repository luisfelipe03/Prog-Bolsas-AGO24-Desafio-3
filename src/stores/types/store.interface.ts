export interface BaseStore {
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

export interface IStore extends BaseStore {
  storeID: string;
}

export interface StoreWithDistance extends IStore {
  distance: number;
}
