"use client";

import Link from "next/link";
import { CheckCircle, ChevronRight, Clock, Landmark, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/constants/routes";
import type { IndianKycStatus } from "@/types/api";

interface SelfTransferCardProps {
  indianKycStatus: IndianKycStatus;
  hasDepositAccount: boolean;
  /** US citizens off-ramp to a locally-saved Indian bank with no Indian KYC. */
  isUsCitizen: boolean;
  /** Presence of a locally-saved bank (the US-citizen off-ramp destination). */
  hasUserBank: boolean;
}

export function SelfTransferCard({
  indianKycStatus,
  hasDepositAccount,
  isUsCitizen,
  hasUserBank,
}: SelfTransferCardProps) {
  let StatusIcon = Shield;
  let statusLabel = "Complete Indian KYC to unlock";
  let statusClass = "text-muted-foreground";
  let href: string = ROUTES.KYC_INDIAN;

  if (isUsCitizen) {
    // No Indian KYC for US citizens — readiness is purely "is a bank saved?".
    if (hasUserBank) {
      StatusIcon = CheckCircle;
      statusLabel = "Ready to send";
      statusClass = "text-success";
      href = ROUTES.SEND_SELF;
    } else {
      StatusIcon = Landmark;
      statusLabel = "Add bank account";
      statusClass = "text-warning";
      href = ROUTES.ACCOUNT_BANKS;
    }
  } else {
    const isApproved = indianKycStatus === "APPROVED";
    const isPending = indianKycStatus === "PENDING";

    if (isApproved && hasDepositAccount) {
      StatusIcon = CheckCircle;
      statusLabel = "Ready to send";
      statusClass = "text-success";
      href = ROUTES.SEND_SELF;
    } else if (isApproved && !hasDepositAccount) {
      StatusIcon = Landmark;
      statusLabel = "Add bank account";
      statusClass = "text-warning";
      href = ROUTES.LINK_BANK_RECEIVE;
    } else if (isPending) {
      StatusIcon = Clock;
      statusLabel = "Indian KYC pending…";
      statusClass = "text-warning";
      href = ROUTES.KYC_INDIAN;
    }
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
