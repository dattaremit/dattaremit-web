"use client";

import { useState } from "react";
import { Check, Copy, Gift, Share2, Users } from "lucide-react";
import { toast } from "sonner";
import { useMyReferral } from "@/hooks/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ShareDialog } from "@/components/share-dialog";

export function ReferralCard() {
  const { data, isLoading, isError, refetch } = useMyReferral();
  const [copied, setCopied] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  const code = data?.referCode ?? "";
  const totalReferrals = data?.totalReferrals ?? 0;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      toast.success("Referral code copied");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Couldn't copy. Please copy the code manually.");
    }
  };

  if (isLoading) {
    return <Skeleton className="h-44 w-full rounded-2xl" />;
  }

  if (isError || !code) {
    return (
      <Card variant="elevated" className="flex flex-col items-center gap-3 p-6 text-center">
        <p className="text-sm text-muted-foreground">We couldn&apos;t load your referral code.</p>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          Try again
        </Button>
      </Card>
    );
  }

  return (
    <Card variant="elevated" className="relative overflow-hidden border-brand/15 p-6">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-12 -right-12 size-48 rounded-full bg-brand/15 blur-3xl"
      />
      <div className="relative flex flex-col gap-5">
        <div className="flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand/15 text-brand">
            <Gift className="size-5" />
          </div>
          <div className="flex flex-col gap-0.5">
            <h2 className="font-semibold text-lg leading-tight text-foreground">Invite friends</h2>
            <p className="text-sm text-muted-foreground">
              Share your code so friends can add it when they sign up.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <span className="px-1 text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Your referral code
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="flex flex-1 items-center justify-between gap-3 rounded-xl border border-dashed border-brand/30 bg-brand/5 px-4 py-3 text-left transition-colors hover:bg-brand/10"
            >
              <span className="font-mono text-lg font-semibold tracking-wider text-foreground">
                {code}
              </span>
              {copied ? (
                <Check className="size-4 shrink-0 text-brand" />
              ) : (
                <Copy className="size-4 shrink-0 text-muted-foreground" />
              )}
            </button>
            <Button variant="brand" size="lg" onClick={() => setShareOpen(true)} className="gap-2">
              <Share2 className="size-4" />
              Share
            </Button>
          </div>
        </div>

        <ShareDialog open={shareOpen} onOpenChange={setShareOpen} code={code} />

        <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/30 px-4 py-3">
          <span className="flex size-9 items-center justify-center rounded-full bg-background text-muted-foreground">
            <Users className="size-4" />
          </span>
          <div className="flex flex-col">
            <span className="text-xl font-semibold leading-none text-foreground">
              {totalReferrals}
            </span>
            <span className="text-xs text-muted-foreground">
              {totalReferrals === 1 ? "friend joined" : "friends joined"}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}
