import { useAuth } from "@clerk/nextjs";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/constants/query-keys";
import { getSupportConversations, sendSupportMessage } from "@/services/api";
import type { SendSupportMessageInput } from "@/types/support";

/**
 * The user's support threads. Polls every 15s so agent replies appear without a
 * manual refresh (the support service pushes replies via webhook + email; here
 * we render them by lightweight polling).
 */
export function useSupportConversations() {
  const { isSignedIn } = useAuth();
  return useQuery({
    queryKey: queryKeys.support.conversations,
    queryFn: getSupportConversations,
    enabled: !!isSignedIn,
    refetchInterval: 15_000,
  });
}

export function useSendSupportMessage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: SendSupportMessageInput) => sendSupportMessage(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.support.conversations });
    },
  });
}
