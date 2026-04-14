import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createRecipient } from "@/services/api";
import { queryKeys } from "@/constants/query-keys";

export function useCreateRecipient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createRecipient,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.recipients.all });
    },
  });
}
