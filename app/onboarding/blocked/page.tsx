"use client";

import { ShieldOff } from "lucide-react";

export default function OnboardingBlockedPage() {
  return (
    <div className="flex flex-col items-center gap-5 text-center">
      <span className="flex size-16 items-center justify-center rounded-full bg-destructive/10">
        <ShieldOff className="size-7 text-destructive" />
      </span>

      <h1 className="text-2xl font-semibold text-foreground">Access not available</h1>

      <p className="max-w-sm text-base leading-6 text-muted-foreground">
        This account isn&apos;t eligible for Dattapay at this time. If you think this is a mistake,
        please contact support.
      </p>
    </div>
  );
}
