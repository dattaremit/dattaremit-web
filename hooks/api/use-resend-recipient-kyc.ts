import { useMutation, useQueryClient } from "@tanstack/react-query";
import { resendRecipientKyc } from "@/services/api";
import { queryKeys } from "@/constants/query-keys";

export function useResendRecipientKyc() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: resendRecipientKyc,
    onSuccess: (_data, id) => {
      qc.invalidateQueries({ queryKey: queryKeys.recipients.detail(id) });
    },
  });
}
