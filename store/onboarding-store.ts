"use client";

import { useCallback, useEffect, useMemo, useSyncExternalStore } from "react";
import { STORAGE_KEYS } from "@/constants/storage-keys";
import safeStorage from "@/lib/safe-storage";

export type OnboardingStep =
  | "welcome"
  | "auth"
  | "blocked"
  | "waitlist"
  | "referral"
  | "profile"
  | "address"
  | "completed";

const STEP_ORDER: OnboardingStep[] = [
  "welcome",
  "auth",
  "blocked",
  "waitlist",
  "referral",
  "profile",
  "address",
  "completed",
];

const STORAGE_KEY = STORAGE_KEYS.ONBOARDING_STEP;

type Listener = () => void;

let currentStep: OnboardingStep = "welcome";
let isLoaded = false;
const listeners = new Set<Listener>();

function emitChange() {
  listeners.forEach((l) => l());
}

function subscribe(listener: Listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return currentStep;
}

function getServerSnapshot(): OnboardingStep {
  return "welcome";
}

function getLoadedSnapshot() {
  return isLoaded;
}

function getLoadedServerSnapshot() {
  return false;
}

function loadStep() {
  const stored = safeStorage.getItem(STORAGE_KEY);
  if (stored && STEP_ORDER.includes(stored as OnboardingStep)) {
    currentStep = stored as OnboardingStep;
  }
  isLoaded = true;
  emitChange();
}

function setStep(step: OnboardingStep) {
  currentStep = step;
  emitChange();
  safeStorage.setItem(STORAGE_KEY, step);
}

function advanceStep() {
  const currentIndex = STEP_ORDER.indexOf(currentStep);
  if (currentIndex < STEP_ORDER.length - 1) {
    setStep(STEP_ORDER[currentIndex + 1]);
  }
}

function resetOnboarding() {
  setStep("welcome");
}

export function clearOnboardingStore() {
  currentStep = "welcome";
  isLoaded = false;
  safeStorage.removeItem(STORAGE_KEY);
  emitChange();
}

export function useOnboardingStore() {
  const step = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const loaded = useSyncExternalStore(subscribe, getLoadedSnapshot, getLoadedServerSnapshot);

  useEffect(() => {
    if (!isLoaded) loadStep();
  }, []);

  const stepIndex = useMemo(() => STEP_ORDER.indexOf(step), [step]);

  const canAccess = useCallback(
    (targetStep: OnboardingStep) => {
      const targetIndex = STEP_ORDER.indexOf(targetStep);
      return stepIndex >= targetIndex;
    },
    [stepIndex],
  );

  return {
    step,
    stepIndex,
    isLoaded: loaded,
    canAccess,
    advanceStep,
    setStep,
    resetOnboarding,
  };
}

export { STEP_ORDER };
