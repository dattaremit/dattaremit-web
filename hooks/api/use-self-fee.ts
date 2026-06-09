"use client";

import { useQuery } from "@tanstack/react-query";
import { getSelfFee } from "@/services/api";
import { queryKeys } from "@/constants/query-keys";
import type { SelfFee } from "@/types/transfer";

/**
 * Fetch the fee applied to NRE self-transfers (a fraction of the payout, e.g.
 * 0.003 = 0.3%). Used to warn the user, before they confirm, how much the cut
 * costs. Admin-configurable and changes rarely, so it's cached for 5 minutes.
 */
export function useSelfFee() {
  return useQuery<SelfFee>({
    queryKey: queryKeys.selfFee,
    queryFn: getSelfFee,
    staleTime: 5 * 60_000,
  });
}
