import { load, Store } from "@tauri-apps/plugin-store";

// Lazy-loaded store instance
let storePromise: Promise<Store> | null = null;

async function getStore(): Promise<Store> {
  if (!storePromise) {
    storePromise = load(".auth.dat", { autoSave: true, defaults: {} });
  }
  return storePromise;
}

export const secureStorage = {
  async get(key: string): Promise<string | null> {
    const store = await getStore();
    const value = await store.get<string>(key);
    return value ?? null;
  },

  async set(key: string, value: string): Promise<void> {
    const store = await getStore();
    await store.set(key, value);
    await store.save();
  },

  async delete(key: string): Promise<void> {
    const store = await getStore();
    await store.delete(key);
    await store.save();
  },
};
