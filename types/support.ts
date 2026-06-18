export type SupportMessageAuthor = "CUSTOMER" | "AGENT" | "SYSTEM";

export type SupportConversationStatus = "OPEN" | "PENDING" | "CLOSED";

export interface SupportMessage {
  id: string;
  body: string;
  authorType: SupportMessageAuthor;
  createdAt: string;
}

export interface SupportConversation {
  id: string;
  subject: string;
  status: SupportConversationStatus;
  lastMessageAt: string;
  createdAt: string;
  messages: SupportMessage[];
}

export interface SendSupportMessageInput {
  subject?: string;
  message: string;
}

export interface SendSupportMessageResult {
  conversationId: string;
  messageId: string;
}
