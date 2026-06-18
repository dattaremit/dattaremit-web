import { api } from "./http-client";
import type {
  SendSupportMessageInput,
  SendSupportMessageResult,
  SupportConversation,
} from "@/types/support";

// Talks to our own server's support proxy (`/api/support/*`), which forwards to
// the standalone support service and keeps its API key server-side.
export const getSupportConversations = (): Promise<SupportConversation[]> =>
  api.get("/support/conversations");

export const sendSupportMessage = (
  input: SendSupportMessageInput,
): Promise<SendSupportMessageResult> => api.post("/support/contact", input);

// Browser-reachable SSE URL (with a short-lived token) for live agent replies.
export const getSupportStreamUrl = (): Promise<{ url: string }> => api.get("/support/stream-url");
