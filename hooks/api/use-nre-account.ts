import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/constants/query-keys";
import type { AddNreBankAccountPayload } from "@/types/api";
import { addNreAccount, getNreBankAccount } from "@/services/api";

/**
 * Fetches the user's linked NRE bank account via GET /api/nre-bank-accounts.
 * Returns null when none is linked. Pass `enabled: false` to skip the request
 * (e.g. when `hasNreBank` is already known to be false).
 */
export function useNreAccount(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.nreAccount,
    queryFn: getNreBankAccount,
    enabled: options?.enabled ?? true,
  });
}

/**
 * Saves the user's NRE bank account via POST /api/nre-bank-accounts (create or
 * replace). Invalidates the account query so `hasNreBank` refreshes, and the
 * nre-account query so the newly linked bank's details show.
 */
export function useAddNreAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AddNreBankAccountPayload) => addNreAccount(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.account });
      queryClient.invalidateQueries({ queryKey: queryKeys.nreAccount });
    },
  });
}
