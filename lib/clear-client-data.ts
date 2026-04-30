import type { QueryClient } from "@tanstack/react-query";
import { STORAGE_KEYS } from "@/constants/storage-keys";
import { clearOnboardingStore } from "@/store/onboarding-store";
import { clearThemeStore } from "@/store/theme-store";
import safeStorage from "@/lib/safe-storage";

const NEXT_THEMES_KEY = "theme";

const KEYS_TO_CLEAR = [
  STORAGE_KEYS.WEB_PUSH_DEVICE_ID,
  STORAGE_KEYS.REFERRAL_CODE,
  NEXT_THEMES_KEY,
];

export function clearClientData(queryClient: QueryClient) {
  queryClient.clear();
  clearOnboardingStore();
  clearThemeStore();
  for (const key of KEYS_TO_CLEAR) {
    safeStorage.removeItem(key);
  }
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.clear();
  } catch {
    // Storage unavailable — nothing more to do.
  }
}
