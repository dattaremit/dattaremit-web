"use client";

import { STORAGE_KEYS } from "@/constants/storage-keys";

type ClerkSignOut = (options?: { redirectUrl?: string }) => Promise<void>;

export async function signOutWithCleanup(
  signOut: ClerkSignOut,
  options?: Parameters<ClerkSignOut>[0],
) {
  try {
    window.localStorage.removeItem(STORAGE_KEYS.ONBOARDING_STEP);
  } catch {
    // localStorage unavailable — proceed with Clerk sign-out anyway
  }
  await signOut(options);
}
