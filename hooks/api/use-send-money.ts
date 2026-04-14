import { useMutation, useQueryClient } from "@tanstack/react-query";
import { sendMoney } from "@/services/api";
import { queryKeys } from "@/constants/query-keys";
import type { SendMoneyPayload } from "@/types/transfer";

export function useSendMoney() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      payload,
      idempotencyKey,
    }: {
      payload: SendMoneyPayload;
      idempotencyKey?: string;
    }) => sendMoney(payload, idempotencyKey),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.activities.all });
      qc.invalidateQueries({ queryKey: queryKeys.account });
    },
  });
}
