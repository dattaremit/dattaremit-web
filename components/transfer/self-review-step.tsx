"use client";

import { Send } from "lucide-react";

import { formatInr } from "@/lib/money";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import type { PaymentMethod } from "@/types/transfer";

interface SelfReviewStepProps {
  amount: string;
  accountLabel: string;
  receiveAmount: number | null;
  inrFeeLoss: number | null;
  note: string;
  paymentMethod?: PaymentMethod;
  upiId?: string;
  isPending: boolean;
  onConfirm: () => void;
}

/** Final confirmation step of the self-send flow: amount headline, net receive
 *  (with any NRE fee loss), optional note, and the confirm action. */
export function SelfReviewStep({
  amount,
  accountLabel,
  receiveAmount,
  inrFeeLoss,
  note,
  paymentMethod = "BANK",
  upiId,
  isPending,
  onConfirm,
}: SelfReviewStepProps) {
  const isUpi = paymentMethod === "UPI";
  return (
    <>
      <PageHeader
        eyebrow="Confirm"
        title={
          <>
            One last <span className="text-brand">look</span>.
          </>
        }
      />

      <Card variant="elevated" className="overflow-hidden">
        <div className="relative border-b border-border bg-linear-to-br from-brand-soft/30 via-card to-card p-7 text-center">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-12 left-1/2 size-48 -translate-x-1/2 rounded-full bg-brand/15 blur-3xl"
          />
          <p className="relative text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Moving
          </p>
          <p className="relative mt-2 font-semibold text-5xl leading-none tabular text-foreground sm:text-6xl">
            ${amount}
          </p>
          <p className="relative mt-2 text-sm text-muted-foreground">to {accountLabel}</p>
          {receiveAmount !== null && (
            <p className="relative mt-3 text-sm text-muted-foreground">
              You&rsquo;ll receive{" "}
              <span className="font-semibold text-foreground tabular">
                {formatInr(receiveAmount)}
              </span>
              {inrFeeLoss != null && (
                <span className="mt-1 block text-xs text-muted-foreground">
                  You&rsquo;ll lose{" "}
                  <span className="font-medium text-destructive">{formatInr(inrFeeLoss)}</span> (NRE
                  fee)
                </span>
              )}
            </p>
          )}
        </div>

        {(isUpi || note) && (
          <div className="space-y-3 p-6 text-sm">
            {isUpi && (
              <div className="flex items-start justify-between gap-3">
                <span className="text-muted-foreground">UPI ID</span>
                <span className="text-right font-medium text-foreground">{upiId ?? "—"}</span>
              </div>
            )}
            {note && (
              <div className="flex items-start justify-between gap-3">
                <span className="text-muted-foreground">Note</span>
                <span className="text-right font-medium text-foreground">{note}</span>
              </div>
            )}
          </div>
        )}

        <div className="border-t border-border p-6">
          <Button
            variant="brand"
            size="lg"
            className="w-full"
            loading={isPending}
            onClick={onConfirm}
          >
            {!isPending && <Send />}
            Confirm
          </Button>
        </div>
      </Card>
    </>
  );
}
