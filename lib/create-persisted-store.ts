"use client";

import { useEffect, useSyncExternalStore } from "react";

interface PersistedStoreConfig<T extends string> {
  storageKey: string;
  defaultValue: T;
  validValues: readonly T[];
}

type Listener = () => void;

export function createPersistedStore<T extends string>(config: PersistedStoreConfig<T>) {
  const { storageKey, defaultValue, validValues } = config;
  let current: T = defaultValue;
  let loaded = false;
  const listeners = new Set<Listener>();

  function emit() {
    listeners.forEach((l) => l());
  }

  function subscribe(listener: Listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  }

  function getSnapshot() {
    return current;
  }

  function getServerSnapshot() {
    return defaultValue;
  }

  function getLoadedSnapshot() {
    return loaded;
  }

  function getLoadedServerSnapshot() {
    return false;
  }

  function load() {
    if (typeof window === "undefined") return;
    try {
      const stored = window.localStorage.getItem(storageKey);
      if (stored && validValues.includes(stored as T)) {
        current = stored as T;
      }
    } catch {
      // localStorage unavailable — keep default
    }
    loaded = true;
    emit();
  }

  function set(value: T) {
    if (!validValues.includes(value)) return;
    current = value;
    emit();
    try {
      window.localStorage.setItem(storageKey, value);
    } catch {
      // write failed — in-memory state still updated
    }
  }

  function clear() {
    current = defaultValue;
    loaded = false;
    try {
      window.localStorage.removeItem(storageKey);
    } catch {
      // storage unavailable — in-memory state still reset
    }
    emit();
  }

  function useStore() {
    const value = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
    const isLoaded = useSyncExternalStore(subscribe, getLoadedSnapshot, getLoadedServerSnapshot);

    useEffect(() => {
      if (!loaded) load();
    }, []);

    return { current: value, isLoaded, set };
  }

  return { useStore, set, load, clear };
}
