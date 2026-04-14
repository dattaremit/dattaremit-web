import { useMutation, useQueryClient } from "@tanstack/react-query";
import { sendToSelf } from "@/services/api";
import { queryKeys } from "@/constants/query-keys";
import type { SendToSelfPayload } from "@/types/transfer";

export function useSendToSelf() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      payload,
      idempotencyKey,
    }: {
      payload: SendToSelfPayload;
      idempotencyKey?: string;
    }) => sendToSelf(payload, idempotencyKey),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.activities.all });
      qc.invalidateQueries({ queryKey: queryKeys.account });
    },
  });
}
