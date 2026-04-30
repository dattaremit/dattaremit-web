import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/constants/query-keys";
import type { AddExternalAccountPayload } from "@/types/api";
import { addExternalAccount } from "@/services/api";

export function useAddExternalAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AddExternalAccountPayload) => addExternalAccount(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.account });
    },
  });
}
