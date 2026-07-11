import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import { queryKeys } from "@/constants/query-keys";
import { createTransferRequest, getMyTransferRequests } from "@/services/api";
import type { CreateTransferRequestPayload } from "@/types/transfer";

/** The current user's balance-send requests, newest first. */
export function useMyTransferRequests() {
  const { isSignedIn } = useAuth();
  return useQuery({
    queryKey: queryKeys.transferRequests,
    queryFn: getMyTransferRequests,
    enabled: !!isSignedIn,
  });
}

/**
 * Files a balance-send request. On success refreshes the request list and the
 * account query (the USD amount was just deducted from the user's balance).
 */
export function useCreateTransferRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      payload,
      idempotencyKey,
    }: {
      payload: CreateTransferRequestPayload;
      idempotencyKey?: string;
    }) => createTransferRequest(payload, idempotencyKey),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.transferRequests });
      queryClient.invalidateQueries({ queryKey: queryKeys.account });
    },
  });
}
