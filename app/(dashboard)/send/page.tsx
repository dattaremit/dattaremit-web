"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, ArrowRight, Landmark } from "lucide-react";
import { AnimatePresence } from "motion/react";

import { useAccount, useRecipients, useSendMoney } from "@/hooks/api";
import { useSendMoneyState } from "@/hooks/use-send-money-state";
import { useStepUp } from "@/hooks/use-step-up";
import { ROUTES } from "@/constants/routes";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StepTransition } from "@/components/motion/step-transition";
import { KycGate } from "@/components/kyc-gate";
import { TransferResult } from "@/components/transfer/transfer-result";
import { SelectRecipientStep } from "@/components/transfer/select-recipient-step";
import { TransferAmountStep } from "@/components/transfer/transfer-amount-step";
import { ReviewTransferStep } from "@/components/transfer/review-transfer-step";
import type { Recipient } from "@/types/recipient";

type Step = "select" | "amount" | "review" | "result";

const STEP_ORDER: Step[] = ["select", "amount", "review", "result"];

export default function SendPage() {
  const router = useRouter();
  const search = useSearchParams();
  const preselectedId = search.get("recipient");
  const { data: account } = useAccount();
  const { data: recipients, isLoading } = useRecipients();
  const sendMoney = useSendMoney();
  const { gate, stepUpElement } = useStepUp({
    title: "Confirm transfer",
    description:
      "We emailed you a 6-digit code. Enter it to authorize this send.",
  });

  const {
    step,
    setStep,
    amount,
    setAmount,
    note,
    setNote,
    transactionId,
    setTransactionId,
    sendError,
    setSendError,
    idempotencyKey,
    resetIdempotencyKey,
  } = useSendMoneyState<Step>(preselectedId ? "amount" : "select");
  const [selectedId, setSelectedId] = useState<string | null>(preselectedId);

  const selected = useMemo<Recipient | undefined>(
    () => recipients?.find((r) => r.id === selectedId),
    [recipients, selectedId],
  );

  const confirmSend = async () => {
    if (!selected) return;
    setSendError(null);
    const res = await gate(async () => {
      const amountCents = Math.round(parseFloat(amount) * 100);
      try {
        return await sendMoney.mutateAsync({
          payload: {
            recipientId: selected.id,
            amountCents,
            note: note || undefined,
          },
          idempotencyKey,
        });
      } catch (err) {
        setSendError(err instanceof Error ? err.message : "Transfer failed");
        return undefined;
      }
    });
    if (res) {
      setTransactionId(res.transactionId);
      setStep("result");
    } else if (sendError) {
      setStep("result");
    }
  };

  if (step === "result") {
    return (
      <div className="mx-auto w-full max-w-lg">
        {stepUpElement}
        <TransferResult
          status={sendError ? "error" : "success"}
          title={sendError ? "Transfer failed" : "Money sent"}
          description={
            sendError
              ? sendError
              : `You sent $${amount} to ${selected?.firstName} ${selected?.lastName}.`
          }
          transactionId={transactionId}
          onRetry={() => {
            setSendError(null);
            resetIdempotencyKey();
            setStep("review");
          }}
        />
      </div>
    );
  }

  if (account && account.accountStatus !== "ACTIVE") {
    return (
      <div className="mx-auto w-full max-w-lg">
        <KycGate accountStatus={account.accountStatus} feature="sending money" />
      </div>
    );
  }

  if (account && !account.hasBankAccount) {
    return (
      <div className="mx-auto w-full max-w-lg">
        <Card variant="elevated" className="p-8 text-center">
          <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-2xl bg-brand/15 text-brand">
            <Landmark className="size-6" />
          </div>
          <h2 className="font-semibold text-2xl text-foreground">
            Link a bank to send money
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Connect your US bank via Plaid so we know where to pull the funds
            from. Takes about a minute.
          </p>
          <Button asChild variant="brand" className="mt-5">
            <Link href={ROUTES.LINK_BANK}>
              Connect bank
              <ArrowRight />
            </Link>
          </Button>
        </Card>
      </div>
    );
  }

  const stepIndex = STEP_ORDER.indexOf(step);

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-8">
      {stepUpElement}

      <div className="flex items-center justify-between gap-3">
        <Button
          variant="ghost"
          size="sm"
          className="-ml-2"
          asChild={step === "select"}
          onClick={
            step === "select"
              ? undefined
              : () => setStep(step === "review" ? "amount" : "select")
          }
        >
          {step === "select" ? (
            <Link href={ROUTES.ROOT}>
              <ArrowLeft />
              Home
            </Link>
          ) : (
            <>
              <ArrowLeft />
              Back
            </>
          )}
        </Button>
        <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          {(["select", "amount", "review"] as const).map((s, i) => {
            const isActive = STEP_ORDER.indexOf(s) === stepIndex;
            const isDone = STEP_ORDER.indexOf(s) < stepIndex;
            return (
              <div key={s} className="flex items-center gap-1.5">
                {i > 0 && <div className="h-px w-4 bg-border" />}
                <span
                  className={
                    isActive
                      ? "text-foreground"
                      : isDone
                        ? "text-brand"
                        : "text-muted-foreground/50"
                  }
                >
                  {i + 1}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {step === "select" && (
          <StepTransition key="select">
            <SelectRecipientStep
              indianKycStatus={account?.indianKycStatus ?? "NONE"}
              hasDepositAccount={!!account?.hasDepositAccount}
              recipients={recipients}
              isLoading={isLoading}
              onSelect={(r) => {
                setSelectedId(r.id);
                setStep("amount");
              }}
              onAddRecipient={() => router.push(ROUTES.RECIPIENTS_NEW)}
            />
          </StepTransition>
        )}

        {step === "amount" && selected && (
          <StepTransition key="amount">
            <TransferAmountStep
              recipient={selected}
              onContinue={({ amount: a, note: n }) => {
                setAmount(a);
                setNote(n);
                setStep("review");
              }}
            />
          </StepTransition>
        )}

        {step === "review" && selected && (
          <StepTransition key="review">
            <ReviewTransferStep
              recipient={selected}
              amount={amount}
              note={note}
              isSending={sendMoney.isPending}
              onConfirm={confirmSend}
            />
          </StepTransition>
        )}
      </AnimatePresence>
    </div>
  );
}
