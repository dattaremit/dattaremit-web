"use client";

import { useQuery } from "@tanstack/react-query";
import { getSendLimits } from "@/services/api";
import { queryKeys } from "@/constants/query-keys";
import type { SendLimits } from "@/types/transfer";

/**
 * Fetch the inputs the client needs to validate the send-amount input:
 * past 7-day spend (for the $15,000 weekly cap) and whether the user has
 * an SSN on file (which picks between the $5,000 / $2,999.99 daily cap).
 * Cached for 60s — these change rarely and the server is the authority.
 */
export function useSendLimits() {
  return useQuery<SendLimits>({
    queryKey: queryKeys.transferLimits,
    queryFn: getSendLimits,
    staleTime: 60_000,
  });
}
