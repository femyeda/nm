import Store from 'electron-store';

let store: Store

const getStore = (opts = {}) => {
  opts = Object.assign({ defaults: {} }, opts);
  return store || new Store(opts);
};

export const set = (key: string, data: any) => {
  const store = getStore()
  store.set(key, data)
}

export const get = (key: string) => {
  const store = getStore()
  return store.get(key)
}
