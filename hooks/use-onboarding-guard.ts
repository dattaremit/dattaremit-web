"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useOnboardingStore } from "@/store/onboarding-store";
import { GUARD_STEP_ROUTES } from "@/constants/onboarding-routes";
import { ROUTES } from "@/constants/routes";

/**
 * Redirects users away from protected pages if they haven't
 * completed onboarding.
 */
export function useOnboardingGuard() {
  const router = useRouter();
  const { step, isLoaded } = useOnboardingStore();

  useEffect(() => {
    if (!isLoaded) return;
    if (step !== "completed") {
      const route = GUARD_STEP_ROUTES[step] ?? ROUTES.ONBOARDING.PROFILE;
      router.replace(route);
    }
  }, [isLoaded, step, router]);
}
