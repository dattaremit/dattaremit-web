"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

interface PersistedStoreConfig<T extends string> {
  storageKey: string;
  defaultValue: T;
  validValues: readonly T[];
}

type Listener = () => void;

export function createPersistedStore<T extends string>(
  config: PersistedStoreConfig<T>,
) {
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

  function useStore() {
    const value = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
    const [isLoaded, setIsLoaded] = useState(loaded);

    useEffect(() => {
      if (!loaded) {
        load();
        setIsLoaded(true);
      }
    }, []);

    return { current: value, isLoaded, set };
  }

  return { useStore, set, load };
}
