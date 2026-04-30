"use client";

import { useState } from "react";
import { Hourglass, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAccount } from "@/hooks/api";

export default function OnboardingWaitlistPage() {
  const { refetch } = useAccount();
  const [refreshing, setRefreshing] = useState(false);

  async function handleRefresh() {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  }

  return (
    <div className="flex flex-col items-center gap-5 text-center">
      <span className="flex size-16 items-center justify-center rounded-full bg-brand/10">
        <Hourglass className="size-7 text-brand" />
      </span>

      <h1 className="text-2xl font-semibold text-foreground">You&apos;re on the waitlist</h1>

      <p className="max-w-sm text-base leading-6 text-muted-foreground">
        Thanks for signing up! We&apos;re rolling out access gradually — we&apos;ll let you know as
        soon as your spot is ready.
      </p>

      <Button variant="outline" onClick={handleRefresh} disabled={refreshing} className="mt-2">
        <RefreshCw className="mr-2 size-4" />
        {refreshing ? "Checking…" : "Check status"}
      </Button>
    </div>
  );
}
