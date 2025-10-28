// Fix: Provides utility functions for interacting with localStorage.

/**
 * Retrieves an item from the browser's localStorage.
 * @param key The key of the item to retrieve.
 * @returns The parsed item, or null if it doesn't exist or there's a parsing error.
 */
export function getFromCache<T>(key: string): T | null {
  try {
    const item = window.localStorage.getItem(key);
    return item ? (JSON.parse(item) as T) : null;
  } catch (error) {
    console.error(`Error reading from localStorage for key "${key}":`, error);
    return null;
  }
}

/**
 * Stores an item in the browser's localStorage.
 * @param key The key under which to store the item.
 * @param value The value to store. It will be JSON stringified.
 */
export function setInCache<T>(key: string, value: T): void {
  try {
    const serializedValue = JSON.stringify(value);
    window.localStorage.setItem(key, serializedValue);
  } catch (error) {
    console.error(`Error writing to localStorage for key "${key}":`, error);
  }
}
