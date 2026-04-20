"use client";

import { useState } from "react";
import { UserPlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { AddRecipientWarningModal } from "@/components/transfer/add-recipient-warning-modal";
import { RecipientCard } from "@/components/recipients/recipient-card";
import { SelfTransferCard } from "@/components/transfer/self-transfer-card";
import type { Recipient } from "@/types/recipient";
import type { IndianKycStatus } from "@/types/api";

interface SelectRecipientStepProps {
  indianKycStatus: IndianKycStatus;
  hasDepositAccount: boolean;
  recipients: Recipient[] | undefined;
  isLoading: boolean;
  onSelect: (recipient: Recipient) => void;
  onAddRecipient: () => void;
}

export function SelectRecipientStep({
  indianKycStatus,
  hasDepositAccount,
  recipients,
  isLoading,
  onSelect,
  onAddRecipient,
}: SelectRecipientStepProps) {
  const [warningOpen, setWarningOpen] = useState(false);

  const eligible = recipients?.filter(
    (r) => r.kycStatus === "APPROVED" && r.hasBankAccount,
  );

  return (
    <>
      <PageHeader
        eyebrow="Step 1"
        title={
          <>
            Who&apos;s it{" "}
            <span className="text-brand">going to</span>?
          </>
        }
        subtitle="Pick a verified recipient. They&apos;ll receive funds in their linked bank."
      />

      <div className="space-y-3">
        <SelfTransferCard
          indianKycStatus={indianKycStatus}
          hasDepositAccount={hasDepositAccount}
        />
        <Button
          variant="outline"
          size="lg"
          className="w-full"
          onClick={() => setWarningOpen(true)}
        >
          <UserPlus />
          Add Recipient
        </Button>
      </div>

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
          title="No recipients yet"
          description="Add one to get started."
        />
      )}

      {eligible && eligible.length > 0 && (
        <div className="space-y-3">
          {eligible.map((r) => (
            <button
              key={r.id}
              className="block w-full text-left"
              onClick={() => onSelect(r)}
            >
              <RecipientCard recipient={r} />
            </button>
          ))}
        </div>
      )}

      <AddRecipientWarningModal
        open={warningOpen}
        onOpenChange={setWarningOpen}
        onConfirm={() => {
          setWarningOpen(false);
          onAddRecipient();
        }}
      />
    </>
  );
}
