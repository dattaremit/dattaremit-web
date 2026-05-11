"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { useForm, type Resolver } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Send } from "lucide-react";
import { AnimatePresence, motion, useAnimation } from "motion/react";

import { transferAmountSchema, type TransferAmountFormData } from "@/schemas/transfer.schema";
import { useAccount, useSendLimits, useSendToSelf } from "@/hooks/api";
import { useSendMoneyState } from "@/hooks/use-send-money-state";
import { dollarsToCents } from "@/lib/money";
import { dailyCapFor, validateAmountAgainstLimits, weeklyRemaining } from "@/lib/send-limits";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { TextField } from "@/components/ui/text-field";
import { PageHeader } from "@/components/ui/page-header";
import { BackLink } from "@/components/ui/back-link";
import { TransferResult } from "@/components/transfer/transfer-result";
import { useStepUp } from "@/hooks/use-step-up";
import { ROUTES } from "@/constants/routes";
import { StepTransition } from "@/components/motion/step-transition";

type Step = "amount" | "review" | "result";

export default function SendToSelfPage() {
  const { data: account } = useAccount();
  const sendToSelf = useSendToSelf();
  const { gate, stepUpElement } = useStepUp({
    title: "Confirm transfer",
    description: "We emailed you a 6-digit code. Enter it to authorize moving funds.",
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
  } = useSendMoneyState<Step>("amount");

  const form = useForm<TransferAmountFormData>({
    resolver: yupResolver(transferAmountSchema) as unknown as Resolver<TransferAmountFormData>,
    defaultValues: { amount: "", note: "" },
    // Re-run the resolver on every change so the red-border + Continue
    // disabled state track the user as they type, not just on submit.
    mode: "onChange",
  });
  const { data: limits } = useSendLimits();
  const watchedAmount = form.watch("amount");
  const amountError = form.formState.errors.amount?.message;
  const hasAmountError = !!amountError;
  const isInvalid = hasAmountError || !watchedAmount?.trim();

  // Layer the SSN-tier / 7-day-cap check on top of yup's schema check.
  useEffect(() => {
    const limitError = validateAmountAgainstLimits(watchedAmount ?? "", limits);
    const current = form.getFieldState("amount").error;
    if (limitError) {
      if (current?.type !== "limits") {
        form.setError("amount", { type: "limits", message: limitError });
      }
    } else if (current?.type === "limits") {
      form.clearErrors("amount");
    }
  }, [watchedAmount, limits, form]);

  // Shake the input on the transition into the invalid state.
  const controls = useAnimation();
  const wasInvalidRef = useRef(false);
  useEffect(() => {
    if (hasAmountError && !wasInvalidRef.current) {
      controls.start({
        x: [0, -8, 8, -6, 6, 0],
        transition: { duration: 0.3, ease: "easeInOut" },
      });
    }
    wasInvalidRef.current = hasAmountError;
  }, [hasAmountError, controls]);

  const hasDepositAccount = !!account?.hasDepositAccount;
  const limitsHint = limits
    ? `$${weeklyRemaining(limits.past7DaysAmount).toLocaleString("en-US", {
        maximumFractionDigits: 2,
      })} left this week · daily cap $${dailyCapFor(limits.hasSsn).toLocaleString("en-US", {
        maximumFractionDigits: 2,
      })}`
    : undefined;

  if (!hasDepositAccount) {
    return (
      <div className="mx-auto w-full max-w-lg space-y-7">
        <BackLink href="/" />
        <Card variant="elevated" className="p-7">
          <h2 className="font-semibold text-2xl text-foreground">Add a deposit account first</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            You need to link your own receiving bank account before you can send money to yourself.
          </p>
          <Button asChild variant="brand" className="mt-5">
            <Link href={ROUTES.LINK_BANK_RECEIVE}>Link deposit account</Link>
          </Button>
        </Card>
      </div>
    );
  }

  if (step === "result") {
    return (
      <div className="mx-auto w-full max-w-lg space-y-6">
        {stepUpElement}
        <TransferResult
          status={sendError ? "error" : "success"}
          title={sendError ? "Transfer failed" : "Money on its way"}
          description={sendError ?? `You moved $${amount} to your own account.`}
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

  return (
    <div className="mx-auto w-full max-w-2xl space-y-7">
      {stepUpElement}
      {step === "amount" ? (
        <BackLink href="/" />
      ) : (
        <button
          onClick={() => setStep("amount")}
          className="group inline-flex items-center gap-1.5 self-start text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground transition-colors hover:text-foreground"
        >
          ← Back
        </button>
      )}

      <AnimatePresence mode="wait">
        {step === "amount" && (
          <StepTransition key="amount">
            <PageHeader
              eyebrow="Self-send"
              title={
                <>
                  Move to <span className="text-brand">yourself</span>.
                </>
              }
              subtitle="Funds go to your linked deposit account."
            />

            <Card variant="elevated" className="p-6 sm:p-8">
              <Form {...form}>
                <form
                  className="space-y-5"
                  onSubmit={form.handleSubmit((data) => {
                    const limitError = validateAmountAgainstLimits(data.amount, limits);
                    if (limitError) {
                      form.setError("amount", { type: "limits", message: limitError });
                      return;
                    }
                    setAmount(data.amount);
                    setNote(data.note ?? "");
                    setStep("review");
                  })}
                >
                  <motion.div animate={controls}>
                    <TextField
                      control={form.control}
                      name="amount"
                      label="Amount"
                      inputMode="decimal"
                      placeholder="100.00"
                      leading={
                        <span className="font-semibold text-base text-muted-foreground">$</span>
                      }
                      inputClassName="font-semibold text-2xl h-14 tabular pl-9"
                      description={limitsHint}
                    />
                  </motion.div>
                  <TextField
                    control={form.control}
                    name="note"
                    label="Note"
                    placeholder="What's it for?"
                  />
                  <Button
                    type="submit"
                    variant="brand"
                    size="lg"
                    className="w-full"
                    disabled={isInvalid}
                  >
                    Continue
                  </Button>
                </form>
              </Form>
            </Card>
          </StepTransition>
        )}

        {step === "review" && (
          <StepTransition key="review">
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
                <p className="relative mt-2 text-sm text-muted-foreground">to your own account</p>
              </div>

              {note && (
                <div className="space-y-3 p-6 text-sm">
                  <div className="flex items-start justify-between gap-3">
                    <span className="text-muted-foreground">Note</span>
                    <span className="text-right font-medium text-foreground">{note}</span>
                  </div>
                </div>
              )}

              <div className="border-t border-border p-6">
                <Button
                  variant="brand"
                  size="lg"
                  className="w-full"
                  loading={sendToSelf.isPending}
                  onClick={async () => {
                    setSendError(null);
                    // Track failures via a local variable: setSendError() schedules
                    // a state update, but the closure below would still see the
                    // previous render's sendError, so we'd never navigate to the
                    // result screen on first failure.
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
                        return await sendToSelf.mutateAsync({
                          payload: { amountCents, note: note || undefined },
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
                  }}
                >
                  {!sendToSelf.isPending && <Send />}
                  Confirm
                </Button>
              </div>
            </Card>
          </StepTransition>
        )}
      </AnimatePresence>
    </div>
  );
}
