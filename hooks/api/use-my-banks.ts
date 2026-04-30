import { useAuth } from "@clerk/nextjs";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/constants/query-keys";
import {
  addMyBank,
  deleteMyBank,
  listMyBanks,
  setDefaultMyBank,
  updateMyBank,
} from "@/services/api";
import type { AddRecipientBankPayload, UpdateRecipientBankPayload } from "@/types/recipient";

export function useMyBanks() {
  const { isSignedIn } = useAuth();
  return useQuery({
    queryKey: queryKeys.myBanks.list(),
    queryFn: listMyBanks,
    enabled: !!isSignedIn,
  });
}

function useMyBanksInvalidations() {
  const qc = useQueryClient();
  return () => {
    qc.invalidateQueries({ queryKey: queryKeys.myBanks.all });
  };
}

export function useAddMyBank() {
  const invalidate = useMyBanksInvalidations();
  return useMutation({
    mutationFn: (data: AddRecipientBankPayload) => addMyBank(data),
    onSuccess: () => invalidate(),
  });
}

export function useUpdateMyBank() {
  const invalidate = useMyBanksInvalidations();
  return useMutation({
    mutationFn: ({ bankId, data }: { bankId: string; data: UpdateRecipientBankPayload }) =>
      updateMyBank(bankId, data),
    onSuccess: () => invalidate(),
  });
}

export function useSetDefaultMyBank() {
  const invalidate = useMyBanksInvalidations();
  return useMutation({
    mutationFn: (bankId: string) => setDefaultMyBank(bankId),
    onSuccess: () => invalidate(),
  });
}

export function useDeleteMyBank() {
  const invalidate = useMyBanksInvalidations();
  return useMutation({
    mutationFn: (bankId: string) => deleteMyBank(bankId),
    onSuccess: () => invalidate(),
  });
}
