// Fix: Provides utility functions for interacting with localStorage, with added support for TTL.

interface CacheItem<T> {
  value: T;
  expiry: number | null;
}

/**
 * Retrieves an item from the browser's localStorage.
 * @param key The key of the item to retrieve.
 * @returns The parsed item, or null if it doesn't exist, is expired, or there's a parsing error.
 */
export function getFromCache<T>(key: string): T | null {
  try {
    const itemStr = window.localStorage.getItem(key);
    if (!itemStr) {
      return null;
    }
    const item: CacheItem<T> = JSON.parse(itemStr);
    if (item.expiry && Date.now() > item.expiry) {
      window.localStorage.removeItem(key);
      return null;
    }
    return item.value;
  } catch (error) {
    console.error(`Error reading from localStorage for key "${key}":`, error);
    return null;
  }
}

/**
 * Stores an item in the browser's localStorage.
 * @param key The key under which to store the item.
 * @param value The value to store.
 * @param ttl Optional. The time-to-live for the cached item in milliseconds.
 */
export function setInCache<T>(key: string, value: T, ttl?: number): void {
  try {
    const expiry = ttl ? Date.now() + ttl : null;
    const item: CacheItem<T> = { value, expiry };
    const serializedItem = JSON.stringify(item);
    window.localStorage.setItem(key, serializedItem);
  } catch (error) {
    console.error(`Error writing to localStorage for key "${key}":`, error);
  }
}
