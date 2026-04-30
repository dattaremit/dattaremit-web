import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/constants/query-keys";
import type { AddDepositAccountPayload } from "@/types/api";
import { addDepositAccount } from "@/services/api";

export function useAddDepositAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AddDepositAccountPayload) => addDepositAccount(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.account });
    },
  });
}
