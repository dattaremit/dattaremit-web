"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { STORAGE_KEYS } from "@/constants/storage-keys";
import safeStorage from "@/lib/safe-storage";
import { isValidReferralCode } from "@/schemas/referral.schema";

// Pull a referral code out of the current URL. Shared links land on
// app.dattaremit.com/?ref=CODE, but that route is auth-protected: Clerk
// redirects logged-out visitors to /sign-in and tucks the original URL into a
// redirect_url param, so we look there too.
function extractRef(search: string): string | null {
  const params = new URLSearchParams(search);

  const direct = params.get("ref");
  if (direct) return direct;

  const redirect = params.get("redirect_url");
  if (redirect) {
    try {
      const inner = new URL(redirect, window.location.origin);
      const nested = inner.searchParams.get("ref");
      if (nested) return nested;
    } catch {
      // Malformed redirect_url — nothing to capture.
    }
  }

  return null;
}

// Persists an inbound referral code to localStorage as early as possible (on
// the sign-in/sign-up page, before the post-signup redirect drops the URL), so
// the onboarding referral step can prefill it. Mounted once near the app root.
export function ReferralCapture() {
  const pathname = usePathname();

  useEffect(() => {
    const raw = extractRef(window.location.search);
    if (!raw) return;

    const code = raw.trim().toUpperCase();
    if (isValidReferralCode(code)) {
      safeStorage.setItem(STORAGE_KEYS.REFERRAL_CODE, code);
    }
    // Re-check on client navigations within the auth flow (e.g. sign-in → sign-up).
  }, [pathname]);

  return null;
}
