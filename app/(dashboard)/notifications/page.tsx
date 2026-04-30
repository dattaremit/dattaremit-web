"use client";

import { formatDistanceToNow } from "date-fns";
import { Bell, CheckCheck, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  useDeleteNotification,
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
} from "@/hooks/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { PushPreferencesCard } from "@/components/notifications/push-preferences-card";
import { cn } from "@/lib/utils";
import type { Notification } from "@/types/notification";

export default function NotificationsPage() {
  const { data, isLoading, error, refetch } = useNotifications();
  const markAllRead = useMarkAllNotificationsRead();
  const markRead = useMarkNotificationRead();
  const deleteOne = useDeleteNotification();

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Alerts"
        title={
          <>
            Stay in the <span className="text-brand">loop</span>.
          </>
        }
        subtitle="Updates about transfers, KYC, and your account."
        action={
          <Button
            variant="outline"
            size="sm"
            disabled={markAllRead.isPending || !data?.items.length}
            loading={markAllRead.isPending}
            onClick={async () => {
              try {
                await markAllRead.mutateAsync();
                toast.success("Marked all as read");
              } catch (err) {
                toast.error(err instanceof Error ? err.message : "Failed to mark read");
              }
            }}
          >
            {!markAllRead.isPending && <CheckCheck className="size-4" />}
            Mark all read
          </Button>
        }
      />

      <PushPreferencesCard />

      {isLoading && (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-2xl" />
          ))}
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-destructive/40 bg-destructive/5 p-4 text-center text-sm">
          <p className="text-destructive">
            {error instanceof Error ? error.message : "Failed to load notifications."}
          </p>
          <Button variant="outline" size="sm" className="mt-2" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      )}

      {!isLoading && data?.items.length === 0 && (
        <EmptyState
          icon={<Bell className="size-5" />}
          title="You're all caught up"
          description="When something happens in your account, it'll surface here."
        />
      )}

      {data && data.items.length > 0 && (
        <div className="space-y-2">
          {data.items.map((n) => (
            <NotificationRow
              key={n.id}
              notification={n}
              onRead={() => markRead.mutateAsync(n.id)}
              onDelete={() => deleteOne.mutateAsync(n.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function NotificationRow({
  notification: n,
  onRead,
  onDelete,
}: {
  notification: Notification;
  onRead: () => Promise<Notification>;
  onDelete: () => Promise<void>;
}) {
  return (
    <div
      className={cn(
        "group flex items-start gap-4 rounded-2xl border bg-card p-5 shadow-soft transition-all",
        !n.isRead && "border-brand/30 bg-gradient-to-br from-brand-soft/30 to-card",
      )}
    >
      {!n.isRead && (
        <span aria-hidden="true" className="mt-1.5 size-2 shrink-0 rounded-full bg-brand" />
      )}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate font-medium text-foreground">{n.title}</span>
          {!n.isRead && (
            <Badge variant="default" className="h-5 text-[10px]">
              New
            </Badge>
          )}
        </div>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{n.body}</p>
        <p className="mt-1 text-xs text-muted-foreground/70">
          {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
        </p>
      </div>
      <div className="flex flex-col gap-1 opacity-70 transition-opacity group-hover:opacity-100">
        {!n.isRead && (
          <Button variant="ghost" size="sm" onClick={() => onRead().catch(() => {})}>
            Mark read
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon-sm"
          className="text-muted-foreground hover:text-destructive"
          onClick={() => onDelete().catch(() => {})}
        >
          <Trash2 />
        </Button>
      </div>
    </div>
  );
}
