"use client";

import { X } from "lucide-react";
import { dismissBanner, useNotificationBanner } from "@/store/notification-banner-store";
import { cn } from "@/lib/utils";

export function InAppBanner() {
  const banner = useNotificationBanner();
  if (!banner) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-50 flex justify-center px-4">
      <div
        className={cn(
          "pointer-events-auto w-full max-w-md rounded-lg border bg-background shadow-lg",
          "animate-in fade-in slide-in-from-top-2",
        )}
        role="status"
      >
        <div className="flex items-start gap-3 p-4">
          <div className="min-w-0 flex-1">
            <div className="truncate font-medium">{banner.title}</div>
            <div className="mt-0.5 text-sm text-muted-foreground">{banner.body}</div>
          </div>
          <button
            className="shrink-0 rounded-md p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            onClick={dismissBanner}
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
