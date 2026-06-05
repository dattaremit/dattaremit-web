import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/constants/query-keys";
import type { AddNreBankAccountPayload } from "@/types/api";
import { addNreAccount } from "@/services/api";

/**
 * Saves the user's NRE bank account via POST /api/nre-bank-accounts (create or
 * replace). Invalidates the account query so `hasNreBank` refreshes.
 */
export function useAddNreAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AddNreBankAccountPayload) => addNreAccount(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.account });
    },
  });
}
