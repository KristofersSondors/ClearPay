import { Platform } from "react-native";
import NativeAsyncStorage from "@react-native-async-storage/async-storage";

const memoryStorage = new Map();

function getWebStorage() {
  if (typeof window === "undefined" || !window.localStorage) {
    return null;
  }

  return window.localStorage;
}

async function getItem(key) {
  if (Platform.OS !== "web") {
    try {
      return await NativeAsyncStorage.getItem(key);
    } catch {
      // Native module unavailable — fall back to in-memory storage.
      return memoryStorage.has(key) ? memoryStorage.get(key) : null;
    }
  }

  try {
    const storage = getWebStorage();
    if (storage) {
      return storage.getItem(key);
    }
  } catch {
    // Fallback to in-memory storage when localStorage is unavailable.
  }

  return memoryStorage.has(key) ? memoryStorage.get(key) : null;
}

async function setItem(key, value) {
  if (Platform.OS !== "web") {
    try {
      return await NativeAsyncStorage.setItem(key, value);
    } catch {
      // Native module unavailable — fall back to in-memory storage.
      memoryStorage.set(key, value);
      return;
    }
  }

  try {
    const storage = getWebStorage();
    if (storage) {
      storage.setItem(key, value);
      return;
    }
  } catch {
    // Fallback to in-memory storage when localStorage is unavailable.
  }

  memoryStorage.set(key, value);
}

async function removeItem(key) {
  if (Platform.OS !== "web") {
    try {
      return await NativeAsyncStorage.removeItem(key);
    } catch {
      // Native module unavailable — fall back to in-memory storage.
      memoryStorage.delete(key);
      return;
    }
  }

  try {
    const storage = getWebStorage();
    if (storage) {
      storage.removeItem(key);
      return;
    }
  } catch {
    // Fallback to in-memory storage when localStorage is unavailable.
  }

  memoryStorage.delete(key);
}

async function clear() {
  if (Platform.OS !== "web") {
    try {
      return await NativeAsyncStorage.clear();
    } catch {
      // Native module unavailable — fall back to in-memory storage.
      memoryStorage.clear();
      return;
    }
  }

  try {
    const storage = getWebStorage();
    if (storage) {
      storage.clear();
      return;
    }
  } catch {
    // Fallback to in-memory storage when localStorage is unavailable.
  }

  memoryStorage.clear();
}

const asyncStorage = {
  getItem,
  setItem,
  removeItem,
  clear,
};

export default asyncStorage;
