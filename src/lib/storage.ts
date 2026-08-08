// Safe storage helper that falls back to a no-op on the server (SSR/Worker)
// so any code that reads or writes localStorage does not crash during prerender.

const noopStorage: Storage = {
  get length() { return 0; },
  clear: () => {},
  getItem: () => null,
  key: () => null,
  removeItem: () => {},
  setItem: () => {},
};

function getStorage(): Storage {
  if (typeof window !== 'undefined' && window.localStorage) {
    return window.localStorage;
  }
  return noopStorage;
}

export const safeStorage = {
  getItem: (key: string) => getStorage().getItem(key),
  setItem: (key: string, value: string) => getStorage().setItem(key, value),
  removeItem: (key: string) => getStorage().removeItem(key),
  clear: () => getStorage().clear(),
};
