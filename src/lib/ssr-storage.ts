// The app was originally a browser-only SPA and reads `localStorage` directly in
// several services. On the server (SSR / prerender) that global does not exist, so
// install a tiny in-memory shim before any of that code runs.
const memory = new Map<string, string>();

const shim: Storage = {
  get length() {
    return memory.size;
  },
  clear: () => memory.clear(),
  getItem: (key: string) => (memory.has(key) ? memory.get(key)! : null),
  key: (index: number) => Array.from(memory.keys())[index] ?? null,
  removeItem: (key: string) => {
    memory.delete(key);
  },
  setItem: (key: string, value: string) => {
    memory.set(key, String(value));
  },
};

const globalScope = globalThis as typeof globalThis & { localStorage?: Storage };

if (typeof globalScope.localStorage === "undefined") {
  try {
    globalScope.localStorage = shim;
  } catch {
    // Read-only global in some runtimes; services fall back to their defaults.
  }
}

export {};
