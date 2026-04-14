"use client";

import { formatDistanceToNow } from "date-fns";
import {
  Bell,
  CheckCheck,
  Loader2,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import {
  useDeleteNotification,
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
} from "@/hooks/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PushPreferencesCard } from "@/components/notifications/push-preferences-card";
import { cn } from "@/lib/utils";
import type { Notification } from "@/types/notification";

export default function NotificationsPage() {
  const { data, isLoading, error, refetch } = useNotifications();
  const markAllRead = useMarkAllNotificationsRead();
  const markRead = useMarkNotificationRead();
  const deleteOne = useDeleteNotification();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Notifications</h1>
          <p className="text-muted-foreground">
            Updates about your account, transfers, and KYC.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          disabled={markAllRead.isPending || !data?.items.length}
          onClick={async () => {
            try {
              await markAllRead.mutateAsync();
              toast.success("Marked all as read");
            } catch (err) {
              toast.error(
                err instanceof Error ? err.message : "Failed to mark read",
              );
            }
          }}
        >
          {markAllRead.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <CheckCheck className="h-4 w-4" />
          )}
          Mark all read
        </Button>
      </div>

      <PushPreferencesCard />

      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      )}

      {error && (
        <Card>
          <CardContent className="py-6 text-center">
            <p className="mb-3 text-destructive">
              {error instanceof Error
                ? error.message
                : "Failed to load notifications."}
            </p>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              Retry
            </Button>
          </CardContent>
        </Card>
      )}

      {!isLoading && data?.items.length === 0 && (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed py-16 text-center">
          <Bell className="h-10 w-10 text-muted-foreground" />
          <h2 className="font-semibold">You&apos;re all caught up</h2>
          <p className="text-sm text-muted-foreground">
            No notifications right now.
          </p>
        </div>
      )}

      <div className="space-y-2">
        {data?.items.map((n) => (
          <NotificationRow
            key={n.id}
            notification={n}
            onRead={() => markRead.mutateAsync(n.id)}
            onDelete={() => deleteOne.mutateAsync(n.id)}
          />
        ))}
      </div>
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
    <Card
      className={cn(
        "transition-colors",
        !n.isRead && "border-primary/50 bg-primary/5",
      )}
    >
      <CardContent className="flex items-start gap-3 p-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate font-medium">{n.title}</span>
            {!n.isRead && (
              <Badge variant="default" className="h-5 text-[10px]">
                New
              </Badge>
            )}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{n.body}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
          </p>
        </div>
        <div className="flex flex-col gap-1">
          {!n.isRead && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onRead().catch(() => {})}
            >
              Mark read
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="text-destructive hover:text-destructive"
            onClick={() => onDelete().catch(() => {})}
          >
            <Trash2 />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
