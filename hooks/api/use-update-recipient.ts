import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateRecipient } from "@/services/api";
import { queryKeys } from "@/constants/query-keys";
import type { CreateRecipientPayload } from "@/types/recipient";

export function useUpdateRecipient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CreateRecipientPayload }) =>
      updateRecipient(id, data),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: queryKeys.recipients.all });
      qc.invalidateQueries({
        queryKey: queryKeys.recipients.detail(variables.id),
      });
    },
  });
}
