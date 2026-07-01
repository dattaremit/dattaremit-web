"use client";

import { UserPlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { RecipientCard } from "@/components/recipients/recipient-card";
import { SelfDestinationOptions } from "@/components/transfer/self-destination-options";
import { isRecipientReady, type Recipient } from "@/types/recipient";

interface SelectRecipientStepProps {
  recipients: Recipient[] | undefined;
  isLoading: boolean;
  onSelect: (recipient: Recipient) => void;
  onAddRecipient: () => void;
}

export function SelectRecipientStep({
  recipients,
  isLoading,
  onSelect,
  onAddRecipient,
}: SelectRecipientStepProps) {
  const eligible = recipients?.filter((r) => isRecipientReady(r.kycStatus) && r.hasBankAccount);
  const pendingCount =
    recipients?.filter((r) => !isRecipientReady(r.kycStatus) || !r.hasBankAccount).length ?? 0;

  return (
    <>
      <div className="grid gap-6 md:grid-cols-2 md:gap-8">
        {/* Recipient column */}
        <section className="space-y-4">
          <ColumnHeading label="Send to someone" />

          <Button variant="outline" size="lg" className="w-full" onClick={onAddRecipient}>
            <UserPlus />
            Add Recipient
          </Button>

          {isLoading && (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          )}

          {!isLoading && (!eligible || eligible.length === 0) && (
            <EmptyState
              icon={<UserPlus className="size-5" />}
              title={pendingCount > 0 ? "Nobody's ready to send to yet" : "No recipients yet"}
              description={
                pendingCount > 0
                  ? `You have ${pendingCount} recipient${pendingCount === 1 ? "" : "s"} waiting on KYC or a bank link. Open one from the Recipients page to continue.`
                  : "Add one to get started."
              }
            />
          )}

          {eligible && eligible.length > 0 && (
            <div className="space-y-3">
              {eligible.map((r) => (
                <button key={r.id} className="block w-full text-left" onClick={() => onSelect(r)}>
                  <RecipientCard recipient={r} />
                </button>
              ))}
            </div>
          )}
        </section>

        {/* Self column — the three self-payout destinations, rendered inline
            instead of behind a link to /send/self. */}
        <section className="space-y-4">
          <ColumnHeading label="Send to yourself" />
          <SelfDestinationOptions />
        </section>
      </div>
    </>
  );
}

function ColumnHeading({ label }: { label: string }) {
  return (
    <h3 className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
      {label}
    </h3>
  );
}
