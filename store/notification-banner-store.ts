"use client";

import { useSyncExternalStore } from "react";

export interface BannerNotification {
  title: string;
  body: string;
  type?: string;
  data?: Record<string, string>;
}

type Listener = () => void;

let currentBanner: BannerNotification | null = null;
let dismissTimer: ReturnType<typeof setTimeout> | null = null;
const listeners = new Set<Listener>();

function emitChange() {
  listeners.forEach((l) => l());
}

function subscribe(listener: Listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return currentBanner;
}

function getServerSnapshot(): BannerNotification | null {
  return null;
}

export function showBanner(notification: BannerNotification) {
  if (dismissTimer) clearTimeout(dismissTimer);
  currentBanner = notification;
  emitChange();

  dismissTimer = setTimeout(() => {
    dismissBanner();
  }, 4000);
}

export function dismissBanner() {
  if (dismissTimer) {
    clearTimeout(dismissTimer);
    dismissTimer = null;
  }
  currentBanner = null;
  emitChange();
}

export function useNotificationBanner() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
