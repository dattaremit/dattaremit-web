"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence } from "motion/react";

import { useSelfSend, type SelfSendStep } from "@/hooks/use-self-send";
import type { SelfAccountType } from "@/types/transfer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BackLink } from "@/components/ui/back-link";
import { TransferResult } from "@/components/transfer/transfer-result";
import { SelectSelfAccountStep } from "@/components/transfer/select-self-account-step";
import { AddNreAccountStep } from "@/components/transfer/add-nre-account-step";
import { SelfAmountStep } from "@/components/transfer/self-amount-step";
import { SelfReviewStep } from "@/components/transfer/self-review-step";
import { StepTransition } from "@/components/motion/step-transition";
import { ROUTES } from "@/constants/routes";

const ACCOUNT_LABELS: Record<SelfAccountType, string> = {
  NRO: "your regular account",
  NRE: "your NRE account",
  UPI: "your UPI ID",
};

function parseAccountType(value: string | null): SelfAccountType | undefined {
  return value === "NRO" || value === "NRE" || value === "UPI" ? value : undefined;
}

export default function SendToSelfPage() {
  const router = useRouter();
  const search = useSearchParams();
  // The account picker on /send deep-links here with a pre-chosen destination,
  // jumping straight to the amount step (or the add-NRE form for an unlinked
  // NRE account) rather than replaying the picker.
  const initialAccountType = parseAccountType(search.get("account"));
  const initialStep: SelfSendStep | undefined = initialAccountType
    ? search.get("start") === "add-nre"
      ? "add-nre"
      : "amount"
    : undefined;
  const isDeepLinked = !!initialAccountType;
  const self = useSelfSend(
    initialAccountType ? { accountType: initialAccountType, step: initialStep } : undefined,
  );
  const accountLabel = ACCOUNT_LABELS[self.accountType];

  if (!self.hasRegularAccount) {
    return (
      <div className="mx-auto w-full max-w-lg space-y-7">
        <BackLink href="/" />
        <Card variant="elevated" className="p-7">
          <h2 className="font-semibold text-2xl text-foreground">Add a deposit account first</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            You need to link your own receiving bank account before you can send money to yourself.
          </p>
          <Button asChild variant="brand" className="mt-5">
            <Link href={ROUTES.ACCOUNT_BANKS}>Add Indian bank</Link>
          </Button>
        </Card>
      </div>
    );
  }

  if (self.step === "result") {
    return (
      <div className="mx-auto w-full max-w-lg space-y-6">
        {self.stepUpElement}
        <TransferResult
          status={self.sendError ? "error" : "success"}
          title={self.sendError ? "Transfer failed" : "Money on its way"}
          description={self.sendError ?? `You moved $${self.amount} to ${accountLabel}.`}
          transactionId={self.transactionId}
          onRetry={self.retryFromResult}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-2xl space-y-7">
      {self.stepUpElement}
      {(self.step === "amount" || self.step === "review") && (
        <button
          onClick={() => {
            if (self.step === "review") {
              self.setStep("amount");
            } else if (isDeepLinked) {
              // Came straight from the /send picker — go back to it, not the
              // local account step (which was skipped on a deep link).
              router.push(ROUTES.SEND);
            } else {
              self.setStep("select-account");
            }
          }}
          className="group inline-flex items-center gap-1.5 self-start text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground transition-colors hover:text-foreground"
        >
          ← Back
        </button>
      )}

      <AnimatePresence mode="wait">
        {self.step === "select-account" && (
          <StepTransition key="select-account">
            <SelectSelfAccountStep
              hasNreAccount={self.hasNreBank}
              nreAccount={self.nreAccount}
              regularAccountLast4={self.regularAccountLast4}
              nreFeeRate={self.selfFee?.nreFeeRate ?? 0}
              allowNre
              selected={self.accountType}
              onSelect={self.setAccountType}
              onAddNre={() => self.setStep("add-nre")}
              onContinue={() => self.setStep("amount")}
              onBack={() => router.push("/")}
            />
          </StepTransition>
        )}

        {self.step === "add-nre" && (
          <StepTransition key="add-nre">
            <AddNreAccountStep
              onSubmit={self.handleAddNre}
              onBack={() =>
                isDeepLinked ? router.push(ROUTES.SEND) : self.setStep("select-account")
              }
              isPending={self.addNre.isPending}
            />
          </StepTransition>
        )}

        {self.step === "amount" && (
          <StepTransition key="amount">
            <SelfAmountStep
              form={self.form}
              controls={self.controls}
              accountLabel={accountLabel}
              isUpi={self.isUpi}
              limitsHint={self.limitsHint}
              rate={self.rate}
              receiveAmount={self.receiveAmount}
              inrFeeLoss={self.inrFeeLoss}
              hasAmountError={self.hasAmountError}
              isInvalid={self.isInvalid}
              onSubmit={self.handleAmountSubmit}
            />
          </StepTransition>
        )}

        {self.step === "review" && (
          <StepTransition key="review">
            <SelfReviewStep
              amount={self.amount}
              accountLabel={accountLabel}
              receiveAmount={self.receiveAmount}
              inrFeeLoss={self.inrFeeLoss}
              note={self.note}
              paymentMethod={self.paymentMethod}
              upiId={self.upiId}
              isPending={self.sendToSelf.isPending}
              onConfirm={self.handleConfirm}
            />
          </StepTransition>
        )}
      </AnimatePresence>
    </div>
  );
}
