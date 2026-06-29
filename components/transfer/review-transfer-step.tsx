"use client";

import { ConfirmSendButton } from "@/components/transfer/confirm-send-button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { useExchangeRate } from "@/hooks/api/use-exchange-rate";
import { formatInr, usdToInr } from "@/lib/money";
import type { BankDetails, Recipient } from "@/types/recipient";
import type { PaymentMethod } from "@/types/transfer";

interface ReviewTransferStepProps {
  recipient: Recipient;
  selectedBank?: BankDetails | null;
  amount: string;
  note: string;
  paymentMethod?: PaymentMethod;
  upiId?: string;
  isSending: boolean;
  onConfirm: () => void;
}

export function ReviewTransferStep({
  recipient,
  selectedBank,
  amount,
  note,
  paymentMethod = "BANK",
  upiId,
  isSending,
  onConfirm,
}: ReviewTransferStepProps) {
  const isUpi = paymentMethod === "UPI";
  const bank = selectedBank ?? recipient.defaultBank;
  const { data: rateData } = useExchangeRate();
  // Quote the live mid-market rate (USD × rate) — the same client-side calc as
  // the amount step — so the INR shown here matches what they saw when entering
  // the amount.
  const inrPreview = usdToInr(amount, rateData?.rate);

  return (
    <>
      <PageHeader
        eyebrow="Review"
        title={
          <>
            Confirm and <span className="text-brand">send</span>.
          </>
        }
        subtitle="One last look. Once you confirm, the funds are on their way."
      />

      <Card variant="elevated" className="overflow-hidden">
        <div className="relative border-b border-border bg-linear-to-br from-brand-soft/30 via-card to-card p-7 text-center">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-12 left-1/2 size-48 -translate-x-1/2 rounded-full bg-brand/15 blur-3xl"
          />
          <p className="relative text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Sending
          </p>
          <p className="relative mt-2 font-semibold text-5xl leading-none tabular text-foreground sm:text-6xl">
            ${amount}
          </p>
          <p className="relative mt-2 text-sm text-muted-foreground">
            to{" "}
            <span className="font-medium text-foreground">
              {recipient.firstName} {recipient.lastName}
            </span>
          </p>
          {inrPreview !== null && (
            <p className="relative mt-3 text-sm text-muted-foreground">
              They&rsquo;ll receive{" "}
              <span className="font-semibold text-foreground tabular">{formatInr(inrPreview)}</span>
            </p>
          )}
        </div>

        <div className="space-y-3 p-6 text-sm">
          {isUpi ? (
            <Row label="UPI ID">{upiId ?? "—"}</Row>
          ) : (
            <Row label="Bank">
              {bank
                ? `${bank.label ?? bank.bankName ?? "Bank"} · ${bank.bankAccountNumberMasked}`
                : "—"}
            </Row>
          )}
          <Row label="Recipient">{recipient.email}</Row>
          {note && <Row label="Note">{note}</Row>}
          {rateData?.rate && (
            <Row label="Exchange rate">
              <span className="tabular">1 USD = ₹{rateData.rate.toFixed(2)}</span>
            </Row>
          )}
          <Row label="Estimated arrival">
            <span className="text-brand">~60 seconds</span>
          </Row>
        </div>

        <div className="border-t border-border p-6">
          <ConfirmSendButton loading={isSending} onClick={onConfirm} estimatedSeconds={60} />
        </div>
      </Card>
    </>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-dashed border-border/60 pb-3 last:border-0 last:pb-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium text-foreground">{children}</span>
    </div>
  );
}
