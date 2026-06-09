"use client";

import { AlertTriangle } from "lucide-react";

import { formatRatePercent } from "@/lib/money";

interface NreFeeNoticeProps {
  /** Fee fraction of the payout (0.003 = 0.3%). No notice renders when 0. */
  feeRate: number;
  className?: string;
}

/**
 * Heads-up shown when the user picks their own NRE account: a fee is deducted
 * from what they receive. The concrete after-fee amount is shown later on the
 * amount/review screens (the "You'll receive" figure is already net of this
 * fee). Intentionally mentions only the fee and the user's own NRE account —
 * never the underlying payout rails.
 */
export function NreFeeNotice({ feeRate, className }: NreFeeNoticeProps) {
  if (!feeRate || feeRate <= 0) return null;

  return (
    <div className={`flex items-start gap-3 rounded-xl bg-warning/10 px-4 py-3 ${className ?? ""}`}>
      <AlertTriangle className="mt-0.5 size-4 shrink-0 text-warning" />
      <div className="text-sm">
        <p className="font-semibold text-warning">A {formatRatePercent(feeRate)} fee applies</p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          It&rsquo;s deducted from the amount you receive in your NRE account.
        </p>
      </div>
    </div>
  );
}
