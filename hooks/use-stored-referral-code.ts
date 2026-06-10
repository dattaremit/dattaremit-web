"use client";

import { useSyncExternalStore } from "react";
import { STORAGE_KEYS } from "@/constants/storage-keys";
import safeStorage from "@/lib/safe-storage";

// Never subscribe — the stored code is written once by ReferralCapture before
// these screens mount, so a static read is enough.
const noopSubscribe = () => () => {};

// SSR-safe read of the referral code captured from an invite link (?ref=…).
// Uses useSyncExternalStore so the server renders "" and the client adopts the
// stored value after hydration — no hydration mismatch and no setState-in-effect.
export function useStoredReferralCode(): string {
  return useSyncExternalStore(
    noopSubscribe,
    () => safeStorage.getItem(STORAGE_KEYS.REFERRAL_CODE) ?? "",
    () => "",
  );
}
