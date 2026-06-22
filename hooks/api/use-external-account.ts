import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/constants/query-keys";
import type { AddExternalAccountPayload } from "@/types/api";
import { addExternalAccount, getExternalAccount } from "@/services/api";

export function useAddExternalAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AddExternalAccountPayload) => addExternalAccount(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.account });
      queryClient.invalidateQueries({ queryKey: queryKeys.externalAccount });
    },
  });
}

/**
 * Linked US (Plaid) funding account display details. Fetched from the provider
 * on demand, so only enable it once a bank is actually linked. Details are
 * stable between re-links, hence the long stale time.
 */
export function useExternalAccount(enabled = true) {
  return useQuery({
    queryKey: queryKeys.externalAccount,
    queryFn: getExternalAccount,
    enabled,
    staleTime: 5 * 60_000,
  });
}
