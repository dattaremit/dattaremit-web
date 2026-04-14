"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useOnboardingStore } from "@/store/onboarding-store";
import { getAccount } from "@/services/api";
import { resolveOnboardingStep } from "@/lib/onboarding-utils";
import { ONBOARDING_STEP_ROUTES } from "@/constants/onboarding-routes";

/**
 * Fetches account status, resolves the onboarding step, updates the store,
 * and navigates to the correct screen. Called after sign-in/sign-up/SSO.
 */
export function usePostAuthRouting() {
  const router = useRouter();
  const { setStep } = useOnboardingStore();

  const routeAfterAuth = useCallback(async () => {
    try {
      const account = await getAccount();
      const step = resolveOnboardingStep(account);
      setStep(step);
      const route = ONBOARDING_STEP_ROUTES[step] ?? "/onboarding/profile";
      router.replace(route);
    } catch {
      setStep("profile");
      router.replace("/onboarding/profile");
    }
  }, [router, setStep]);

  return { routeAfterAuth };
}
