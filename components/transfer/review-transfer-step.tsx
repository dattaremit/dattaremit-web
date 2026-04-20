"use client";

import { Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import type { Recipient } from "@/types/recipient";

interface ReviewTransferStepProps {
  recipient: Recipient;
  amount: string;
  note: string;
  isSending: boolean;
  onConfirm: () => void;
}

export function ReviewTransferStep({
  recipient,
  amount,
  note,
  isSending,
  onConfirm,
}: ReviewTransferStepProps) {
  return (
    <>
      <PageHeader
        eyebrow="Step 3"
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
        </div>

        <div className="space-y-3 p-6 text-sm">
          <Row label="Bank">
            {recipient.bankName} · {recipient.bankAccountNumberMasked}
          </Row>
          <Row label="Recipient">{recipient.email}</Row>
          {note && <Row label="Note">{note}</Row>}
          <Row label="Estimated arrival">
            <span className="text-brand">~60 seconds</span>
          </Row>
        </div>

        <div className="border-t border-border p-6">
          <Button
            variant="brand"
            size="lg"
            className="w-full"
            loading={isSending}
            onClick={onConfirm}
          >
            {!isSending && <Send />}
            Confirm and send
          </Button>
        </div>
      </Card>
    </>
  );
}

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-dashed border-border/60 pb-3 last:border-0 last:pb-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium text-foreground">{children}</span>
    </div>
  );
}
