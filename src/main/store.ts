import Store from 'electron-store';
type StoreType = {
  access_token: string;
  client_id: string;
  client_secret: string;
}

let store: Store<StoreType>

export const getStore = (opts = {}): Store<StoreType> => {
  opts = Object.assign({ defaults: {} }, opts);
  return store || new Store<StoreType>(opts);
};

export const set = (key: string, data: any) => {
  const store = getStore()
  store.set(key, data)
}

export const get = (key: string) => {
  const store = getStore()
  return store.get(key)
}
