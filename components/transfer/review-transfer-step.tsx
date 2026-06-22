"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Send, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { useExchangeRate } from "@/hooks/api/use-exchange-rate";
import { useRegularFee } from "@/hooks/api";
import { formatInr } from "@/lib/money";
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
  // Use the same server fee-aware quote as the amount step so the INR the user
  // sees here matches what they saw when entering the amount (fees deducted).
  const { data: feeQuote } = useRegularFee(amount);
  const inrPreview = feeQuote?.receiveAmount ?? null;

  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (!isSending) return;

    const timer = setInterval(() => {
      setSeconds((s) => s + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [isSending]);

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
          <Button
            variant="brand"
            size="lg"
            className="w-full relative overflow-hidden disabled:opacity-100 disabled:pointer-events-none"
            disabled={isSending}
            onClick={() => {
              setSeconds(0);
              onConfirm();
            }}
          >
            {isSending && (
              <motion.div
                initial={{ width: "0%" }}
                animate={{ width: `${Math.min((seconds / 10) * 100, 100)}%` }}
                transition={{ duration: 1, ease: "linear" }}
                className="absolute inset-y-0 left-0 bg-white/20 dark:bg-black/20"
              />
            )}
            <div className="relative z-10 flex items-center justify-center gap-2">
              {!isSending ? (
                <>
                  <Send className="size-4" />
                  Confirm and send
                </>
              ) : (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  <span className="flex items-center">
                    Processing...{" "}
                    <div className="relative w-[1.5ch] overflow-hidden ml-1 flex justify-center">
                      <AnimatePresence mode="popLayout">
                        <motion.span
                          key={seconds}
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          exit={{ y: -20, opacity: 0 }}
                          transition={{ type: "spring", stiffness: 300, damping: 30 }}
                          className="inline-block tabular-nums"
                        >
                          {seconds}
                        </motion.span>
                      </AnimatePresence>
                    </div>
                    s
                  </span>
                </>
              )}
            </div>
          </Button>
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
