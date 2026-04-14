"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/constants/query-keys";
import { getAccount } from "@/services/api";
import {
  computeOnboardingState,
  nextHref as computeNextHref,
} from "@/lib/onboarding-progress";

/**
 * Used by onboarding step pages to navigate after a save:
 *   - Refetches /account so derived state reflects the just-submitted change.
 *   - Routes to the next still-required step, or "/" if onboarding is done.
 *   - If the user was *editing* an already-complete step (i.e. nothing new
 *     became the next required step), they go back to the live step or to
 *     the dashboard.
 */
export function useOnboardingRouter() {
  const router = useRouter();
  const qc = useQueryClient();

  const goToNext = useCallback(async () => {
    // Refetch /account fresh; React Query won't have it yet from the mutation
    // because we don't pre-emptively setQueryData.
    const account = await qc.fetchQuery({
      queryKey: queryKeys.account,
      queryFn: getAccount,
      staleTime: 0,
    });
    const state = computeOnboardingState(account);
    router.replace(computeNextHref(state));
  }, [qc, router]);

  return { goToNext };
}
