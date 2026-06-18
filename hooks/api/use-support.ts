import { useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/constants/query-keys";
import { getSupportConversations, getSupportStreamUrl, sendSupportMessage } from "@/services/api";
import type { SendSupportMessageInput } from "@/types/support";

/**
 * The user's support threads. Agent replies arrive in real time over SSE
 * (EventSource → the support service); a slow poll is kept as a fallback in
 * case the stream drops.
 */
export function useSupportConversations() {
  const qc = useQueryClient();
  const { isSignedIn } = useAuth();

  const query = useQuery({
    queryKey: queryKeys.support.conversations,
    queryFn: getSupportConversations,
    enabled: !!isSignedIn,
    refetchInterval: 30_000,
  });

  useEffect(() => {
    if (!isSignedIn) return;
    let es: EventSource | null = null;
    let closed = false;

    getSupportStreamUrl()
      .then(({ url }) => {
        if (closed) return;
        es = new EventSource(url);
        const onMessage = () => qc.invalidateQueries({ queryKey: queryKeys.support.conversations });
        es.addEventListener("message.created", onMessage);
      })
      .catch(() => {
        /* fall back to polling */
      });

    return () => {
      closed = true;
      es?.close();
    };
  }, [isSignedIn, qc]);

  return query;
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
