"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { LifeBuoy, Send } from "lucide-react";
import { toast } from "sonner";

import { useSendSupportMessage, useSupportConversations } from "@/hooks/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";
import type { SupportConversation, SupportConversationStatus } from "@/types/support";

const STATUS_LABEL: Record<SupportConversationStatus, string> = {
  OPEN: "Open",
  PENDING: "Awaiting reply",
  CLOSED: "Resolved",
};

function ConversationThread({ conversation }: { conversation: SupportConversation }) {
  return (
    <div className="rounded-2xl border border-border bg-card">
      <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-3">
        <p className="truncate text-sm font-medium">{conversation.subject}</p>
        <Badge variant="secondary">{STATUS_LABEL[conversation.status]}</Badge>
      </div>
      <div className="flex flex-col gap-3 p-4">
        {conversation.messages.map((m) => {
          const mine = m.authorType === "CUSTOMER";
          return (
            <div
              key={m.id}
              className={cn("flex flex-col gap-1", mine ? "items-end" : "items-start")}
            >
              <div
                className={cn(
                  "max-w-[85%] whitespace-pre-wrap rounded-2xl px-3.5 py-2 text-sm",
                  mine
                    ? "rounded-br-sm bg-brand text-white"
                    : "rounded-bl-sm border border-border bg-background",
                )}
              >
                {m.body}
              </div>
              <span className="px-1 text-[11px] text-muted-foreground">
                {mine ? "You" : "Support"} ·{" "}
                {formatDistanceToNow(new Date(m.createdAt), { addSuffix: true })}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function SupportPage() {
  const { data: conversations, isLoading } = useSupportConversations();
  const send = useSendSupportMessage();
  const [message, setMessage] = useState("");

  async function onSend(e: React.FormEvent) {
    e.preventDefault();
    const text = message.trim();
    if (!text) return;
    try {
      await send.mutateAsync({ message: text });
      setMessage("");
      toast.success("Message sent. Our team will get back to you.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't send your message");
    }
  }

  const hasThreads = !!conversations && conversations.length > 0;

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Support"
        title={
          <>
            How can we <span className="text-brand">help</span>?
          </>
        }
        subtitle="Send us a message and we'll reply right here."
      />

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-24 w-full rounded-2xl" />
          <Skeleton className="h-24 w-full rounded-2xl" />
        </div>
      ) : hasThreads ? (
        <div className="space-y-4">
          {conversations!.map((c) => (
            <ConversationThread key={c.id} conversation={c} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<LifeBuoy className="size-5" />}
          title="No messages yet"
          description="Start a conversation below and our support team will respond."
        />
      )}

      <form onSubmit={onSend} className="space-y-3">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) onSend(e);
          }}
          rows={3}
          placeholder="Describe your issue…"
          className="flex w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-brand focus-visible:ring-3 focus-visible:ring-brand/20 disabled:opacity-50"
        />
        <div className="flex justify-end">
          <Button type="submit" loading={send.isPending} disabled={!message.trim()}>
            <Send className="size-4" />
            Send message
          </Button>
        </div>
      </form>
    </div>
  );
}
