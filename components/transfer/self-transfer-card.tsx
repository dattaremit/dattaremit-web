"use client";

import Link from "next/link";
import { CheckCircle, ChevronRight, Landmark } from "lucide-react";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/constants/routes";

interface SelfTransferCardProps {
  /** Presence of a locally-saved Indian bank (the off-ramp destination). */
  hasUserBank: boolean;
}

export function SelfTransferCard({ hasUserBank }: SelfTransferCardProps) {
  // Every user pays out from a locally-saved Indian bank (Credible settles INR
  // into it after the trade) — readiness is purely "is a bank saved?". No Indian
  // KYC, no deposit account.
  let StatusIcon = Landmark;
  let statusLabel = "Add bank account";
  let statusClass = "text-warning";
  let href: string = ROUTES.ACCOUNT_BANKS;

  if (hasUserBank) {
    StatusIcon = CheckCircle;
    statusLabel = "Ready to send";
    statusClass = "text-success";
    href = ROUTES.SEND_SELF;
  }

  return (
    <Link
      href={href}
      aria-label="My Indian Account"
      className="group flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-soft transition-all hover:-translate-y-px hover:border-foreground/15 hover:shadow-lift"
    >
      <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-brand/15 text-brand">
        <Landmark className="size-5" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="font-semibold text-foreground">My Indian Account</div>
        <div className={cn("mt-0.5 flex items-center gap-1 text-xs font-medium", statusClass)}>
          <StatusIcon className="size-3" />
          {statusLabel}
        </div>
      </div>
      <ChevronRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-foreground" />
    </Link>
  );
}
