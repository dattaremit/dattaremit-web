import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addRecipientBank } from "@/services/api";
import { queryKeys } from "@/constants/query-keys";
import type { AddRecipientBankPayload } from "@/types/recipient";

export function useAddRecipientBank() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: AddRecipientBankPayload }) =>
      addRecipientBank(id, data),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: queryKeys.recipients.all });
      qc.invalidateQueries({
        queryKey: queryKeys.recipients.detail(variables.id),
      });
    },
  });
}
