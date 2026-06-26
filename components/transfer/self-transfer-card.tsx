"use client";

import Link from "next/link";
import { CheckCircle, ChevronRight, Landmark } from "lucide-react";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/constants/routes";

interface SelfTransferCardProps {
  /** Presence of a locally-saved Indian bank — the self off-ramp destination. */
  hasUserBank: boolean;
}

export function SelfTransferCard({ hasUserBank }: SelfTransferCardProps) {
  // Readiness is purely "is an Indian bank saved?" — no Indian KYC, every user
  // off-ramps via the saved /api/banks bank.
  const StatusIcon = hasUserBank ? CheckCircle : Landmark;
  const statusLabel = hasUserBank ? "Ready to send" : "Add bank account";
  const statusClass = hasUserBank ? "text-success" : "text-warning";
  const href = hasUserBank ? ROUTES.SEND_SELF : ROUTES.ACCOUNT_BANKS;

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
