"use client";

import { Bell, BellOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useWebPush } from "@/hooks/use-web-push";

export function PushPreferencesCard() {
  const { status, loading, error, enable, disable } = useWebPush();

  if (status === "unsupported") return null;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
            {status === "enabled" ? (
              <Bell className="h-5 w-5 text-primary" />
            ) : (
              <BellOff className="h-5 w-5 text-muted-foreground" />
            )}
          </div>
          <div className="flex-1">
            <CardTitle className="text-base">Push notifications</CardTitle>
            <CardDescription>
              {status === "blocked"
                ? "You've blocked notifications. Update browser permissions to enable."
                : status === "enabled"
                  ? "You'll receive alerts on this device."
                  : "Get notified about transfers, KYC, and account updates."}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {error && <p className="text-sm text-destructive">{error}</p>}
        {status === "enabled" ? (
          <Button variant="outline" onClick={disable} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Disable notifications
          </Button>
        ) : status === "blocked" ? (
          <Button variant="outline" disabled>
            Blocked in browser
          </Button>
        ) : (
          <Button onClick={enable} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Enable notifications
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
