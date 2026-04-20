"use client";

import Link from "next/link";
import {
  CheckCircle,
  ChevronRight,
  Clock,
  Landmark,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/constants/routes";
import type { IndianKycStatus } from "@/types/api";

interface SelfTransferCardProps {
  indianKycStatus: IndianKycStatus;
  hasDepositAccount: boolean;
}

export function SelfTransferCard({
  indianKycStatus,
  hasDepositAccount,
}: SelfTransferCardProps) {
  const isApproved = indianKycStatus === "APPROVED";
  const isPending = indianKycStatus === "PENDING";
  const isReady = isApproved && hasDepositAccount;

  let StatusIcon = Shield;
  let statusLabel = "Complete Indian KYC to unlock";
  let statusClass = "text-muted-foreground";
  let href: string = ROUTES.KYC_INDIAN;

  if (isReady) {
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
