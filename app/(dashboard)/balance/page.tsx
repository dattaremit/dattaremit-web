"use client";

import { useState } from "react";
import { Wallet, Send } from "lucide-react";
import { useAccount, useMyTransferRequests } from "@/hooks/api";
import { Skeleton } from "@/components/ui/skeleton";
import { StatCard } from "@/components/ui/stat-card";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/motion/reveal";
import { BalanceSendDialog } from "@/components/transfer/balance-send-dialog";
import { formatInr } from "@/lib/money";
import { cn } from "@/lib/utils";
import type { TransferRequestStatus } from "@/types/transfer";

function formatUsd(amount: number) {
  return amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

const STATUS_STYLES: Record<TransferRequestStatus, string> = {
  PENDING: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  COMPLETED: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  REJECTED: "bg-destructive/15 text-destructive",
};

export default function BalancePage() {
  const { data: account, isLoading } = useAccount();
  const { data: requests, isLoading: requestsLoading } = useMyTransferRequests();
  const [sendOpen, setSendOpen] = useState(false);

  const balance = typeof account?.balance === "number" ? account.balance : 0;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-5 w-80" />
        <Skeleton className="h-32 w-full max-w-sm" />
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <Reveal>
        <div className="flex flex-col gap-3">
          <h1 className="font-semibold text-4xl leading-[1.05] text-foreground sm:text-5xl">
            Your <span className="text-brand">balance</span>.
          </h1>
          <p className="max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            Funds credited to your account. Send them to a recipient or your own bank — an admin
            settles the payout at the live rate.
          </p>
        </div>
      </Reveal>

      <Reveal direction="up" delay={0.05}>
        <div className="max-w-sm space-y-4">
          <StatCard
            label="Available balance"
            value={
              <>
                $<span className="text-brand">{formatUsd(balance)}</span>
              </>
            }
            hint="USD · credited by Dattaremit"
            icon={<Wallet className="size-4" />}
            accent
          />
          <Button
            size="lg"
            className="w-full"
            disabled={balance <= 0}
            onClick={() => setSendOpen(true)}
          >
            <Send className="size-4" />
            Send from balance
          </Button>
        </div>
      </Reveal>

      <Reveal direction="up" delay={0.1}>
        <div className="space-y-4">
          <h2 className="font-semibold text-lg text-foreground">Transfer requests</h2>
          {requestsLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          ) : !requests || requests.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No transfer requests yet. Use “Send from balance” to create one.
            </p>
          ) : (
            <ul className="space-y-2">
              {requests.map((req) => (
                <li
                  key={req.id}
                  className="flex items-center justify-between gap-4 rounded-xl border border-border bg-card p-4"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium text-foreground">{req.destinationLabel}</p>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      ${formatUsd(req.amountUsd)} → {formatInr(req.endAmountInr)} · ₹
                      {req.exchangeRate.toFixed(2)}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "shrink-0 rounded-full px-2.5 py-1 text-xs font-medium",
                      STATUS_STYLES[req.status],
                    )}
                  >
                    {req.status}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Reveal>

      <BalanceSendDialog open={sendOpen} onOpenChange={setSendOpen} />
    </div>
  );
}
