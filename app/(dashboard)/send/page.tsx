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
import { dollarsToCents } from "@/lib/money";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StepTransition } from "@/components/motion/step-transition";
import { KycGate } from "@/components/kyc-gate";
import { TransferResult } from "@/components/transfer/transfer-result";
import { SelectRecipientStep } from "@/components/transfer/select-recipient-step";
import { SelectBankStep } from "@/components/transfer/select-bank-step";
import { TransferAmountStep } from "@/components/transfer/transfer-amount-step";
import { ReviewTransferStep } from "@/components/transfer/review-transfer-step";
import type { BankDetails, Recipient } from "@/types/recipient";

type Step = "select" | "selectBank" | "amount" | "review" | "result";

export default function SendPage() {
  const router = useRouter();
  const search = useSearchParams();
  const preselectedId = search.get("recipient");
  const preselectedBankId = search.get("bank");
  const { data: account } = useAccount();
  const { data: recipients, isLoading } = useRecipients();
  const sendMoney = useSendMoney();
  const { gate, stepUpElement } = useStepUp({
    title: "Confirm transfer",
    description: "We emailed you a 6-digit code. Enter it to authorize this send.",
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
  const [selectedBankId, setSelectedBankId] = useState<string | null>(preselectedBankId);

  const selected = useMemo<Recipient | undefined>(
    () => recipients?.find((r) => r.id === selectedId),
    [recipients, selectedId],
  );

  const selectedBank = useMemo<BankDetails | null>(() => {
    if (!selected) return null;
    if (selectedBankId) {
      return selected.banks.find((b) => b.id === selectedBankId) ?? null;
    }
    return selected.defaultBank ?? selected.banks[0] ?? null;
  }, [selected, selectedBankId]);

  /**
   * Pick the next step after the recipient is chosen: skip the bank picker
   * if there's a single bank (or none — the amount step will show the
   * "no bank" guardrail).
   */
  const advanceFromSelect = (r: Recipient) => {
    setSelectedId(r.id);
    if (r.banks.length > 1 && !selectedBankId) {
      setStep("selectBank");
    } else {
      setStep("amount");
    }
  };

  const confirmSend = async () => {
    if (!selected) return;
    setSendError(null);
    // Track failures via a local variable: setSendError() schedules a state
    // update, but the closure below would still see the previous render's
    // sendError, so we'd never navigate to the result screen on first failure.
    let errorMessage: string | null = null;
    const res = await gate(async () => {
      let amountCents: number;
      try {
        amountCents = dollarsToCents(amount);
      } catch (err) {
        errorMessage = err instanceof Error ? err.message : "Invalid amount";
        return undefined;
      }
      try {
        return await sendMoney.mutateAsync({
          payload: {
            recipientId: selected.id,
            bankDetailsId: selectedBank?.id ?? undefined,
            amountCents,
            note: note || undefined,
          },
          idempotencyKey,
        });
      } catch (err) {
        errorMessage = err instanceof Error ? err.message : "Transfer failed";
        return undefined;
      }
    });
    if (res) {
      setTransactionId(res.transactionId);
      setStep("result");
    } else if (errorMessage) {
      setSendError(errorMessage);
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
          <h2 className="font-semibold text-2xl text-foreground">Link a bank to send money</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Connect your US bank via Plaid so we know where to pull the funds from. Takes about a
            minute.
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

  // Visible step indices collapse the optional selectBank step so the user
  // sees a consistent "N of 3" count when there's only one bank.
  const VISIBLE_STEPS: Step[] =
    selected && selected.banks.length > 1
      ? ["select", "selectBank", "amount", "review"]
      : ["select", "amount", "review"];
  const currentVisibleIndex = VISIBLE_STEPS.indexOf(step);

  const backStep: Step =
    step === "review"
      ? "amount"
      : step === "amount"
        ? selected && selected.banks.length > 1
          ? "selectBank"
          : "select"
        : step === "selectBank"
          ? "select"
          : "select";

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-8">
      {stepUpElement}

      <div className="flex items-center justify-between gap-3">
        <Button
          variant="ghost"
          size="sm"
          className="-ml-2"
          asChild={step === "select"}
          onClick={step === "select" ? undefined : () => setStep(backStep)}
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
          {VISIBLE_STEPS.map((s, i) => {
            const isActive = i === currentVisibleIndex;
            const isDone = i < currentVisibleIndex;
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
              onSelect={(r) => advanceFromSelect(r)}
              onAddRecipient={() => router.push(ROUTES.RECIPIENTS_NEW)}
            />
          </StepTransition>
        )}

        {step === "selectBank" && selected && (
          <StepTransition key="selectBank">
            <SelectBankStep
              recipient={selected}
              selectedBankId={selectedBank?.id ?? null}
              onSelect={(bankId) => setSelectedBankId(bankId)}
              onContinue={() => setStep("amount")}
              onBack={() => setStep("select")}
            />
          </StepTransition>
        )}

        {step === "amount" && selected && (
          <StepTransition key="amount">
            <TransferAmountStep
              recipient={selected}
              selectedBank={selectedBank}
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
              selectedBank={selectedBank}
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
