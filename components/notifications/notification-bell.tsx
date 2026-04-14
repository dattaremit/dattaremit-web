"use client";

import Link from "next/link";
import { Bell } from "lucide-react";
import { useUnreadCount } from "@/hooks/api";
import { MAX_BADGE_COUNT } from "@/constants/limits";
import { cn } from "@/lib/utils";

export function NotificationBell({
  className,
  href = "/notifications",
}: {
  className?: string;
  href?: string;
}) {
  const { data } = useUnreadCount();
  const count = data?.count ?? 0;
  const label = count > MAX_BADGE_COUNT ? `${MAX_BADGE_COUNT}+` : String(count);

  return (
    <Link
      href={href}
      className={cn(
        "relative inline-flex h-9 w-9 items-center justify-center rounded-md transition-colors hover:bg-accent",
        className,
      )}
      aria-label={count > 0 ? `${count} unread notifications` : "Notifications"}
    >
      <Bell className="h-5 w-5" />
      {count > 0 && (
        <span className="absolute -top-0.5 -right-0.5 flex min-w-[18px] items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold text-destructive-foreground">
          {label}
        </span>
      )}
    </Link>
  );
}
