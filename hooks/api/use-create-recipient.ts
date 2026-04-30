import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createRecipient } from "@/services/api";
import { queryKeys } from "@/constants/query-keys";

export function useCreateRecipient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof createRecipient>[0]) => createRecipient(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.recipients.all });
    },
  });
}
