import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/constants/query-keys";
import type { AddDepositAccountPayload } from "@/types/api";
import { addNreAccount } from "@/services/api";

/**
 * Adds the user's NRE deposit account. Mirrors {@link useAddDepositAccount};
 * the backend endpoint is a placeholder until the real one is provided.
 */
export function useAddNreAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AddDepositAccountPayload) => addNreAccount(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.account });
    },
  });
}
