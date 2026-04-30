"use client";

import { Bell, BellOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useWebPush } from "@/hooks/use-web-push";
import { cn } from "@/lib/utils";

export function PushPreferencesCard() {
  const { status, loading, error, enable, disable } = useWebPush();

  if (status === "unsupported") return null;

  return (
    <Card variant="elevated" className="overflow-hidden">
      <div className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div
            className={cn(
              "flex size-11 items-center justify-center rounded-xl",
              status === "enabled" ? "bg-brand/15 text-brand" : "bg-muted text-muted-foreground",
            )}
          >
            {status === "enabled" ? <Bell className="size-5" /> : <BellOff className="size-5" />}
          </div>
          <div className="flex flex-col gap-1">
            <h3 className="font-semibold text-lg leading-tight text-foreground">
              Push notifications
            </h3>
            <p className="max-w-md text-sm text-muted-foreground">
              {status === "blocked"
                ? "You've blocked notifications. Update browser permissions to enable."
                : status === "enabled"
                  ? "You'll receive alerts on this device."
                  : "Get notified about transfers, KYC, and account updates."}
            </p>
            {error && <p className="mt-1 text-sm text-destructive">{error}</p>}
          </div>
        </div>
        <div className="shrink-0">
          {status === "enabled" ? (
            <Button variant="outline" onClick={disable} loading={loading}>
              Disable
            </Button>
          ) : status === "blocked" ? (
            <Button variant="outline" disabled>
              Blocked
            </Button>
          ) : (
            <Button variant="brand" onClick={enable} loading={loading}>
              Enable
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
