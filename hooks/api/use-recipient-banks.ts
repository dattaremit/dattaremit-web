import { useAuth } from "@clerk/nextjs";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/constants/query-keys";
import {
  deleteRecipientBank,
  listRecipientBanks,
  setDefaultRecipientBank,
  updateRecipientBank,
} from "@/services/api";
import type { UpdateRecipientBankPayload } from "@/types/recipient";

export function useRecipientBanks(id: string | undefined) {
  const { isSignedIn } = useAuth();
  return useQuery({
    queryKey: id ? queryKeys.recipients.banks(id) : ["recipients", "banks", "noop"],
    queryFn: () => listRecipientBanks(id as string),
    enabled: !!isSignedIn && !!id,
  });
}

function useRecipientBankInvalidations() {
  const qc = useQueryClient();
  return (recipientId: string) => {
    qc.invalidateQueries({ queryKey: queryKeys.recipients.all });
    qc.invalidateQueries({ queryKey: queryKeys.recipients.detail(recipientId) });
    qc.invalidateQueries({ queryKey: queryKeys.recipients.banks(recipientId) });
  };
}

export function useUpdateRecipientBank() {
  const invalidate = useRecipientBankInvalidations();
  return useMutation({
    mutationFn: ({
      recipientId,
      bankId,
      data,
    }: {
      recipientId: string;
      bankId: string;
      data: UpdateRecipientBankPayload;
    }) => updateRecipientBank(recipientId, bankId, data),
    onSuccess: (_res, { recipientId }) => invalidate(recipientId),
  });
}

export function useSetDefaultRecipientBank() {
  const invalidate = useRecipientBankInvalidations();
  return useMutation({
    mutationFn: ({ recipientId, bankId }: { recipientId: string; bankId: string }) =>
      setDefaultRecipientBank(recipientId, bankId),
    onSuccess: (_res, { recipientId }) => invalidate(recipientId),
  });
}

export function useDeleteRecipientBank() {
  const invalidate = useRecipientBankInvalidations();
  return useMutation({
    mutationFn: ({ recipientId, bankId }: { recipientId: string; bankId: string }) =>
      deleteRecipientBank(recipientId, bankId),
    onSuccess: (_res, { recipientId }) => invalidate(recipientId),
  });
}
